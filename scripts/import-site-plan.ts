import fs from "node:fs";
import { transaction, pool } from "../src/db";
import { readSitePlan, applySitePlan } from "../src/site-plan";
import { contentSQL } from "../src/export";
const inventory = readSitePlan();
const snapshot = await transaction(async (c) => {
  await c.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
  const data: Record<string, unknown> = {};
  for (const table of [
    "pages",
    "revisions",
    "redirects",
    "sources",
    "facts",
    "assets",
    "page_brief_versions",
    "site_plan_imports",
    "site_plan_backups",
  ])
    data[table] = (await c.query("SELECT * FROM " + table)).rows;
  return data;
});
fs.mkdirSync(".backups", { recursive: true });
const filename = ".backups/site-plan-before-" + Date.now() + ".json";
fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2), { mode: 0o600 });
const result = await transaction((c) => applySitePlan(c, inventory));
console.log("Content backup saved locally. " + result.message);
const exported = await transaction(async (c) => {
  await c.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
  const data: Record<string, Record<string, any>[]> = {};
  for (const table of [
    "sources",
    "facts",
    "pages",
    "revisions",
    "redirects",
    "assets",
    "site_plan_imports",
    "site_plan_backups",
    "page_brief_versions",
  ])
    data[table] = (await c.query("SELECT * FROM " + table)).rows;
  return data;
});
fs.writeFileSync(".backups/site-plan-content.sql", contentSQL(exported), {
  mode: 0o600,
});
console.log("Current content SQL saved to .backups/site-plan-content.sql");
await pool().end();
