import { query, pool } from "./db";
import { runPipelineTask, pipelineSettings } from "./publishing-pipeline";
import { sendOutbox } from "./ses-newsletter";
import { expireApplications } from "./careers";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let stopped = false;
process.on("SIGTERM", () => {
  stopped = true;
});
process.on("SIGINT", () => {
  stopped = true;
});
// Each slot claims the next ready task as soon as it finishes the previous one,
// so one slow image or section never holds up the others. runPipelineTask
// enforces the per-kind concurrency limits from settings.
async function slot() {
  while (!stopped) {
    try {
      if (!(await runPipelineTask())) await sleep(3000);
    } catch {
      console.error("Pipeline task failed to start; retrying");
      await sleep(10000);
    }
  }
}
async function housekeeping() {
  let retentionCheckedAt = 0;
  while (!stopped) {
    try {
      await sendOutbox();
      if (Date.now() - retentionCheckedAt > 3600000) {
        await expireApplications();
        retentionCheckedAt = Date.now();
      }
    } catch {
      console.error("Worker database operation failed; retrying");
    }
    await sleep(15000);
  }
}
async function main() {
  const beat = () =>
    query(
      "INSERT INTO settings(key,value) VALUES('worker_heartbeat',to_jsonb(now())) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).catch(() => console.error("Worker heartbeat unavailable"));
  await beat();
  const heartbeat = setInterval(beat, 10000);
  const limits = await pipelineSettings();
  await Promise.all([
    housekeeping(),
    ...Array.from({ length: limits.textConcurrency + limits.imageConcurrency }, slot),
  ]);
  clearInterval(heartbeat);
  await pool().end();
}
if (process.env.NODE_ENV !== "test")
  main().catch(() => {
    console.error("Worker startup failed");
    process.exit(1);
  });
