import assert from "node:assert/strict";
import test from "node:test";
import { buildRepairPrompt, mergeRepair, overLimitFields, wordCount } from "../src/prompts/length-repair";
import { composeMetaTitle } from "../src/prompts/meta-title";
import { runContentQA } from "../src/content-qa";
import { contentSchema } from "../src/content";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

test("only fields over their hard limit are flagged", () => {
  const over = overLimitFields({
    a1: words(80), // FAQ answer, within 85
    a2: words(130), // over
    card_1_body: words(50),
    card_2_body: words(70), // over
    svc_1_body: words(100), // over
    heading: words(300), // headings are capped at 12 words
    section_label: words(40), // no word target
    body_paragraph: `<p>${words(300)}</p>`, // over 250
  });
  assert.deepEqual(over.map((o) => o.key).sort(), ["a2", "body_paragraph", "card_2_body", "heading", "svc_1_body"]);
  assert.equal(overLimitFields({ heading: words(10) }).length, 0);
  // The same field name can have a tighter limit in one section.
  assert.equal(overLimitFields({ body_paragraph: `<p>${words(180)}</p>` }, "why-netofficials").length, 1);
  assert.equal(overLimitFields({ body_paragraph: `<p>${words(180)}</p>` }, "service-overview").length, 0);
  assert.equal(over.find((o) => o.key === "a2")?.words, 130);
});

test("the repair prompt carries only the offending fields with their limits", () => {
  const fields = { a1: words(60), a2: words(130) };
  const over = overLimitFields(fields);
  const prompt = JSON.parse(buildRepairPrompt("faq", fields, over));
  assert.deepEqual(Object.keys(prompt.fields), ["a2"]);
  assert.equal(prompt.limits.a2.maxWords, 85);
});

test("merge keeps the original when the retry is empty, not a string, or not shorter", () => {
  const fields = { a1: words(130), a2: words(130), a3: words(130) };
  const over = overLimitFields(fields);
  const merged = mergeRepair(fields, { a1: words(70), a2: "", a3: words(140) }, over);
  assert.deepEqual(merged.fixed, ["a1"]);
  assert.equal(wordCount(merged.fields.a1), 70);
  assert.equal(wordCount(merged.fields.a2), 130);
  assert.equal(wordCount(merged.fields.a3), 130);
});

test("title composer skips stopwords and over-long entities and uses the next fit", () => {
  assert.equal(
    composeMetaTitle("hire react developer", ["react developer for hire", "remote react developer"], "Netofficials", ["TypeScript", "Redux"]),
    "Hire React Developer, TypeScript, Redux | Netofficials",
  );
  // The long entity does not fit, so the next shorter one is used instead of stopping.
  assert.equal(
    composeMetaTitle("healthcare software development", [], "Netofficials", ["Electronic Health Record Interoperability Standards", "HIPAA"]),
    "Healthcare Software Development, HIPAA | Netofficials",
  );
});

const page = (text: string) =>
  contentSchema.parse({
    schemaVersion: 3,
    title: "Healthcare software development, HIPAA | Netofficials",
    description: "d".repeat(130),
    texts: {},
    pageSections: [{ id: "compliance-data", order: 1, fields: { item_1_body: text }, evidenceIds: [], omitted: false }],
    seo: { metaTitle: "Healthcare Software Development, HIPAA", metaDescription: "d".repeat(130), primaryKeyword: "healthcare software development" },
  });

test("protocol versions are not marketing figures, real claims still are", () => {
  const figures = (text: string) => runContentQA(page(text), "/healthcare-software-development").checks.find((c) => c.id === "unsupported-figures")?.status;
  assert.equal(figures("HIPAA expects AES-256 encryption at rest and TLS 1.2+ in transit, with OAuth 2.0 for access."), "pass");
  assert.equal(figures("We have delivered 500+ healthcare projects for over 40 clients."), "fail");
});

test("a reply with commentary and a second draft still parses, using the last complete object", async () => {
  const { parseModelJSON, jsonObjects } = await import("../src/prompts/validate");
  const reply = '```json\n{"a1":"first draft"}\n```\n\nWait, let me recount the words.\n\n```json\n{"a1":"final { brace } draft"}\n```';
  assert.equal(jsonObjects(reply).length, 2);
  assert.deepEqual(parseModelJSON(reply), { a1: "final { brace } draft" });
  // Still handles the plain and fenced cases.
  assert.deepEqual(parseModelJSON('{"a":"b"}'), { a: "b" });
  assert.throws(() => parseModelJSON("no json at all"));
});
