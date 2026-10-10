// Removes em and en dashes from the copy of drafts waiting for review, by saving a new revision the same way the
// admin editor does. Dry run by default; --apply writes. Published revisions are never touched.
// Usage: npx tsx --env-file=.env scripts/clean-dashes.ts [--apply] [--only /about,/contact]
import { contentSchema, validateContent } from "../src/content";
import { pool, query, transaction } from "../src/db";
import { getDesign } from "../src/designs";
import { hasDash, plainDashes } from "../src/prompts/punctuation";

const apply = process.argv.includes("--apply");
const onlyFlag = process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? (process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined);
const only = onlyFlag ? new Set(onlyFlag.split(",")) : undefined;

function clean(content: any) {
  let count = 0;
  const fix = (v: string) => {
    if (!hasDash(v)) return v;
    count++;
    return plainDashes(v);
  };
  const next = JSON.parse(JSON.stringify(content));
  for (const s of next.pageSections ?? []) for (const [k, v] of Object.entries<any>(s.fields)) if (typeof v === "string") s.fields[k] = fix(v);
  if (next.seo) {
    for (const k of ["metaDescription", "answerSummary", "angle"]) if (typeof next.seo[k] === "string") next.seo[k] = fix(next.seo[k]);
    if (Array.isArray(next.seo.keyFacts)) next.seo.keyFacts = next.seo.keyFacts.map((v: string) => fix(v));
  }
  if (typeof next.description === "string") next.description = fix(next.description);
  return { next, count };
}

try {
  const runs = await query<any>(
    `SELECT DISTINCT ON (r.page_id) r.id run_id, r.page_id, r.result_revision_id, p.path, p.template, v.content
     FROM pipeline_runs r JOIN pages p ON p.id=r.page_id JOIN revisions v ON v.id=r.result_revision_id
     WHERE r.status='review' AND r.review_status='pending' AND r.result_revision_id IS DISTINCT FROM p.published_revision_id
     ORDER BY r.page_id, r.created_at DESC`,
  );
  let pages = 0, fields = 0;
  for (const r of runs) {
    if (only && !only.has(r.path)) continue;
    if (r.content.schemaVersion !== 3) continue;
    const { next, count } = clean(r.content);
    if (!count) continue;
    pages++;
    fields += count;
    console.log(`${r.path.padEnd(46)} ${count} fields`);
    if (!apply) continue;
    // Blueprint entries for sections the page no longer has are dead weight and fail validation; drop them.
    const ids = new Set((next.pageSections ?? []).map((s: any) => s.id));
    if (next.pageBlueprint) next.pageBlueprint = Object.fromEntries(Object.entries(next.pageBlueprint).filter(([id]) => ids.has(id)));
    const content = contentSchema.parse(next);
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
  console.log(`${apply ? "cleaned" : "would clean"} ${fields} fields on ${pages} drafts`);
} finally {
  await pool().end();
}
