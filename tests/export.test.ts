import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import { contentSQL } from "../src/export";
test("Content SQL restores revisions, supporting evidence and live pointers", async () => {
  const first = new PGlite(),
    restored = new PGlite();
  const schema =
    fs
      .readFileSync("db/001-initial.sql", "utf8")
      .replace("CREATE EXTENSION IF NOT EXISTS pgcrypto;", "") +
    fs.readFileSync("db/003-publication-metadata.sql", "utf8") +
    fs.readFileSync("db/005-site-plan.sql", "utf8");
  await first.exec(schema);
  await restored.exec(schema);
  await first.exec(fs.readFileSync("db/002-draft-inventory.sql", "utf8"));
  await first.query(
    "INSERT INTO sources(title,excerpt,approved) VALUES('A source','Owner’s verified research',true)",
  );
  const data: Record<string, Record<string, any>[]> = {};
  for (const t of [
    "sources",
    "facts",
    "pages",
    "revisions",
    "redirects",
    "assets",
  ])
    data[t] = (
      await first.query<Record<string, any>>("SELECT * FROM " + t)
    ).rows;
  await restored.exec(contentSQL(data));
  await restored.exec(contentSQL(data));
  assert.equal(
    (await restored.query("SELECT * FROM revisions")).rows.length,
    54,
  );
  assert.equal((await restored.query("SELECT * FROM sources")).rows.length, 1);
  assert.equal(
    (
      await restored.query(
        "SELECT * FROM pages WHERE draft_revision_id IS NOT NULL",
      )
    ).rows.length,
    54,
  );
  await first.close();
  await restored.close();
});
