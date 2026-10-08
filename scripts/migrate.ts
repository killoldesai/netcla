import { Pool } from "pg";
import fs from "node:fs";
const p = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});
const c = await p.connect();
try {
  await c.query("BEGIN");
  await c.query(
    "CREATE TABLE IF NOT EXISTS migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const f of fs
    .readdirSync("db")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const done = await c.query("SELECT name FROM migrations WHERE name=$1", [
      f,
    ]);
    if (done.rowCount) continue;
    await c.query(fs.readFileSync("db/" + f, "utf8"));
    await c.query("INSERT INTO migrations(name) VALUES($1)", [f]);
    console.log("Applied " + f);
  }
  await c.query("COMMIT");
} catch (e) {
  await c.query("ROLLBACK");
  throw e;
} finally {
  c.release();
  await p.end();
}
