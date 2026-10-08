import { query, db } from "./db";
import type { Content } from "./content";
import { pages, revisions } from "./schema";
import { eq } from "drizzle-orm";
export type PageRecord = {
  id: string;
  path: string;
  template: string;
  title: string;
  kind: string;
  brief: Record<string, unknown>;
  content: Content;
  revision_id: string;
  created_at: string;
  updated_at: string;
  first_published_at: string;
};
export async function published(path: string) {
  const [p] = await db()
    .select({
      id: pages.id,
      path: pages.path,
      template: pages.template,
      title: pages.title,
      kind: pages.kind,
      brief: pages.brief,
      content: revisions.content,
      revision_id: revisions.id,
      created_at: revisions.createdAt,
      updated_at: pages.updatedAt,
      first_published_at: pages.firstPublishedAt,
    })
    .from(pages)
    .innerJoin(revisions, eq(revisions.id, pages.publishedRevisionId))
    .where(eq(pages.path, path))
    .limit(1);
  return (p as unknown as PageRecord) ?? null;
}
export async function preview(id: string, revision?: string) {
  const [p] = await query<PageRecord>(
    "SELECT p.*,r.content,r.id revision_id,r.created_at FROM pages p JOIN revisions r ON r.page_id=p.id AND r.id=COALESCE($2::uuid,p.draft_revision_id) WHERE p.id=$1",
    [id, revision ?? null],
  );
  return p ?? null;
}
export async function publishedPaths() {
  return query<{ path: string; title: string; updated_at: Date }>(
    "SELECT p.path,p.title,r.created_at updated_at FROM pages p JOIN revisions r ON r.id=p.published_revision_id WHERE p.archived_at IS NULL",
  );
}

export async function publishedListing() {
  return query<{
    path: string;
    kind: string;
    title: string;
    description: string;
  }>(
    "SELECT p.path,p.kind,r.content->>'title' title,r.content->>'description' description FROM pages p JOIN revisions r ON r.id=p.published_revision_id ORDER BY p.path",
  );
}
