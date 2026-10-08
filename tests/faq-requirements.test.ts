import test from "node:test";
import assert from "node:assert/strict";
import { faqRequirements } from "../src/faq-requirements";
import { validatePlanned } from "../src/site-plan";
test("FAQ briefs require complete structured answers without forcing lists in other sections", () => {
  const brief = {
    prompt:
      "FAQ - 5 questions: scope / timing / integration / security / process",
    headings: [
      { id: "section-1", heading: "Frequently Asked Questions", level: 2 },
    ],
  };
  assert.equal(faqRequirements(brief)[0].minimum, 5);
  const section: any = {
    ...brief.headings[0],
    paragraphs: ["General introduction alone is not an FAQ"],
    items: [],
    cards: [],
    table: { columns: [], rows: [] },
    faqs: [],
    links: [],
  };
  const content: any = { schemaVersion: 2, sections: [section] };
  assert.ok(
    validatePlanned(content, brief, []).some((e) => e.includes("5 complete")),
  );
  section.faqs = Array.from({ length: 5 }, (_, i) => ({
    question: `Question ${i + 1}?`,
    answer: "A practical answer.",
  }));
  assert.deepEqual(validatePlanned(content, brief, []), []);
  section.faqs[0].answer = " ";
  assert.ok(
    validatePlanned(content, brief, []).some((e) => e.includes("blank")),
  );
  assert.deepEqual(
    faqRequirements({ headings: [{ id: "section-1", heading: "Services" }] }),
    [],
  );
});
