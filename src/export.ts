export function contentSQL(data: Record<string, Record<string, any>[]>) {
  const literal = (v: unknown) =>
    "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
  let sql =
    "-- Restore into a migrated database. Existing rows are preserved.\nBEGIN;\n";
  for (const t of [
    "sources",
    "facts",
    "pages",
    "revisions",
    "redirects",
    "assets",
    "site_plan_imports",
    "site_plan_backups",
    "page_brief_versions",
    "page_spec_imports",
    "page_specs",
    "pipeline_runs",
    "pipeline_tasks",
    "generated_assets",
    "revision_reviews",
  ])
    for (const original of data[t] ?? []) {
      const r =
        t === "revision_reviews"
          ? { ...original, owner_id: null }
          : t === "pipeline_runs"
            ? {
                ...original,
                status: ["review", "failed"].includes(original.status)
                  ? original.status
                  : "cancelled",
              }
            : t === "pipeline_tasks"
              ? {
                  ...original,
                  lease_token: null,
                  lease_until: null,
                  status:
                    original.status === "running" ? "failed" : original.status,
                }
              : original;
      if (t === "pages")
        sql += `INSERT INTO pages(id,path,template,title,kind,brief,created_at,updated_at,first_published_at,archived_at) SELECT id,path,template,title,kind,brief,created_at,updated_at,first_published_at,archived_at FROM jsonb_populate_record(NULL::pages,${literal(r)}) ON CONFLICT DO NOTHING;\n`;
      else
        sql += `INSERT INTO ${t} SELECT * FROM jsonb_populate_record(NULL::${t},${literal(r)}) ON CONFLICT DO NOTHING;\n`;
    }
  for (const p of data.pages ?? [])
    sql += `UPDATE pages SET draft_revision_id=${p.draft_revision_id ? "'" + p.draft_revision_id + "'::uuid" : "NULL"},published_revision_id=${p.published_revision_id ? "'" + p.published_revision_id + "'::uuid" : "NULL"} WHERE id='${p.id}';\n`;
  return sql + "COMMIT;\n";
}
