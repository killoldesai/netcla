// Lists drafts with a blocking QA check and, with --queue, regenerates only the offending sections as new drafts.
import { runContentQA } from "../src/content-qa";
import { pool, query } from "../src/db";
import { queuePages } from "../src/publishing-pipeline";

const queue = process.argv.includes("--queue");
try {
  const rows = await query<any>(
    `SELECT DISTINCT ON (r.page_id) p.path, v.content FROM pipeline_runs r JOIN pages p ON p.id=r.page_id JOIN revisions v ON v.id=p.draft_revision_id
     WHERE r.status IN ('review','completed') AND p.draft_revision_id IS DISTINCT FROM p.published_revision_id AND v.content->>'schemaVersion'='3'
     ORDER BY r.page_id, r.created_at DESC`,
  );
  const [job] = await query<any>("SELECT provider,model FROM jobs WHERE status='completed' ORDER BY updated_at DESC LIMIT 1");
  const [last] = await query<any>("SELECT image_model FROM pipeline_runs ORDER BY created_at DESC LIMIT 1");
  for (const r of rows) {
    const bad = runContentQA(r.content, r.path).checks.filter((c) => c.status === "fail");
    if (!bad.length) continue;
    if (r.path.startsWith("/blog/")) continue; // guides are not part of this pass
    const sections = [...new Set(bad.flatMap((c) => String(c.detail ?? "").split(", ").map((d) => d.split(".")[0])).filter((s) => r.content.pageSections.some((x: any) => x.id === s)))];
    console.log(r.path, bad.map((c) => `${c.id}: ${c.detail}`).join(" | "), "-> sections", sections.join(",") || "(none identified)");
    if (queue && sections.length)
      await queuePages({
        paths: [r.path],
        provider: job.provider,
        model: job.model,
        imageModel: last.image_model,
        scope: "sections",
        sectionIds: sections,
        instruction: "Use no statistics, percentages, timings, prices or other figures unless they appear in the supplied facts. State capabilities and process in plain terms. Keep every field inside its word limit.",
      }).then((ids) => console.log("  queued", ids[0]));
  }
} finally {
  await pool().end();
}
