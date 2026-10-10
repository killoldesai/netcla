// Cleans meta titles on drafts waiting for review (acronym casing, cut-off fragments) by saving a new
// revision, the same way the admin editor does. Dry run by default; --apply writes. Nothing is published.
import { contentSchema, validateContent } from "../src/content";
import { pool, query, transaction } from "../src/db";
import { getDesign } from "../src/designs";
import { isKeywordTitle, tidyMetaTitle } from "../src/prompts/meta-title";

const apply = process.argv.includes("--apply");
// --set "/path=New title" replaces one page's title by hand (for example a hub whose generated title picked one sector).
const overrides = new Map(process.argv.filter((a) => a.startsWith("--set=")).map((a) => { const [path, ...t] = a.slice(6).split("="); return [path, t.join("=")] as const; }));
try {
  const runs = await query<any>(
    `SELECT DISTINCT ON (r.page_id) r.id run_id, r.page_id, r.result_revision_id, p.path, p.template, v.content
     FROM pipeline_runs r JOIN pages p ON p.id=r.page_id JOIN revisions v ON v.id=r.result_revision_id
     WHERE r.status='review' AND r.review_status='pending' AND r.result_revision_id IS DISTINCT FROM p.published_revision_id
     ORDER BY r.page_id, r.created_at DESC`,
  );
  let changed = 0;
  for (const r of runs) {
    const before: string = r.content.seo?.metaTitle ?? r.content.title;
    // Only keyword-list titles; guides and company pages keep their own headline titles.
    if (!before || (!isKeywordTitle(before) && !overrides.has(r.path))) continue;
    const after = overrides.get(r.path) ?? tidyMetaTitle(before);
    if (after === before) continue;
    changed++;
    console.log(`${r.path.padEnd(42)} ${before}\n${"".padEnd(42)} -> ${after}`);
    if (!apply) continue;
    const content = contentSchema.parse({ ...r.content, title: after, seo: { ...r.content.seo, metaTitle: after } });
    const validation = validateContent(content, getDesign(r.template));
    if (validation.errors.length) {
      console.log("  skipped:", validation.errors.join("; "));
      continue;
    }
    await transaction(async (c) => {
      const saved = await c.query("INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'owner:v3') RETURNING id", [r.page_id, JSON.stringify(content), JSON.stringify(validation)]);
      await c.query("UPDATE pages SET draft_revision_id=$1,updated_at=now() WHERE id=$2 AND draft_revision_id=$3", [saved.rows[0].id, r.page_id, r.result_revision_id]);
      await c.query("UPDATE pipeline_runs SET result_revision_id=$1,review_status='pending',updated_at=now() WHERE id=$2", [saved.rows[0].id, r.run_id]);
    });
  }
  console.log(`${apply ? "patched" : "would patch"} ${changed} of ${runs.length} drafts`);
} finally {
  await pool().end();
}
