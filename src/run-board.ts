import { query } from "./db";

/** Active and recent generation runs with their task states, for the admin board. */
export async function runBoard() {
  const runs = await query(
    `SELECT r.id,r.status,r.review_status,r.scope,r.error,r.created_at,r.updated_at,r.page_type,p.id page_id,p.path,p.title
     FROM pipeline_runs r JOIN pages p ON p.id=r.page_id
     WHERE r.status IN ('queued','running') OR r.updated_at > now() - interval '30 minutes'
     ORDER BY CASE r.status WHEN 'running' THEN 0 WHEN 'queued' THEN 1 ELSE 2 END, CASE WHEN r.status IN ('queued','running') THEN r.created_at END ASC, r.updated_at DESC LIMIT 100`,
  );
  const ids = runs.map((r) => r.id);
  const tasks = ids.length
    ? await query(
        "SELECT run_id,kind,section_id,status,attempts,error,next_attempt_at FROM pipeline_tasks WHERE run_id = ANY($1::uuid[]) ORDER BY CASE kind WHEN 'blueprint' THEN 0 WHEN 'brief' THEN 1 WHEN 'section' THEN 2 ELSE 3 END, created_at",
        [ids],
      )
    : [];
  return runs.map((r) => ({
    ...r,
    tasks: tasks
      .filter((t) => t.run_id === r.id)
      .map(({ run_id: _run, ...t }) => t),
  }));
}
