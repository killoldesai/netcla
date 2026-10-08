import test from "node:test";
import assert from "node:assert/strict";
import { getDesign } from "../src/designs";
import { contentSchema, safeURL, validateContent } from "../src/content";
import { publicContent } from "../src/public-content";
import { structuredData } from "../src/structured-data";
test("Hidden sections and draft facts never cross the public client boundary", () => {
  const design = getDesign("software-led");
  const section = design.sections!.find((s) => !s.required)!;
  const fields = new Set(section.fields);
  const c = contentSchema.parse({
    title: design.title,
    description: "A sufficiently detailed page description.",
    texts: { ...design.texts },
    hiddenSections: [section.id],
    claims: [
      {
        text: "Private evidence detail",
        factId: "00000000-0000-4000-8000-000000000001",
      },
    ],
  });
  const visible = publicContent(design, c);
  for (const field of fields)
    assert.equal(visible.content.texts[field], undefined);
  assert.equal(visible.content.claims.length, 0);
  assert.deepEqual(visible.design.texts, {});
  assert.ok(!("brief" in visible.design));
});
test("Required heroes and enquiry sections cannot be hidden", () => {
  const d = getDesign("custom-software");
  const c = contentSchema.parse({
    title: d.title,
    description: "A sufficiently detailed page description.",
    texts: d.texts,
    hiddenSections: [d.sections!.find((s) => s.required)!.id],
  });
  assert.ok(
    validateContent(c, d).errors.includes(
      "Unknown or required section cannot be hidden",
    ),
  );
});
test("Source URLs cannot contain executable schemes; author review is manual", () => {
  assert.ok(!safeURL.safeParse("javascript:alert(1)").success);
  assert.ok(safeURL.safeParse("https://example.com/source").success);
  const d = getDesign("custom-software");
  const c = contentSchema.parse({
    title: d.title,
    description: "A sufficiently detailed page description.",
    texts: d.texts,
    author: "Invented Person",
  });
  assert.ok(
    !validateContent(c, d).errors.some((e) => e.includes("Author identity")),
  );
  assert.ok(
    !validateContent(c, d).errors.some((e) => e.includes("Author identity")),
  );
});
test("Structured data uses visible FAQ content and honest publication dates", () => {
  const d = getDesign("custom-software");
  const c = contentSchema.parse({
    title: d.title,
    description: "A sufficiently detailed page description.",
    texts: d.texts,
  });
  const date = "2026-10-04T10:00:00.000Z";
  const data = structuredData(
    {
      path: d.path,
      kind: "article",
      content: c,
      created_at: date,
      first_published_at: date,
    },
    d,
    "https://example.com",
  );
  assert.equal((data["@graph"] as any[]).find((x) => x["@type"] === "Article").datePublished, date);
  assert.ok((data["@graph"] as any[]).some((x) => x["@type"] === "FAQPage"));
});
