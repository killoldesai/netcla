import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { constrainEvidence } from "../src/publishing-pipeline";
import { effectiveSpec, imageSectionIds, pageBand, pageLabel, whyChooseBand, whyChooseSections } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { isWhyChooseContent } from "../src/why-choose-page";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const paths = ["/", "/contact", "/how-we-work", "/engagement-models", "/services", "/why-choose-netofficials"];
const base = { path: "/why-choose-netofficials", title: "Why Choose", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;

function content(over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec(base);
  const filled = (id: string, fields: string[]) =>
    Object.fromEntries(fields.map((f) => [f, /^proof-/.test(id) ? "" : /url$/.test(f) ? "/how-we-work" : /^a\d+$/.test(f) ? `<p>${f} answer</p>` : `${id} ${f}`]));
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Why Choose Netofficials, Software Development Company India",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: { ...filled(s.id, s.fields), ...(over[s.id] ?? {}) }, evidenceIds: [], omitted: false })),
    seo: { metaTitle: "Why Choose Netofficials, Software Development Company India", metaDescription: "d".repeat(140), primaryKeyword: "why choose netofficials", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (c = content()) => load(renderToStaticMarkup(<V3Page content={c} path="/why-choose-netofficials" paths={paths} />));

test("the Why Choose spec is its own page with a registered band and a hero-only illustration", () => {
  const ids = whyChooseSections(base).map((s) => s.id);
  assert.deepEqual(ids, ["hero", "reasons", "comparison", "not-a-fit", "proof-testimonials", "routes", "faq", "cta-banner"]);
  assert.deepEqual(pageBand("/why-choose-netofficials"), whyChooseBand);
  assert.equal(pageLabel("/why-choose-netofficials"), "why choose");
  assert.deepEqual(imageSectionIds(effectiveSpec(base)), ["hero"]);
  for (const id of ids) assert.notEqual(rulesFor(id, "/why-choose-netofficials")[0], rulesFor("no-such-section")[0], `${id} needs Why Choose rules`);
});

test("rules ban rankings, figures and competitor names, and ask for the fair comparison", () => {
  const text = ["hero", "reasons", "comparison", "not-a-fit", "faq"].flatMap((id) => rulesFor(id, "/why-choose-netofficials")).join(" ");
  assert.match(text, /Never state years of experience, team sizes, client counts, ratings, reviews/);
  assert.match(text, /never name a competitor/);
  assert.match(text, /when a large outsourcing firm is the better choice/);
  assert.match(text, /when a freelancer is the better choice/);
});

test("reasons are an unnumbered list with no icons, and the comparison is a real table", () => {
  const c = content();
  assert.ok(isWhyChooseContent(c, "/why-choose-netofficials"));
  assert.ok(!isWhyChooseContent(c, "/about"));
  const $ = render(c);
  assert.ok($("main.v3-why").length);
  assert.ok($("link[href^='/assets/nx/pages/why-choose.css']").length);
  assert.equal($("[class*='wc-'], [class*='ab-'], [class*='ct-'], [class*='en-'], [class*='hw-']").length, 0, "no classes from the legacy or other renderers");
  assert.equal($("h1").length, 1);
  assert.equal($("#reasons .sk-cards > article").length, 6);
  assert.equal($("main section:not(#hero) ol").length, 0, "nothing in the content is a numbered sequence");
  assert.equal($("#reasons svg, #not-a-fit svg").length, 0, "no decorative icons on the reason and fit cards: the content has no icon field");
  assert.equal($("table.why-matrix thead th").length, 3);
  assert.equal($("table.why-matrix tbody tr").length, 5);
  assert.equal($("table.why-matrix tbody td").length, 15);
  assert.equal($("table.why-matrix tbody td.is-us").length, 5);
  assert.equal($("#not-a-fit .sk-cards > article").length, 3);
  assert.equal($("#faq details").length, 5);
});

test("the alternatives get a fair hearing: both 'better choice' notes render under the table", () => {
  const $ = render();
  assert.equal($("#comparison .why-notes > div").length, 2);
  assert.match($("#comparison .why-notes h3").first().text(), /large outsourcing firm is the better choice/);
  assert.match($("#comparison .why-notes h3").last().text(), /freelancer is the better choice/);
});

test("the hero keeps its analytics CTA and shows the section image when one exists", () => {
  const $ = render();
  assert.equal($("#hero .hero__actions a").first().attr("href"), "/contact?service=Help%20defining%20the%20scope");
  assert.equal($("#hero .hero__art svg.il").length, 1, "fallback illustration without an image");
  const c = content();
  const hero = c.pageSections!.find((s) => s.id === "hero")!;
  hero.asset = { id: "hero-image", name: "why-hero", alt: "Hero image", width: 640, height: 400 } as never;
  const $img = render(c);
  assert.equal($img("#hero .hero__art img").attr("width"), "640");
  assert.equal($img("#hero .hero__art img").attr("height"), "400");
  assert.equal($img("#hero .hero__art svg").length, 0);
});

test("testimonials stay hidden until approved quotes exist, and are never generated", () => {
  assert.equal(render()("#proof-testimonials").length, 0);
  const $ = render(content({ "proof-testimonials": { heading: "Client feedback", quote_1_text: "A calm, clear project.", quote_1_name: "A. Client", quote_1_role: "CTO" } }));
  assert.equal($("#proof-testimonials figure").length, 1);
  assert.deepEqual(Object.values(constrainEvidence("proof-testimonials", { heading: "x", quote_1_text: "y", quote_1_name: "z" })).filter(Boolean), []);
});

test("routes only link to live pages", () => {
  const $ = render(content({ routes: { route_1_url: "/how-we-work", route_2_url: "/not-a-page", route_3_url: "/engagement-models" } }));
  assert.equal($("#routes a").length, 2);
});

test("JSON-LD lists the six reasons, and QA uses the Why Choose band", () => {
  const graph = pageGraph({ path: "/why-choose-netofficials", content: content(), site: "https://example.com" })["@graph"] as Record<string, any>[];
  const page = graph.find((n) => n["@type"] === "WebPage")!;
  assert.equal(page.mainEntity["@type"], "ItemList");
  assert.equal(page.mainEntity.itemListElement.length, 6);
  const qa = runContentQA(content(), "/why-choose-netofficials");
  assert.match(qa.checks.find((c) => c.id === "word-band")?.detail ?? "", new RegExp(`target ${whyChooseBand.min}-${whyChooseBand.max}`));
});

test("older accepted content without the not-a-fit section keeps the legacy renderer", () => {
  const legacy = content();
  legacy.pageSections = legacy.pageSections!.filter((s) => s.id !== "not-a-fit");
  assert.ok(!isWhyChooseContent(legacy, "/why-choose-netofficials"));
});
