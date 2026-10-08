import fs from "node:fs";
import { pool, transaction } from "../src/db";
import { publishingTables, restoreFiles } from "../src/publishing-backup";
const filename = process.argv[2];
if (!filename) throw new Error("Usage: npm run db:restore -- backup.json");
const data = JSON.parse(fs.readFileSync(filename, "utf8"));
// Whitelist tables, use bound JSON parameters, and restore pointers after revisions.
await transaction(async (c) => {
  for (const table of [
    "sources",
    "facts",
    "pages",
    "revisions",
    "leads",
    "redirects",
    "settings",
    "assets",
    "site_plan_imports",
    "site_plan_backups",
    "page_brief_versions",
    ...publishingTables,
  ]) {
    if (
      !data[table] &&
      [
        "site_plan_imports",
        "site_plan_backups",
        "page_brief_versions",
        ...publishingTables,
      ].includes(table)
    )
      continue;
    if (!Array.isArray(data[table]))
      throw new Error("Invalid backup: " + table);
    for (const row of data[table]) {
      const value =
        table === "pages"
          ? { ...row, draft_revision_id: null, published_revision_id: null }
          : table === "revision_reviews"
            ? { ...row, owner_id: null }
            : row;
      await c.query(
        `INSERT INTO ${table} SELECT * FROM jsonb_populate_record(NULL::${table},$1::jsonb) ON CONFLICT DO NOTHING`,
        [JSON.stringify(value)],
      );
    }
  }
  for (const p of data.pages)
    await c.query(
      "UPDATE pages SET draft_revision_id=$1,published_revision_id=$2 WHERE id=$3",
      [p.draft_revision_id, p.published_revision_id, p.id],
    );
});
await pool().end();
if (data.persistent_files) await restoreFiles(data.persistent_files);
console.log(
  "Content and leads restored. Owner accounts and secrets are provisioned separately.",
);
