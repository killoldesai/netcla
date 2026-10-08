import { transaction, pool } from "../src/db";
import { publishingTables,backupFiles } from "../src/publishing-backup";
const tables = [
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
];
const dump = await transaction(async (c) => {
  await c.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
  const data: Record<string, unknown> = {};
  for (const t of tables) data[t] = (await c.query("SELECT * FROM " + t)).rows;
  return data;
});
if(process.argv.includes("--with-files"))dump.persistent_files=await backupFiles();
process.stdout.write(JSON.stringify(dump, null, 2));
await pool().end();
