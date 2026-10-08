import test from "node:test";
import assert from "node:assert/strict";
import { allDesigns } from "../src/designs";
import { contentSchema, validateContent, leadSchema } from "../src/content";
import { parseOutput } from "../src/providers";
test("Every approved page has a unique production route and complete text slots", () => {
  assert.equal(allDesigns.length, 54);
  assert.equal(new Set(allDesigns.map((d) => d.path)).size, 54);
  for (const d of allDesigns) {
    assert.ok(d.nodes.length);
    const c = contentSchema.parse({
      title: d.title,
      description: "A sufficiently detailed description for this page.",
      texts: d.texts,
    });
    assert.equal(Object.keys(c.texts).length, Object.keys(d.texts).length);
  }
});
test("Structural checks remain while factual review is manual", () => {
  const d = allDesigns.find((d) => d.id === "custom-software")!;
  const c = contentSchema.parse({
    title: d.title,
    description: "A sufficiently detailed description for this page.",
    texts: {},
    unresolved: ["Missing proof"],
    claims: [
      { text: "Example", factId: "00000000-0000-4000-8000-000000000001" },
    ],
    sources: ["00000000-0000-4000-8000-000000000002"],
  });
  const v = validateContent(c, d);
  assert.ok(v.errors.includes("Missing required design text fields"));
  assert.ok(!v.errors.includes("Claim references an unapproved fact"));
  assert.ok(!v.errors.includes("Source is not approved"));
  assert.ok(!v.errors.includes("Missing proof"));
});
test("Structured pages do not inherit legacy text-slot or layout limits", () => {
  const d = allDesigns.find((d) => d.id === "custom-software")!;
  const c = contentSchema.parse({
    schemaVersion: 2,
    title: d.title,
    description: "A sufficiently detailed description for this page.",
    texts: { intro: "A detailed introduction to the service. ".repeat(20) },
    hero: {
      heading: "Custom software",
      body: "Discuss requirements and delivery options.",
      ctaLabel: "Contact us",
      ctaPath: "/contact",
    },
    sections: [
      {
        id: "section-1",
        heading: "Delivery",
        level: 2,
        paragraphs: ["Define the project scope and delivery process."],
        items: [],
        cards: [],
        faqs: [],
        links: [],
        table: { columns: [], rows: [] },
      },
    ],
  });
  const result = validateContent(c, d);
  assert.deepEqual(result.errors, []);
  assert.ok(!result.warnings.some((w) => w.startsWith("Review layout length")));
  c.texts.intro = "<script>alert(1)</script>";
  assert.ok(
    validateContent(c, d).errors.includes("Executable markup is not allowed"),
  );
  const legacy = contentSchema.parse({
    title: d.title,
    description: c.description,
    texts: { ...d.texts, intro: "Extra field" },
  });
  assert.ok(validateContent(legacy, d).errors.includes("Unknown text fields"));
});
test("AI markup and scripts are rejected", () => {
  const d = allDesigns[0];
  const c = contentSchema.parse({
    title: d.title,
    description: "A sufficiently detailed description for this page.",
    texts: { ...d.texts, t0: "<script>alert(1)</script>" },
  });
  assert.ok(
    validateContent(c, d).errors.includes("Executable markup is not allowed"),
  );
});
test("Lead validation rejects invalid email and short brief, allows optional budget", () => {
  const base = {
    requestId: "00000000-0000-4000-8000-000000000001",
    name: "A buyer",
    email: "buyer@example.com",
    service: "Custom software",
    goal: "Build a customer portal",
    landingPage: "/custom-software-development",
  };
  assert.ok(leadSchema.safeParse(base).success);
  assert.ok(!leadSchema.safeParse({ ...base, email: "bad" }).success);
  assert.ok(!leadSchema.safeParse({ ...base, goal: "a" }).success);
});
test("Provider responses require parseable JSON", () => {
  assert.deepEqual(parseOutput('```json\n{"ok":true}\n```'), { ok: true });
  assert.throws(() => parseOutput("not json"));
});
