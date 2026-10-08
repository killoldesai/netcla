import { query } from "./db";
import { z } from "zod";
import { credentialStatus } from "./provider-credentials";
export const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  size: z.coerce
    .number()
    .refine((v) => [25, 50, 100].includes(v))
    .default(25),
  q: z.string().max(200).default(""),
  status: z.string().max(40).default("all"),
  category: z.string().max(100).default("all"),
  kind: z.string().max(100).default("all"),
  review: z.string().max(40).default("all"),
  generation: z.string().max(40).default("all"),
  spec: z.enum(["all", "yes", "no"]).default("all"),
  sort: z.enum(["updated", "title", "created"]).default("updated"),
});
export type ListInput = z.infer<typeof listSchema>;
const pageSelect = `SELECT p.id,p.path,p.title,p.kind,p.updated_at,p.created_at,p.archived_at,p.draft_revision_id,p.published_revision_id,COALESCE(NULLIF(p.brief->>'cluster',''),p.kind) category,r.content->>'schemaVersion' version,CASE WHEN p.published_revision_id IS NULL THEN NULL ELSE COALESCE(live.content->>'schemaVersion','1') END published_version,CASE WHEN p.draft_revision_id=p.published_revision_id THEN 'published' ELSE COALESCE(rr.status,'pending') END review_status,(s.id IS NOT NULL) has_spec,s.id spec_id,COALESCE(CASE WHEN pr.created_at>=COALESCE(j.created_at,'-infinity'::timestamptz) THEN pr.status ELSE j.status END,'idle') generation_status,pr.id run_id FROM pages p LEFT JOIN revisions r ON r.id=p.draft_revision_id LEFT JOIN revisions live ON live.id=p.published_revision_id LEFT JOIN revision_reviews rr ON rr.revision_id=p.draft_revision_id LEFT JOIN LATERAL(SELECT id FROM page_specs WHERE page_id=p.id ORDER BY created_at DESC LIMIT 1)s ON true LEFT JOIN LATERAL(SELECT id,status,created_at FROM pipeline_runs WHERE page_id=p.id ORDER BY created_at DESC LIMIT 1)pr ON true LEFT JOIN LATERAL(SELECT status,created_at FROM jobs WHERE page_id=p.id ORDER BY created_at DESC LIMIT 1)j ON true`;
const productionSelect = `SELECT r.id,r.page_id,p.path,p.title,r.status,r.review_status,r.scope,r.provider,r.model,r.created_at,r.updated_at,r.result_revision_id,r.error,'pipeline' engine,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id) total,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='completed') completed FROM pipeline_runs r JOIN pages p ON p.id=r.page_id UNION ALL SELECT j.id,j.page_id,p.path,p.title,j.status,'pending','page',j.provider,j.model,j.created_at,j.updated_at,j.result_revision_id,j.error,'legacy',1,CASE WHEN j.status='completed' THEN 1 ELSE 0 END FROM jobs j JOIN pages p ON p.id=j.page_id`;
export async function consoleList(resource: string, input: ListInput) {
  let source = "",
    search = "",
    status = "";
  switch (resource) {
    case "pages":
      source = pageSelect;
      search = "title || path";
      status =
        "CASE WHEN archived_at IS NOT NULL THEN 'archived' WHEN published_revision_id IS NOT NULL THEN 'published' ELSE 'unpublished' END";
      break;
    case "production":
      source = productionSelect;
      search = "title || path";
      status = "status";
      break;
    case "media":
      source =
        "SELECT a.id,a.alt,a.width,a.height,a.review_status status,a.provider,a.model,a.created_at,p.path FROM generated_assets a LEFT JOIN pipeline_runs r ON r.id=a.run_id LEFT JOIN pages p ON p.id=r.page_id";
      search = "alt || COALESCE(path,'')";
      status = "status";
      break;
    case "leads":
      source =
        "SELECT id,status,notes,created_at,data->>'name' name,data->>'email' email,data->>'service' service,COALESCE(data->>'pillar','other') pillar,data->>'landingPage' landing_page,data->>'utm_source' utm_source FROM leads";
      search =
        "COALESCE(name,'') || COALESCE(email,'') || COALESCE(service,'')";
      status = "status";
      break;
    case "subscribers":
      source =
        "SELECT id,email,status,confirmed_at,created_at FROM newsletter_subscribers";
      search = "email";
      status = "status";
      break;
    case "outbox":
      source =
        "SELECT id,recipient,subject,purpose,status,attempts,error,created_at FROM email_outbox";
      search = "subject || recipient";
      status = "status";
      break;
    case "vacancies":
      source =
        "SELECT id,slug,title,department,location,employment_type,status,verified,created_at FROM vacancies";
      search = "title || department";
      status = "status";
      break;
    case "applications":
      source =
        "SELECT a.id,a.name,a.email,a.status,a.created_at,v.title,v.id vacancy_id FROM career_applications a JOIN vacancies v ON v.id=a.vacancy_id";
      search = "name || email || title";
      status = "status";
      break;
    case "activity":
      source = "SELECT id,action,entity_id,created_at FROM audit_events";
      search = "action || COALESCE(entity_id,'')";
      status = "'all'";
      break;
    default:
      throw new Error("Unknown inventory");
  }
  const params: unknown[] = [`%${input.q}%`];
  let where = `(${search}) ILIKE $1`;
  const add = (sql: string, v: unknown) => {
    params.push(v);
    where += ` AND ${sql.replace("?", "$" + params.length)}`;
  };
  if (input.status !== "all") {
    if (resource === "production" && input.status === "queue")
      where += " AND status IN ('queued','running','failed')";
    else if (resource === "production" && input.status === "review")
      where +=
        " AND engine='pipeline' AND status='review' AND review_status<>'accepted'";
    else if (resource === "production" && input.status === "history")
      where +=
        " AND (status IN ('completed','cancelled') OR review_status='accepted')";
    else add(`${status}=?`, input.status);
  }
  if (resource === "pages") {
    if (input.category !== "all") add("category=?", input.category);
    if (input.kind !== "all") add("kind=?", input.kind);
    if (input.review !== "all") add("review_status=?", input.review);
    if (input.generation !== "all")
      add("generation_status=?", input.generation);
    if (input.spec !== "all") add("has_spec=?", input.spec === "yes");
  }
  const order =
    resource === "pages"
      ? input.sort === "title"
        ? "title ASC,id"
        : input.sort === "created"
          ? "created_at DESC,id"
          : "updated_at DESC,id"
      : "created_at DESC,id";
  const [count] = await query(
    `WITH inventory AS (${source}) SELECT count(*)::int total FROM inventory WHERE ${where}`,
    params,
  );
  const rows = await query(
    `WITH inventory AS (${source}) SELECT * FROM inventory WHERE ${where} ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, input.size, (input.page - 1) * input.size],
  );
  const states = await query(
    `WITH inventory AS (${source}) SELECT ${status} status,count(*)::int count FROM inventory GROUP BY 1`,
  );
  return {
    rows,
    total: count.total,
    page: input.page,
    size: input.size,
    states,
  };
}
export async function consoleSettings() {
  const rows = await query(
    "SELECT key,value FROM settings WHERE key IN ('ai','ai_model_test','generation_defaults','publishing_pipeline','ses_delivery_status','career_retention_days','worker_heartbeat')",
  );
  return {
    values: Object.fromEntries(rows.map((r) => [r.key, r.value])),
    configured: await credentialStatus(),
    sesConfigured:
      (await query("SELECT key FROM settings WHERE key='ses_credentials'"))
        .length > 0,
    scannerConfigured: !!process.env.CLAMAV_HOST,
  };
}
export async function consoleOverview(days: number) {
  const [counts] = await query(
    `WITH boundaries AS (SELECT ((now() AT TIME ZONE 'Asia/Kolkata')::date + 1) AT TIME ZONE 'Asia/Kolkata' end_at), ranges AS (SELECT end_at,end_at-($1 * interval '1 day') start_at,end_at-($1 * 2 * interval '1 day') previous_at FROM boundaries) SELECT
 (SELECT count(*)::int FROM leads,ranges WHERE created_at>=start_at AND created_at<end_at) enquiries,
 (SELECT count(*)::int FROM leads,ranges WHERE created_at>=previous_at AND created_at<start_at) previous_enquiries,
 (SELECT count(*)::int FROM leads WHERE status='New') unprocessed,
 (SELECT count(*)::int FROM pages p JOIN revisions r ON r.id=p.draft_revision_id LEFT JOIN revision_reviews rr ON rr.revision_id=r.id WHERE p.archived_at IS NULL AND p.draft_revision_id IS DISTINCT FROM p.published_revision_id AND (r.content->>'schemaVersion'<>'3' OR rr.status IS DISTINCT FROM 'accepted')) page_reviews,
 (SELECT count(*)::int FROM generated_assets WHERE review_status='pending') asset_reviews,
 (SELECT count(*)::int FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id WHERE t.status='failed' AND r.status<>'cancelled') failed_tasks,
 (SELECT count(*)::int FROM jobs WHERE status='failed') failed_jobs,
 (SELECT count(*)::int FROM vacancies WHERE verified AND status='open') open_vacancies,
 (SELECT count(*)::int FROM career_applications WHERE status='new') new_applications,
 (SELECT count(*)::int FROM newsletter_subscribers WHERE status='active') subscribers`,
    [days],
  );
  const daily = await query(
    `SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date::text AS "day",count(*)::int count FROM leads WHERE created_at>=(((now() AT TIME ZONE 'Asia/Kolkata')::date+1)-$1::int) AT TIME ZONE 'Asia/Kolkata' AND created_at<((now() AT TIME ZONE 'Asia/Kolkata')::date+1) AT TIME ZONE 'Asia/Kolkata' GROUP BY 1 ORDER BY 1`,
    [days],
  );
  const services = await query(
    `SELECT COALESCE(NULLIF(data->>'service',''),'Unspecified') service,count(*)::int count FROM leads WHERE created_at>=(((now() AT TIME ZONE 'Asia/Kolkata')::date+1)-$1::int) AT TIME ZONE 'Asia/Kolkata' GROUP BY 1 ORDER BY count DESC LIMIT 8`,
    [days],
  );
  const production = await query(
    "SELECT 'Legacy jobs' unit,status,count(*)::int count FROM jobs GROUP BY status UNION ALL SELECT 'Pipeline tasks',t.status,count(*)::int FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id WHERE r.status<>'cancelled' GROUP BY t.status",
  );
  return {
    counts,
    daily,
    services,
    production,
    settings: await consoleSettings(),
    generatedAt: new Date().toISOString(),
  };
}
