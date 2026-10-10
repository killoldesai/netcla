// Regenerate every page of one family as drafts (nothing is published).
// Usage: npx tsx --env-file=.env scripts/regen-family.ts <family> [--reuse-images] [--skip /a,/b]
// Needs the writing worker running. Queues pages in batches of five, retries a failed run once,
// then writes tmp/regen-<family>.json with one line of results per page.
import { mkdirSync, writeFileSync } from "node:fs";
import { runContentQA } from "../src/content-qa";
import { pool, query } from "../src/db";
import { familyOf, wordBands, type Family } from "../src/prompts/templates";
import { queuePages, retryRun } from "../src/publishing-pipeline";

const family = process.argv[2] as Family;
if (!family || !(family in wordBands)) throw new Error("Give a family: hub, service, technology, hire, industry or location");
const reuseImages = process.argv.includes("--reuse-images");
const skip = new Set((process.argv.find((a) => a.startsWith("--skip"))?.split(/[ =]/)[1] ?? process.argv[process.argv.indexOf("--skip") + 1] ?? "").split(",").filter(Boolean));
const words = (t: string) => String(t || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

try {
  const [job] = await query("SELECT provider,model FROM jobs WHERE status='completed' ORDER BY updated_at DESC LIMIT 1");
  const [last] = await query("SELECT image_model FROM pipeline_runs ORDER BY created_at DESC LIMIT 1");
  const pages = (await query<{ path: string; active: string }>(
    // Pages with a run already in review from the last day are done; re-running only repeats the cost.
    "SELECT p.path,(SELECT count(*) FROM pipeline_runs r WHERE r.page_id=p.id AND (r.status IN ('queued','running') OR (r.status='review' AND r.created_at>now()-interval '1 day'))) active FROM pages p WHERE p.archived_at IS NULL ORDER BY p.path",
  )).filter((p) => familyOf(p.path) === family && !skip.has(p.path) && Number(p.active) === 0);
  console.log(`${family}: ${pages.length} pages${reuseImages ? ", reusing existing illustrations" : ""}`);

  const runs: string[] = [];
  for (let i = 0; i < pages.length; i += 5)
    runs.push(
      ...(await queuePages({
        paths: pages.slice(i, i + 5).map((p) => p.path),
        provider: job.provider,
        model: job.model,
        imageModel: last.image_model,
        scope: "page",
        reuseImages,
      })),
    );
  console.log(`queued ${runs.length} runs`);

  const retried = new Set<string>();
  for (let tick = 0; tick < 720; tick++) {
    await sleep(30000);
    const state = await query<{ id: string; status: string }>("SELECT id,status FROM pipeline_runs WHERE id=ANY($1::uuid[])", [runs]);
    for (const r of state.filter((s) => s.status === "failed" && !retried.has(s.id))) {
      retried.add(r.id);
      await retryRun(r.id).catch(() => {});
    }
    const open = state.filter((s) => !["review", "completed"].includes(s.status) && !(s.status === "failed" && retried.has(s.id) && false));
    const waiting = state.filter((s) => ["queued", "running"].includes(s.status) || (s.status === "failed" && !retried.has(s.id)));
    if (tick % 4 === 0) console.log(new Date().toISOString().slice(11, 19), `${state.filter((s) => s.status === "review").length}/${runs.length} in review, ${waiting.length} running, ${state.filter((s) => s.status === "failed").length} failed`);
    if (!waiting.length && open.every((s) => s.status === "failed" && retried.has(s.id))) break;
    if (!waiting.length) break;
  }

  const rows = await query<{ path: string; status: string; rev: string | null; page_id: string; content: any }>(
    "SELECT p.path,r.status,r.result_revision_id rev,p.id page_id,v.content FROM pipeline_runs r JOIN pages p ON p.id=r.page_id LEFT JOIN revisions v ON v.id=r.result_revision_id WHERE r.id=ANY($1::uuid[]) ORDER BY p.path",
    [runs],
  );
  const summary = rows.map((r) => {
    if (!r.content) return { path: r.path, status: r.status };
    const total = r.content.pageSections.reduce((n: number, s: any) => n + Object.values(s.fields).reduce((m: number, v: any) => m + words(v as string), 0), 0);
    const qa = runContentQA(r.content, r.path);
    return {
      path: r.path,
      status: r.status,
      words: total,
      qa: qa.score,
      blocking: qa.checks.filter((c) => c.status === "fail").map((c) => c.id),
      title: r.content.seo?.metaTitle,
      preview: `/admin/preview/${r.page_id}?revision=${r.rev}`,
    };
  });
  mkdirSync("tmp", { recursive: true });
  writeFileSync(`tmp/regen-${family}.json`, JSON.stringify(summary, null, 2));
  const ok = summary.filter((s) => s.status === "review");
  console.log(`done: ${ok.length}/${summary.length} in review; failed: ${summary.filter((s) => s.status !== "review").map((s) => s.path).join(", ") || "none"}`);
  console.log(`words ${Math.min(...ok.map((s) => s.words ?? 0))}-${Math.max(...ok.map((s) => s.words ?? 0))}, QA ${Math.min(...ok.map((s) => s.qa ?? 0))}-${Math.max(...ok.map((s) => s.qa ?? 0))}, blocking: ${ok.filter((s) => s.blocking?.length).map((s) => s.path).join(", ") || "none"}`);
} finally {
  await pool().end();
}
