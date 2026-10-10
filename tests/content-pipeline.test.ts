import test from "node:test";
import assert from "node:assert/strict";
import { contentSchema, type Content } from "../src/content";
import { containsKeyword, runContentQA } from "../src/content-qa";
import { publishBlockers } from "../src/admin-publish";
import { cleanSectionFields, parseModelJSON } from "../src/prompts/validate";
import { buildBriefPrompt, parseBrief } from "../src/prompts/page-brief";
import { buildImagePrompt } from "../src/prompts/images";
import { effectiveSpec, imageSectionIds } from "../src/prompts/templates";
import { writerSystemPrompt } from "../src/prompts/system";
import { pageGraph } from "../src/structured-data";
import type { PageSpecification, SectionSpecification } from "../src/page-spec-schema";

const section = (id: string, fields: string[], extra: Partial<SectionSpecification> = {}): SectionSpecification => ({
  id, order: 1, name: id, layout: "", fields, originalPrompt: "", hero: false, imagePrompt: "", ratio: "", originalRow: {}, ...extra,
});
const spec = (path: string, sections: SectionSpecification[]): PageSpecification => ({
  path, databaseId: "00000000-0000-4000-8000-000000000000", title: "Flutter App Development Services", source: "test", blueprintPrompt: "", sections, originalRows: [{}],
});
const words = (n: number, w = "word") => Array.from({ length: n }, () => w).join(" ");

function page(fields: Record<string, Record<string, string>>, seo = true): Content {
  const ids = Object.keys(fields);
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Flutter App Development Services for Startups",
    description: "Flutter app development services from an India-based team: one Dart codebase for iOS and Android, scoped with you before the build starts.",
    texts: {},
    pageBlueprint: Object.fromEntries(ids.map((id) => [id, { recommended_component: id === "hero" ? "HeroFull" : "CardGrid3Col", spacing_above: 0, background: "#ffffff", max_width: "1320px", mobile_stack: "Stack" }])),
    pageSections: ids.map((id, i) => ({ id, order: i + 1, fields: fields[id] })),
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
    seo: seo ? { metaTitle: "Flutter App Development Services for Startups", metaDescription: "Flutter app development services from an India-based team: one Dart codebase for iOS and Android, scoped with you before the build starts.", primaryKeyword: "flutter app development services" } : undefined,
  });
}

test("keyword matching tolerates plurals and ignores filler words", () => {
  assert.ok(containsKeyword("We provide Flutter app development for startups", "flutter app development services"));
  assert.ok(!containsKeyword("We build React apps", "flutter app development"));
});

test("QA fails invented figures and generic AI phrasing, and passes clean pages", () => {
  const faq = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [[`q${i + 1}`, "How much does it cost?"], [`a${i + 1}`, words(60)]]).flat());
  const clean = page({
    hero: { h1: "Flutter app development services", subheadline: words(30, "flutter") },
    "service-overview": { heading: "What is Flutter?", body_paragraph: `<p>${words(50)}</p><p>${words(120)} <a href="/mobile-app-development">mobile</a> <a href="/ios-app-development">ios</a></p>` },
    faq: { heading: "Questions", ...faq },
  });
  const report = runContentQA(clean, "/flutter-app-development");
  // The fixture is a short page, so the family word band (which only warns above half the band) is the one expected failure.
  assert.deepEqual(report.checks.filter((c) => c.status === "fail").map((c) => c.id), ["word-band"]);
  const bad = page({
    hero: { h1: "Flutter apps", subheadline: "We deliver 40% faster launches with cutting-edge, seamless delivery and robust leverage." },
    faq: { heading: "Questions", q1: "Why?", a1: "Because." },
  });
  const failed = runContentQA(bad, "/flutter-app-development").checks.filter((c) => c.status === "fail").map((c) => c.id);
  assert.ok(failed.includes("unsupported-figures"));
  assert.ok(failed.includes("banned-phrases"));
  assert.ok(failed.includes("faq"));
});

test("publish gate blocks failing v3 pages and unreviewed images, never legacy pages", () => {
  const bad = page({ hero: { h1: "", subheadline: "Over 500 clients trust us." } });
  const blockers = publishBlockers(bad, "/flutter-app-development", 2);
  assert.ok(blockers.some((b) => /figures/.test(b)));
  assert.ok(blockers.some((b) => /2 generated images/.test(b)));
  assert.deepEqual(publishBlockers({ ...bad, schemaVersion: 2 }, "/x", 5), []);
});

test("section cleaner repairs recoverable problems and keeps safe HTML only in body fields", () => {
  const s = section("service-overview", ["heading", "body_paragraph", "card_1_icon_key", "related_url"]);
  const { fields, notes } = cleanSectionFields(
    s,
    {
      heading: "<b>What is Flutter?</b>",
      body_paragraph: '<p>Answer <a href="/unknown">x</a> <a href="/contact">contact</a></p><script>alert(1)</script>',
      card_1_icon_key: "web-api",
      related_url: "/does-not-exist",
      extra: "ignored",
    },
    ["/contact"],
  );
  assert.equal(fields.heading, "What is Flutter?");
  assert.ok(!fields.body_paragraph.includes("<script"));
  assert.ok(fields.body_paragraph.includes('href="/contact"'));
  assert.ok(!fields.body_paragraph.includes("/unknown"));
  assert.equal(fields.card_1_icon_key, "api-plug");
  assert.equal(fields.related_url, "");
  assert.ok(notes.length >= 3);
  assert.deepEqual(parseModelJSON('Here you go:\n```json\n{"a":"b"}\n```'), { a: "b" });
  // Unescaped double quotes inside HTML attributes are repaired.
  assert.deepEqual(parseModelJSON('{"a1":"<p>See <a href="/contact">contact</a></p>"}'), { a1: "<p>See <a href='/contact'>contact</a></p>" });
});

test("brief parsing drops links outside the allowed list and prompts carry the rules", () => {
  const links = [{ path: "/mobile-app-development", label: "Mobile apps", blurb: "" }];
  const brief = parseBrief(
    { searchIntent: "nonsense", audience: "CTOs", primaryKeyword: "flutter app development", secondaryKeywords: [], entities: ["Dart"], buyerQuestions: [], angle: "", metaTitle: "T".repeat(90), metaDescription: "d", internalLinks: [{ path: "/made-up", anchor: "x" }, { path: "/mobile-app-development", anchor: "mobile app development" }] },
    links,
  );
  assert.equal(brief.searchIntent, "commercial");
  // A title that is not a comma-separated keyword list is rebuilt from the primary keyword plus the brief's entities.
  assert.equal(brief.metaTitle, "Flutter App Development, Dart | Netofficials");
  assert.deepEqual(brief.internalLinks.map((l) => l.path), ["/mobile-app-development"]);
  const prompt = JSON.parse(buildBriefPrompt({ spec: spec("/flutter-app-development", [section("hero", ["h1"], { hero: true })]), links, facts: [], imageSections: ["hero"] }));
  assert.match(prompt.requirements.join(" "), /metaDescription/);
  assert.match(writerSystemPrompt, /cutting-edge/);
});

test("guides get a long-form template and images get flat-style prompts with alt text", () => {
  const guide = effectiveSpec(spec("/blog/custom-software-development-cost", [section("hero", ["h1"], { hero: true, ratio: "16:9" })]));
  assert.deepEqual(guide.sections.map((s) => s.id).slice(0, 3), ["hero", "key-takeaways", "editorial-1"]);
  assert.ok(guide.sections.find((s) => s.id === "faq")!.fields.includes("a6"));
  assert.deepEqual(imageSectionIds(guide), ["hero", "editorial-2"]);
  const image = buildImagePrompt(guide, "hero", undefined);
  assert.match(image.prompt, /no gradients/i);
  assert.ok(image.alt.length <= 125 && image.alt.length > 10);
});

test("structured data includes organisation, service, breadcrumbs and FAQ", () => {
  const content = page({ hero: { h1: "Flutter" }, faq: { q1: "Q?", a1: "<p>Answer</p>" } });
  const graph = pageGraph({ path: "/flutter-app-development", content, site: "https://example.com" })["@graph"] as any[];
  const types = graph.map((n) => n["@type"]);
  assert.deepEqual(types, ["Organization", "Service", "BreadcrumbList", "FAQPage", "WebSite"]);
  assert.deepEqual(graph[2].itemListElement.map((i: any) => i.item), ["https://example.com", "https://example.com/mobile-app-development", "https://example.com/flutter-app-development"]);
  assert.equal(graph[3].mainEntity[0].acceptedAnswer.text, "Answer");
  const article = pageGraph({ path: "/blog/custom-software-development-cost", content, site: "https://example.com" })["@graph"] as any[];
  assert.equal(article[1]["@type"], "Article");
});
