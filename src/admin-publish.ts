import { transaction } from "./db";
import { blockingChecks, runContentQA } from "./content-qa";
import type { Content } from "./content";

export class PublishBlockedError extends Error {
  constructor(public blockers: string[]) {
    super("Publishing blocked: " + blockers.join("; "));
  }
}

/** Reasons a revision should not go live. Only version-three pages are gated. */
export function publishBlockers(
  content: Content,
  path: string,
  unreviewedImages: number,
): string[] {
  if (content.schemaVersion !== 3) return [];
  const blockers = [...content.unresolved];
  for (const check of blockingChecks(runContentQA(content, path)))
    blockers.push(check.label + (check.detail ? ` (${check.detail})` : ""));
  if (unreviewedImages)
    blockers.push(`${unreviewedImages} generated image${unreviewedImages > 1 ? "s" : ""} not yet accepted in Media`);
  return [...new Set(blockers)];
}

export async function publishPage(
  pageId: string,
  ownerId: string,
  revisionId?: string,
  override?: string,
) {
  return transaction(async (c) => {
    const [p] = (
      await c.query("SELECT * FROM pages WHERE id=$1 FOR UPDATE", [pageId])
    ).rows;
    if (!p) throw new Error("Page missing");
    const revision = revisionId ?? p.draft_revision_id;
    const [r] = (
      await c.query("SELECT * FROM revisions WHERE id=$1 AND page_id=$2", [
        revision,
        pageId,
      ])
    ).rows;
    if (!r) throw new Error("Revision missing");
    const assetIds = ((r.content as Content).pageSections ?? [])
      .map((s) => s.asset?.id)
      .filter((id): id is string => !!id);
    const unreviewed = assetIds.length
      ? (
          await c.query(
            "SELECT count(*)::int n FROM generated_assets WHERE id = ANY($1::uuid[]) AND review_status<>'accepted'",
            [assetIds],
          )
        ).rows[0].n
      : 0;
    const blockers = publishBlockers(r.content, p.path, unreviewed);
    if (blockers.length) {
      if (!override?.trim()) throw new PublishBlockedError(blockers);
      await c.query(
        "INSERT INTO audit_events(owner_id,action,entity_id,details) VALUES($1,'publish-override',$2,$3)",
        [ownerId, pageId, JSON.stringify({ revisionId: r.id, reason: override.trim().slice(0, 500), blockers })],
      );
    }
    await c.query(
      "INSERT INTO revision_reviews(revision_id,status,owner_id) VALUES($1,'accepted',$2) ON CONFLICT(revision_id) DO UPDATE SET status='accepted',owner_id=excluded.owner_id,reviewed_at=now()",
      [r.id, ownerId],
    );
    await c.query(
      "UPDATE pipeline_runs SET review_status='accepted',updated_at=now() WHERE result_revision_id=$1",
      [r.id],
    );
    const published = await c.query(
      "UPDATE pages SET published_revision_id=$1,title=$2,archived_at=NULL,first_published_at=COALESCE(first_published_at,now()),updated_at=now() WHERE id=$3 RETURNING id,path,title,published_revision_id,draft_revision_id,first_published_at,updated_at",
      [r.id, r.content.title, pageId],
    );
    return published.rows[0];
  });
}

/**
 * Publish every new-format draft that passes all quality checks. Generated
 * images on those drafts are accepted as part of publishing. Drafts with
 * failing checks or an active generation run are left untouched.
 */
export async function publishPassingDrafts(ownerId: string) {
  const { query } = await import("./db");
  const candidates = await query<{ id: string; path: string; content: Content }>(
    `SELECT p.id,p.path,r.content FROM pages p JOIN revisions r ON r.id=p.draft_revision_id
     WHERE p.archived_at IS NULL AND p.draft_revision_id IS DISTINCT FROM p.published_revision_id
       AND r.content->>'schemaVersion'='3'
       AND NOT EXISTS(SELECT 1 FROM pipeline_runs x WHERE x.page_id=p.id AND x.status IN ('queued','running'))`,
  );
  const published: string[] = [];
  const skipped: { path: string; reasons: string[] }[] = [];
  for (const page of candidates) {
    const reasons = publishBlockers(page.content, page.path, 0);
    if (reasons.length) {
      skipped.push({ path: page.path, reasons });
      continue;
    }
    const ids = (page.content.pageSections ?? []).flatMap((s) => (s.asset ? [s.asset.id] : []));
    if (ids.length)
      await query("UPDATE generated_assets SET review_status='accepted' WHERE id = ANY($1::uuid[]) AND review_status='pending'", [ids]);
    await publishPage(page.id, ownerId);
    published.push(page.path);
  }
  return { published, skipped };
}
