import test from "node:test";
import assert from "node:assert/strict";
import { contentSchema, type Content } from "../src/content";
import { runContentQA, type QACheck } from "../src/content-qa";

const words = (n: number, w = "word") => Array.from({ length: n }, () => w).join(" ");
const byId = (checks: QACheck[], id: string) => checks.find((c) => c.id === id);

const faqFields = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [[`q${i + 1}`, `Question ${i + 1}?`], [`a${i + 1}`, words(60)]]).flat());

function page(
  sections: Record<string, Record<string, string>>,
  seo: { metaTitle?: string; answerSummary?: string } = {},
): Content {
  const ids = Object.keys(sections);
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Android App Development Services",
    description: "Android app development services from an India-based team, scoped with you before the build starts.",
    texts: {},
    pageSections: ids.map((id, i) => ({ id, order: i + 1, fields: sections[id], evidenceIds: [], omitted: false })),
    seo: {
      metaTitle: seo.metaTitle ?? "Android App Development, Kotlin, Jetpack Compose",
      metaDescription: "Android app development services from an India-based team: one Kotlin codebase, scoped with you before the build starts.",
      primaryKeyword: "android app development services",
      answerSummary: seo.answerSummary ?? words(50),
    },
  });
}

/** A service page with a valid overview, FAQ and hero, plus `extraWords` of filler in the related section. */
function servicePage(extraWords: number, faqCount = 8, faqSectionId = "faq") {
  const filler: Record<string, string> = {};
  let remaining = extraWords;
  for (let i = 0; remaining > 0; i++) {
    const n = Math.min(remaining, 900);
    filler[`card_${i + 1}_body`] = words(n);
    remaining -= n;
  }
  return page({
    hero: { h1: "Android app development services", subheadline: words(30, "android") },
    "service-overview": { heading: "What is Android development?", body_paragraph: `<p>${words(50)}</p><p>${words(80)}</p>` },
    "capabilities": filler,
    [faqSectionId]: { heading: "Questions", ...faqFields(faqCount) },
  });
}

test("meta title passes as a comma keyword list and warns on the old pipe format", () => {
  const good = runContentQA(page({ hero: { h1: "Android app development services" } }, { metaTitle: "Android App Development, Kotlin, Jetpack Compose" }), "/android-app-development");
  assert.equal(byId(good.checks, "meta-title-keywords")?.status, "pass");

  const piped = runContentQA(page({ hero: { h1: "Android app development services" } }, { metaTitle: "Android App Development Services | Netofficials" }), "/android-app-development");
  assert.equal(byId(piped.checks, "meta-title-keywords")?.status, "warn");
});

test("word band fails a 100-word service page and passes a ~2700-word one", () => {
  const short = runContentQA(
    page({ hero: { h1: "Android app development services", subheadline: words(60, "android") }, "service-overview": { heading: "What is it?", body_paragraph: `<p>${words(40)}</p>` } }),
    "/android-app-development",
  );
  const shortBand = byId(short.checks, "word-band");
  assert.equal(shortBand?.status, "fail");
  assert.match(shortBand?.detail ?? "", /^10[0-9] words \(target 2300-3000\)$/);

  const long = runContentQA(servicePage(2000), "/android-app-development");
  const longBand = byId(long.checks, "word-band");
  assert.equal(longBand?.status, "pass");
  assert.match(longBand?.detail ?? "", /^\d+ words \(target 2300-3000\)$/);
});

test("FAQ check wants 8 questions for commercial families: 8 pass, 4 warn, 2 still block", () => {
  const eight = runContentQA(servicePage(1400, 8), "/android-app-development");
  assert.equal(byId(eight.checks, "faq")?.status, "pass");
  const four = runContentQA(servicePage(1400, 4), "/android-app-development");
  assert.equal(byId(four.checks, "faq")?.status, "warn");
  assert.equal(byId(four.checks, "faq")?.label, "At least 8 FAQs");
  assert.equal(byId(runContentQA(servicePage(1400, 2), "/android-app-development").checks, "faq")?.status, "fail");
});

test("answer summary warns on a 20-word summary and when it is missing (legacy drafts are not blocked)", () => {
  const short = runContentQA(page({ hero: { h1: "Android app development services" } }, { answerSummary: words(20) }), "/android-app-development");
  assert.equal(byId(short.checks, "answer-summary")?.status, "warn");

  const missing = runContentQA(page({ hero: { h1: "Android app development services" } }, { answerSummary: "" }), "/android-app-development");
  const check = byId(missing.checks, "answer-summary");
  assert.equal(check?.status, "warn");
  assert.equal(check?.detail, "missing");
});

test("structured data check passes when the FAQ count matches the FAQPage and warns when it does not", () => {
  const matched = runContentQA(servicePage(1400, 8), "/android-app-development");
  assert.equal(byId(matched.checks, "jsonld")?.status, "pass");

  // Questions in a section whose id lacks "faq" are counted on the page but not emitted as FAQPage.
  const unmatched = runContentQA(servicePage(1400, 8, "questions"), "/android-app-development");
  const check = byId(unmatched.checks, "jsonld");
  assert.equal(check?.status, "warn");
  assert.match(check?.detail ?? "", /FAQPage for 8 questions/);
});

test("guide paths use the guide band (2800-3800 words)", () => {
  const guide = (n: number) =>
    page({
      hero: { h1: "Custom software development cost", subheadline: words(30, "cost") },
      "editorial-1": { heading: "Cost", body_paragraph: `<p>${words(Math.min(n, 900))}</p>` },
      "editorial-2": { heading: "Factors", body_paragraph: `<p>${words(Math.max(0, Math.min(n - 900, 900)))}</p>` },
      "editorial-3": { heading: "More", body_paragraph: `<p>${words(Math.max(0, n - 1800))}</p>` },
    });
  const thin = runContentQA(guide(1000), "/blog/custom-software-development-cost");
  const thinBand = byId(thin.checks, "word-band");
  assert.equal(thinBand?.status, "fail");
  assert.match(thinBand?.detail ?? "", /target 2800-3800/);

  const full = runContentQA(guide(3000), "/blog/custom-software-development-cost");
  assert.equal(byId(full.checks, "word-band")?.status, "pass");
  // Guides do not get the commercial-only checks.
  assert.equal(byId(full.checks, "jsonld"), undefined);
  assert.equal(byId(full.checks, "meta-title-keywords"), undefined);
});

test("other pages such as /careers skip the family-only checks", () => {
  const careers = runContentQA(page({ hero: { h1: "Talk to us" }, form: { heading: "Careers" } }, { answerSummary: "" }), "/careers");
  for (const id of ["meta-title-keywords", "word-band", "answer-summary", "jsonld"])
    assert.equal(byId(careers.checks, id), undefined, `${id} should not run for /careers`);
});

test("unsupportedFigure flags claims but not product versions", async () => {
    const { unsupportedFigure } = await import("../src/content-qa");
    for (const claim of ["over 50 developers", "40% faster", "500+ clients", "5 years of experience", "from $50 per hour", "with 5 developers"])
      assert.ok(unsupportedFigure.test(claim), claim);
    for (const version of ["a Magento 2 developer", "a magento 2 developer", "Vue 3 projects", "ES2015+ behaviour", "TLS 1.2+ only", "OAuth 2.0 flows"])
      assert.ok(!unsupportedFigure.test(version), version);
});
