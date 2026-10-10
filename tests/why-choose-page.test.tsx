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
  assert.ok($("link[href^='/assets/why-choose.css']").length);
  assert.equal($("[class*='sk-'], [class*='ab-'], [class*='ct-'], [class*='en-'], [class*='hw-']").length, 0);
  assert.equal($("h1").length, 1);
  assert.equal($("#reasons .wc-reasons > li").length, 6);
  assert.equal($("main section:not(#hero) ol").length, 0, "nothing in the content is a numbered sequence");
  assert.equal($("main svg").length, 0, "no decorative icons");
  assert.equal($("table.wc-matrix thead th").length, 3);
  assert.equal($("table.wc-matrix tbody tr").length, 5);
  assert.equal($("table.wc-matrix tbody td").length, 15);
  assert.equal($("table.wc-matrix tbody td.is-us").length, 5);
  assert.equal($("#not-a-fit .wc-fits > li").length, 3);
  assert.equal($("#faq details").length, 5);
});

test("the alternatives get a fair hearing: both 'better choice' notes render under the table", () => {
  const $ = render();
  assert.equal($("#comparison .wc-better > div").length, 2);
  assert.match($("#comparison .wc-better h3").first().text(), /large outsourcing firm is the better choice/);
  assert.match($("#comparison .wc-better h3").last().text(), /freelancer is the better choice/);
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
