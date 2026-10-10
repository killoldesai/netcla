import { createHash } from "node:crypto";
import { query, transaction, pool } from "../src/db";
import type { PageSpecification } from "../src/page-spec-schema";
import { canonicalSpecification } from "../src/prompts/spec-text";
import { PROMPT_VERSION } from "../src/prompts/system";
import { wordBands } from "../src/prompts/templates";

// Rewrites page_specs so the stored sections, fields and prompts match what the pipeline generates.
// Dry run by default; pass --apply to write a new import (nothing is deleted, nothing is published).
const apply = process.argv.includes("--apply");
try {
  const rows = await query<{ id: string; path: string; specification: PageSpecification }>(
    `SELECT DISTINCT ON (s.path) s.id, s.path, s.specification
     FROM page_specs s JOIN pages p ON p.id=s.page_id
     WHERE p.archived_at IS NULL AND s.specification->>'source' NOT LIKE 'canonical-templates%'
     ORDER BY s.path, s.created_at DESC`,
  );
  const plan = rows.map((r) => ({ row: r, ...canonicalSpecification(r.specification) }));
  const byFamily = new Map<string, { pages: number; layouts: Set<string>; fields: Set<number>; changed: number }>();
  for (const p of plan) {
    const entry = byFamily.get(p.family) ?? { pages: 0, layouts: new Set(), fields: new Set(), changed: 0 };
    entry.pages++;
    entry.layouts.add(p.spec.sections.map((s) => s.id).join(">"));
    entry.fields.add(p.spec.sections.reduce((n, s) => n + s.fields.length, 0));
    if (p.changed && JSON.stringify(p.spec.sections.map((s) => [s.id, s.fields])) !== JSON.stringify(p.row.specification.sections.map((s) => [s.id, s.fields])))
      entry.changed++;
    byFamily.set(p.family, entry);
  }
  console.log(apply ? "APPLY" : "DRY RUN", `${rows.length} pages`);
  for (const [family, e] of [...byFamily].sort())
    console.log(
      `${family.padEnd(10)} pages ${String(e.pages).padStart(3)}  layouts ${e.layouts.size}  fields/page ${[...e.fields].join("/")}  band ${wordBands[family as keyof typeof wordBands].min}-${wordBands[family as keyof typeof wordBands].max}  layout changes ${e.changed}`,
    );
  if (!apply) {
    console.log("Re-run with --apply to write a new page_spec_imports row and one page_specs row per page.");
  } else {
    const checksum = createHash("sha256")
      .update(JSON.stringify({ version: PROMPT_VERSION, specs: plan.map((p) => [p.row.path, p.spec.sections.map((s) => [s.id, s.fields, s.originalPrompt]), p.spec.blueprintPrompt]) }))
      .digest("hex");
    const result = await transaction(async (c) => {
      const found = await c.query("SELECT id FROM page_spec_imports WHERE checksum=$1", [checksum]);
      if (found.rows[0]) return { unchanged: true, importId: found.rows[0].id };
      const imported = await c.query(
        "INSERT INTO page_spec_imports(checksum,sources,summary) VALUES($1,$2,$3) RETURNING id",
        [checksum, JSON.stringify({ canonicalTemplates: PROMPT_VERSION }), JSON.stringify({ pages: plan.length, promptVersion: PROMPT_VERSION })],
      );
      for (const p of plan) {
        const page = await c.query("SELECT id FROM pages WHERE path=$1", [p.row.path]);
        if (page.rows[0]?.id !== p.spec.databaseId) throw new Error("Database identity unresolved: " + p.row.path);
        await c.query("INSERT INTO page_specs(import_id,page_id,path,specification) VALUES($1,$2,$3,$4)", [
          imported.rows[0].id,
          p.spec.databaseId,
          p.row.path,
          JSON.stringify(p.spec),
        ]);
      }
      return { unchanged: false, importId: imported.rows[0].id };
    });
    console.log(result.unchanged ? "Already applied." : "Wrote import " + result.importId);
  }
} finally {
  await pool().end();
}
