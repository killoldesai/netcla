import { query, pool } from "../src/db";
import { assembleReadyRuns } from "../src/publishing-pipeline";
try {
  if (process.argv.includes("--assemble")) await assembleReadyRuns();
  console.log(
    JSON.stringify(
      {
        runs: await query(
          "SELECT p.path,r.status,r.result_revision_id,p.id page_id FROM pipeline_runs r JOIN pages p ON p.id=r.page_id ORDER BY r.created_at DESC LIMIT 3",
        ),
        settings: await query(
          "SELECT key,CASE WHEN key LIKE 'provider_credentials_%' THEN jsonb_build_object('configured',true) ELSE value END AS value FROM settings WHERE key IN ('ai_provider','ai_model','ai_max_tokens','publishing_pipeline','provider_credentials_bedrock','provider_credentials_openrouter')",
        ),
        models: await query(
          "SELECT provider,model,count(*)::int n FROM jobs WHERE status='completed' GROUP BY provider,model ORDER BY n DESC",
        ),
        published: await query(
          "SELECT count(*)::int n FROM pages WHERE published_revision_id IS NOT NULL",
        ),
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        failures: await query(
          "SELECT p.path,t.kind,t.section_id,t.error FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id JOIN pages p ON p.id=r.page_id WHERE t.status='failed'",
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await pool().end();
}
