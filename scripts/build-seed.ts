import fs from "node:fs";
import { allDesigns } from "../src/designs";
const literal = (v: unknown) =>
  "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
let sql = "-- Idempotent draft inventory. Never alters an existing page.\n";
for (const d of allDesigns) {
  const brief = { ...d.brief, publishGate: d.gate, evidenceApproved: false };
  const content = {
    title: d.title,
    description:
      "Discuss your business goals and project requirements with Netofficials.",
    texts: d.texts,
    sources: [],
    claims: [],
    unresolved: [
      "Verify business facts and replace design scaffolding before publication.",
    ],
  };
  const q = (v: string) => "'" + v.replaceAll("'", "''") + "'";
  sql += `DO $seed$ DECLARE page_id uuid; revision_id uuid; BEGIN
INSERT INTO pages(path,template,title,kind,brief) VALUES(${q(d.path)},${q(d.id)},${q(d.title)},${q(d.kind)},${literal(brief)}) ON CONFLICT(path) DO NOTHING RETURNING id INTO page_id;
IF page_id IS NOT NULL THEN
INSERT INTO revisions(page_id,content,validation,origin) VALUES(page_id,${literal(content)},'{"errors":["Unreviewed seed draft"],"warnings":[]}'::jsonb,'design-seed') RETURNING id INTO revision_id;
UPDATE pages SET draft_revision_id=revision_id WHERE id=page_id;
END IF; END $seed$;\n`;
}
fs.writeFileSync("db/002-draft-inventory.sql", sql);
