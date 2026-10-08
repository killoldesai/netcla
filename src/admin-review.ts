import { transaction } from "./db";
import { z } from "zod";
export async function reviewPage(
  pageId: string,
  revisionId: string,
  ownerId: string,
) {
  z.string().uuid().parse(pageId);
  z.string().uuid().parse(revisionId);
  await transaction(async (c) => {
    const page = (
      await c.query("SELECT * FROM pages WHERE id=$1 FOR UPDATE", [pageId])
    ).rows[0];
    if (!page || page.draft_revision_id !== revisionId)
      throw new Error("Draft changed. Review the current revision.");
    const revision = (
      await c.query(
        "SELECT content FROM revisions WHERE id=$1 AND page_id=$2",
        [revisionId, pageId],
      )
    ).rows[0];
    if (!revision) throw new Error("Revision missing");
    await c.query(
      "INSERT INTO revision_reviews(revision_id,status,owner_id) VALUES($1,'accepted',$2) ON CONFLICT(revision_id) DO UPDATE SET status='accepted',owner_id=excluded.owner_id,reviewed_at=now()",
      [revisionId, ownerId],
    );
    await c.query(
      "UPDATE pipeline_runs SET review_status='accepted',updated_at=now() WHERE result_revision_id=$1 AND status='review'",
      [revisionId],
    );
  });
}
