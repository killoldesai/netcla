import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  readSitePlan,
  applySitePlan,
  emptyPlanContent,
  planBrief,
  validatePlanned,
} from "../src/site-plan";
import { contentSchema, validateContent } from "../src/content";
import { getDesign } from "../src/designs";
import { contentSQL } from '../src/export';
test("Detailed sitemap reconciles IDs and merges duplicate URLs without losing provenance", () => {
  const data = readSitePlan();
  assert.equal(data.entries.length, 151);
  assert.equal(data.report.sourceRows, 154);
  assert.equal(data.report.idUrlConflicts, 128);
  assert.equal(data.report.duplicates.length, 3);
  assert.equal(
    data.entries.find((e) => e.url === "/seo-services")?.provenance.length,
    2,
  );
  assert.ok(data.entries.find((e) => e.url === "/careers"));
  assert.equal(new Set(data.entries.map((e) => e.url)).size, 151);
  for (const e of data.entries) {
    assert.ok(e.prompt);
    assert.ok(e.headings.length);
    contentSchema.parse(emptyPlanContent(e));
  }
});
test("Plan content validates required headings, markup, links and empty drafts", () => {
  const e = readSitePlan().entries[6],
    brief = planBrief(e),
    c = contentSchema.parse(emptyPlanContent(e));
  assert.ok(validateContent(c, getDesign("site-plan")).errors.length);
  assert.ok(validatePlanned(c, brief, ["/contact"]).every(error => error.startsWith("FAQ section")));
  c.sections![0].heading = "Incorrect";
  assert.ok(
    validatePlanned(c, brief, ["/contact"]).some((e) =>
      e.includes("heading mismatch"),
    ),
  );
  c.hero!.body = "<script>bad</script>";
  assert.ok(
    validateContent(c, getDesign("site-plan")).errors.includes(
      "Executable markup is not allowed",
    ),
  );
  c.hero!.ctaPath = "/missing";
  assert.ok(
    validatePlanned(c, brief, ["/contact"]).some((e) =>
      e.includes("Unresolved"),
    ),
  );
});
test("Site plan import backs up, archives and creates empty drafts idempotently while preserving owners/leads/published data", async () => {
  const db = new PGlite();
  try {
    for (const name of fs
      .readdirSync("db")
      .filter((n) => n.endsWith(".sql"))
      .sort())
      await db.exec(
        fs
          .readFileSync("db/" + name, "utf8")
          .replace("CREATE EXTENSION IF NOT EXISTS pgcrypto;", ""),
      );
    await db.query(
      "INSERT INTO owners(email,password_hash) VALUES('owner@example.test','hash')",
    );
    await db.query(
      "INSERT INTO leads(request_id,data) VALUES(gen_random_uuid(),'{}')",
    );
    await db.query(
      "UPDATE pages SET published_revision_id=draft_revision_id WHERE path='/about'",
    );
    const before = (
      await db.query<any>("SELECT * FROM pages WHERE path='/about'")
    ).rows[0];
    // pg_advisory_xact_lock is not available in PGlite; emulate only that lock.
    const client = {
      query: async (sql: string, params?: any[]) => {
        if (sql.includes("pg_advisory_xact_lock"))
          return { rows: [], rowCount: 1 };
        const result = await db.query(sql, params);
        return { ...result, rowCount: result.rows.length };
      },
    };
    await db.exec("BEGIN");
    await applySitePlan(client as any);
    await db.exec("COMMIT");
    const after = (
      await db.query<any>("SELECT * FROM pages WHERE path='/about'")
    ).rows[0];
    assert.equal(after.published_revision_id, before.published_revision_id);
    assert.equal(after.template, before.template);
    assert.equal(
      (
        await db.query(
          "SELECT * FROM pages WHERE brief->>'sitePlan'='true' AND archived_at IS NULL",
        )
      ).rows.length,
      151,
    );
    assert.equal(
      (await db.query("SELECT * FROM site_plan_backups")).rows.length,
      1,
    );
    assert.equal((await db.query("SELECT * FROM owners")).rows.length, 1);
    assert.equal((await db.query("SELECT * FROM leads")).rows.length, 1);
    assert.ok(
      (await db.query("SELECT * FROM pages WHERE archived_at IS NOT NULL")).rows
        .length,
    );
    const revisions = (await db.query("SELECT * FROM revisions")).rows.length;
    await applySitePlan(client as any);
    assert.equal(
      (await db.query("SELECT * FROM revisions")).rows.length,
      revisions,
    );
    const draft = (
      await db.query<any>(
        "SELECT r.content FROM pages p JOIN revisions r ON r.id=p.draft_revision_id WHERE p.path='/mobile-app-development'",
      )
    ).rows[0].content;
    assert.equal(draft.hero.body, "");
    assert.equal(draft.schemaVersion, 2);
    const snapshot:Record<string,Record<string,any>[]>={};
    for(const table of ['sources','facts','pages','revisions','redirects','assets','site_plan_imports','site_plan_backups','page_brief_versions'])snapshot[table]=(await db.query<Record<string,any>>('SELECT * FROM '+table)).rows;
    const restored=new PGlite();
    try {
      for(const f of ['001-initial.sql','003-publication-metadata.sql','005-site-plan.sql'])await restored.exec(fs.readFileSync('db/'+f,'utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
      await restored.exec(contentSQL(snapshot));
      await restored.exec(contentSQL(snapshot));
      assert.equal((await restored.query('SELECT * FROM pages')).rows.length,snapshot.pages.length);
      assert.equal((await restored.query('SELECT * FROM site_plan_backups')).rows.length,1);
      assert.equal((await restored.query('SELECT * FROM page_brief_versions')).rows.length,151);
    }finally{await restored.close();}
  } finally {
    await db.close();
  }
});
