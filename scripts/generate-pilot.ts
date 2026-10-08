import {
  queuePages,
  retryRun,
  runPipelineTask,
  pilotPaths,
} from "../src/publishing-pipeline";
import { query, pool } from "../src/db";
try {
  const imageModel = process.argv[2];
  if (!imageModel) throw new Error("Supply a discovered image model ID");
  const existing = await query(
    "SELECT r.id,r.status FROM pipeline_runs r JOIN pages p ON p.id=r.page_id WHERE p.path=ANY($1::text[]) AND r.status IN ('queued','running','review','failed')",
    [pilotPaths],
  );
  if(process.argv.includes('--resume')) for(const run of existing)if(run.status==='failed')await retryRun(run.id);
  if (!existing.length) {
    const [configured] = await query(
      "SELECT provider,model FROM jobs WHERE status='completed' ORDER BY updated_at DESC LIMIT 1",
    );
    if (!configured)
      throw new Error("Configure and test a text provider first");
    console.log(
      "Queued pilot:",
      await queuePages({
        paths: pilotPaths,
        provider: configured.provider,
        model: configured.model,
        imageModel,
      }),
    );
  }
  let active = true;
  while (active) {
    const results = await Promise.allSettled([
      runPipelineTask(),
      runPipelineTask(),
      runPipelineTask(),
    ]);
    results
      .filter((r) => r.status === "rejected")
      .forEach((r) =>
        console.log(
          "Task processing failed",
          r.status === "rejected" ? String(r.reason).slice(0, 250) : "",
        ),
      );
    const states = await query(
      "SELECT p.path,r.status,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='completed') completed,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id) total FROM pipeline_runs r JOIN pages p ON p.id=r.page_id WHERE p.path=ANY($1::text[]) ORDER BY r.created_at DESC",
      [pilotPaths],
    );
    console.log(JSON.stringify(states));
    active = states.some((r) => ["queued", "running"].includes(r.status));
    if (active && !results.some((r) => r.status === "fulfilled" && r.value))
      throw new Error("No runnable pilot tasks; inspect pipeline errors");
  }
} finally {
  await pool().end();
}
