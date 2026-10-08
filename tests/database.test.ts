import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("Database prevents revision mutation and a second owner account", async () => {
  const db = new PGlite();
  for (const f of fs
    .readdirSync("db")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(
      fs
        .readFileSync("db/" + f, "utf8")
        .replace("CREATE EXTENSION IF NOT EXISTS pgcrypto;", ""),
    );
  await assert.rejects(
    () => db.query("UPDATE revisions SET origin='changed'"),
    /immutable/,
  );
  await db.query(
    "INSERT INTO owners(email,password_hash) VALUES('a@example.test','test-hash')",
  );
  await assert.rejects(() =>
    db.query(
      "INSERT INTO owners(email,password_hash) VALUES('b@example.test','test-hash')",
    ),
  );
  await db.close();
});
test("PostgreSQL migrations and draft seed preserve data, job leases and lead deduplication", async () => {
  const db = new PGlite();
  await db.exec(
    fs
      .readFileSync("db/001-initial.sql", "utf8")
      .replace("CREATE EXTENSION IF NOT EXISTS pgcrypto;", ""),
  );
  await db.exec(fs.readFileSync("db/002-draft-inventory.sql", "utf8"));
  const count = await db.query<{ count: number }>(
    "SELECT count(*)::int count FROM pages",
  );
  assert.equal(count.rows[0].count, 54);
  assert.equal(
    (
      await db.query(
        "SELECT * FROM pages WHERE published_revision_id IS NOT NULL",
      )
    ).rows.length,
    0,
  );
  await db.exec(fs.readFileSync("db/002-draft-inventory.sql", "utf8"));
  assert.equal((await db.query("SELECT * FROM revisions")).rows.length, 54);
  const p = (
    await db.query<{ id: string; draft_revision_id: string }>(
      "SELECT id,draft_revision_id FROM pages WHERE path='/custom-software-development'",
    )
  ).rows[0];
  await db.query(
    "INSERT INTO jobs(page_id,provider,model,base_revision_id) VALUES($1,$2,$3,$4)",
    [p.id, "openrouter", "test-model", p.draft_revision_id],
  );
  await assert.rejects(() =>
    db.query("INSERT INTO jobs(page_id,provider,model) VALUES($1,$2,$3)", [
      p.id,
      "bedrock",
      "test-model",
    ]),
  );
  const lease = await db.query(
    "WITH candidate AS (SELECT id FROM jobs WHERE status='queued' FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE jobs SET status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '10 minutes' WHERE id=(SELECT id FROM candidate) RETURNING *",
  );
  assert.equal(lease.rows.length, 1);
  assert.equal(
    (await db.query("SELECT * FROM jobs WHERE status='queued'")).rows.length,
    0,
  );
  await db.query("UPDATE pages SET published_revision_id=$1 WHERE id=$2", [
    p.draft_revision_id,
    p.id,
  ]);
  await db.query("UPDATE pages SET draft_revision_id=NULL WHERE id=$1", [p.id]);
  assert.equal(
    (
      await db.query("SELECT * FROM pages WHERE published_revision_id=$1", [
        p.draft_revision_id,
      ])
    ).rows.length,
    1,
  );
  await db.query(
    "INSERT INTO leads(request_id,data) VALUES($1,$2) ON CONFLICT(request_id) DO NOTHING",
    ["00000000-0000-4000-8000-000000000001", "{}"],
  );
  await db.query(
    "INSERT INTO leads(request_id,data) VALUES($1,$2) ON CONFLICT(request_id) DO NOTHING",
    ["00000000-0000-4000-8000-000000000001", "{}"],
  );
  assert.equal((await db.query("SELECT * FROM leads")).rows.length, 1);
  await db.close();
});
