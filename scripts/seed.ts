import { allDesigns } from "../src/designs";
import { pool, transaction } from "../src/db";
import { contentSchema, validateContent } from "../src/content";
for (const d of allDesigns) {
  await transaction(async (c) => {
    const r = await c.query(
      "INSERT INTO pages(path,template,title,kind,brief) VALUES($1,$2,$3,$4,$5) ON CONFLICT(path) DO NOTHING RETURNING id",
      [
        d.path,
        d.id,
        d.title,
        d.kind,
        JSON.stringify({
          ...d.brief,
          publishGate: d.gate,
          evidenceApproved: false,
        }),
      ],
    );
    if (!r.rows[0]) return;
    const content = contentSchema.parse({
      title: d.title,
      description:
        "Discuss your business goals and project requirements with Netofficials.",
      texts: d.texts,
      sources: [],
      claims: [],
      unresolved: [
        "Confirm approved business facts, replace placeholders and review all copy before publishing.",
      ],
    });
    const v = validateContent(content, d);
    const rev = await c.query(
      "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,$4) RETURNING id",
      [r.rows[0].id, JSON.stringify(content), JSON.stringify(v), "design-seed"],
    );
    await c.query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [
      rev.rows[0].id,
      r.rows[0].id,
    ]);
  });
}
await pool().end();
console.log("Draft inventory seeded; existing revisions preserved.");
