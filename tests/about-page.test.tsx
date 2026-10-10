import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { constrainEvidence } from "../src/publishing-pipeline";
import { aboutBand, aboutSections, effectiveSpec, imageSectionIds } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { sitePage, sitePages } from "../src/site-structure";
import { ALSO, PRACTICES, isAboutContent } from "../src/about-page";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const sectorPaths = sitePages.filter((p) => p.type === "industry").map((p) => p.path);
const paths = ["/", "/about", "/contact", "/services", ...PRACTICES.flatMap((p) => [p.hub, ...p.services.map(([u]) => u)]), ...ALSO.map(([u]) => u), ...sectorPaths];

const base = { path: "/about", title: "About", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;

/** About content with generated-looking copy; `over` replaces fields of one section. */
function content(over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec(base);
  const filled = (id: string, fields: string[]) =>
    Object.fromEntries(fields.map((f) => [f, /^proof-/.test(id) || /^(?:founded_year|base_city|delivery_window)$/.test(f) ? "" : /url$/.test(f) ? "/contact" : /^(?:a\d+|body_paragraph)$/.test(f) ? `<p>${f} paragraph one</p><p>paragraph two</p>` : `${id} ${f}`]));
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Software Development Company in India, Netofficials",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: { ...filled(s.id, s.fields), ...(over[s.id] ?? {}) }, evidenceIds: [], omitted: false })),
    seo: { metaTitle: "Software Development Company in India, Netofficials", metaDescription: "d".repeat(140), primaryKeyword: "software development company india", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (c = content()) => load(renderToStaticMarkup(<V3Page content={c} path="/about" paths={paths} />));

test("the About spec is its own section list with four illustrations and no skeleton sections", () => {
  const spec = aboutSections(base);
  const ids = spec.map((s) => s.id);
  assert.deepEqual(ids, ["hero", "company-story", "company-glance", "practice-index", "principles", "delivery-timeline", "working-model", "industries-intro", "india-partner", "proof-team", "proof-clients", "proof-awards", "faq", "cta-banner"]);
  assert.ok(!ids.includes("service-overview") && !ids.includes("cost-factors"));
  assert.deepEqual(imageSectionIds(effectiveSpec(base)), ["hero", "company-story", "delivery-timeline", "working-model"]);
  for (const s of spec) assert.notEqual(rulesFor(s.id, "/about")[0], rulesFor("no-such-section")[0], `${s.id} needs About rules`);
});

test("evidence-gated facts are blanked unless an approved fact supports them", () => {
  const out = constrainEvidence("company-glance", { heading: "At a glance", founded_year: "2012", base_city: "Pune", delivery_window: "09:00-18:00 IST" });
  assert.equal(out.founded_year, "");
  assert.equal(out.base_city, "");
  assert.equal(out.delivery_window, "");
  const kept = constrainEvidence("company-glance", { heading: "At a glance", founded_year: "2012", base_city: "Pune", delivery_window: "" }, [{ statement: "Netofficials was founded in 2012 and is based in Pune, India." }]);
  assert.equal(kept.founded_year, "2012");
  assert.equal(kept.base_city, "Pune");
  // Proof sections never carry generated text.
  assert.deepEqual(Object.values(constrainEvidence("proof-team", { heading: "Team", leader_1_name: "A B" })).filter(Boolean), []);
});

test("About renders its own layout with no skeleton classes and hides empty proof blocks", () => {
  const c = content();
  assert.ok(isAboutContent(c, "/about"));
  assert.ok(!isAboutContent(c, "/contact"));
  const $ = render(c);
  assert.ok($("main.v3-about").length);
  assert.ok($("link[href^='/assets/about.css']").length);
  assert.equal($("link[href^='/assets/skeleton.css']").length, 0);
  assert.equal($("[class*='sk-']").length, 0);
  assert.equal($("h1").length, 1);
  for (const id of ["proof-team", "proof-clients", "proof-awards"]) assert.equal($("#" + id).length, 0, id + " must not render without evidence");
  // Glance rows with no approved fact are not shown; the computed row is.
  assert.deepEqual($(".ab-glance dt").map((_, el) => $(el).text()).get(), ["Core practices"]);
});

test("practice rows and sector chips come from the site structure and link to live pages", () => {
  for (const p of PRACTICES) {
    assert.ok(sitePage(p.hub), p.hub);
    for (const [url] of p.services) assert.ok(sitePage(url), url);
  }
  for (const [url] of ALSO) assert.ok(sitePage(url), url);
  const $ = render();
  assert.equal($("#practice-index .ab-practices > li").length, 4);
  assert.equal($("#practice-index .ab-practices > li").first().find("a[href='/custom-software-development']").length > 0, true);
  assert.equal($("#industries-intro .ab-sectors li").length, sectorPaths.length);
});

test("approved evidence fills the glance list, and proof blocks appear once they have content", () => {
  const $ = render(content({
    "company-glance": { founded_year: "2012", base_city: "Pune" },
    "proof-team": { heading: "The team", leader_1_name: "Asha Rao", leader_1_title: "Head of Engineering", leader_1_bio: "Leads delivery." },
    "proof-awards": { heading: "Recognition", award_1: "Clutch top developer" },
  }));
  assert.deepEqual($(".ab-glance dt").map((_, el) => $(el).text()).get(), ["Founded", "Based in", "Core practices"]);
  assert.equal($("#proof-team .ab-team li").length, 1);
  assert.equal($("#proof-awards .ab-awards li").length, 1);
  assert.equal($("#proof-clients").length, 0);
});

test("About JSON-LD is an AboutPage and states a founding date only when the glance field is filled", () => {
  const graph = (c: ReturnType<typeof content>) => pageGraph({ path: "/about", content: c, site: "https://example.com" })["@graph"] as Record<string, any>[];
  const plain = graph(content());
  assert.equal(plain.find((n) => n["@type"] === "AboutPage")?.mainEntity["@id"], "https://example.com/#organization");
  const org = plain.find((n) => n["@type"] === "Organization")!;
  assert.equal(org.foundingDate, undefined);
  assert.equal(org.address.addressLocality, undefined);
  const withFacts = graph(content({ "company-glance": { founded_year: "2012", base_city: "Pune" } })).find((n) => n["@type"] === "Organization")!;
  assert.equal(withFacts.foundingDate, "2012");
  assert.equal(withFacts.address.addressLocality, "Pune");
});

test("About QA uses its own word band and structured-data check", () => {
  const qa = runContentQA(content(), "/about");
  const band = qa.checks.find((c) => c.id === "word-band")!;
  assert.match(band.detail ?? "", new RegExp(`target ${aboutBand.min}-${aboutBand.max}`));
  assert.ok(qa.checks.some((c) => c.id === "jsonld"));
});
