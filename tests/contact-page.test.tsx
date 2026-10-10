import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema, leadSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { constrainEvidence } from "../src/publishing-pipeline";
import { contactBand, contactSections, effectiveSpec, imageSectionIds } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { isContactContent, SERVICE_SUGGESTIONS, TIMELINES } from "../src/contact-page";
import { pillars } from "../src/site-structure";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const paths = ["/", "/contact", "/services", "/engagement-models", "/how-we-work", "/hire-developers"];
const base = { path: "/contact", title: "Contact", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;

function content(over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec(base);
  const filled = (id: string, fields: string[]) =>
    Object.fromEntries(fields.map((f) => [f, /^proof-/.test(id) ? "" : /url$/.test(f) ? "/services" : /^a\d+$/.test(f) ? `<p>${f} answer</p>` : `${id} ${f}`]));
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Contact Netofficials, Software Development Company India",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: { ...filled(s.id, s.fields), ...(over[s.id] ?? {}) }, evidenceIds: [], omitted: false })),
    seo: { metaTitle: "Contact Netofficials, Software Development Company India", metaDescription: "d".repeat(140), primaryKeyword: "contact netofficials", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (c = content()) => load(renderToStaticMarkup(<V3Page content={c} path="/contact" paths={paths} />));

test("the Contact spec is a short form-first page with no illustrations", () => {
  const ids = contactSections(base).map((s) => s.id);
  assert.deepEqual(ids, ["hero", "contact-form", "next-steps", "prepare", "assurances", "other-routes", "proof-offices", "faq"]);
  assert.deepEqual(imageSectionIds(effectiveSpec(base)), []);
  for (const id of ids) assert.notEqual(rulesFor(id, "/contact")[0], rulesFor("no-such-section")[0], `${id} needs Contact rules`);
});

test("Contact renders its own layout; the form fields all exist in the lead schema", () => {
  const c = content();
  assert.ok(isContactContent(c, "/contact"));
  assert.ok(!isContactContent(c, "/about"));
  const $ = render(c);
  assert.ok($("main.v3-contact").length);
  assert.ok($("link[href^='/assets/contact.css']").length);
  assert.equal($("[class*='sk-'], [class*='ab-']").length, 0);
  assert.equal($("h1").length, 1);
  const names = new Set($("#contact-form [name]").map((_, el) => $(el).attr("name")).get());
  const allowed = new Set(Object.keys(leadSchema.shape));
  for (const n of names) assert.ok(allowed.has(n!), `${n} is not accepted by /api/leads`);
  for (const n of ["name", "email", "service", "goal", "timeline", "country", "budget", "website", "company_url"]) assert.ok(names.has(n), `missing field ${n}`);
  // Required fields match the lead schema's required fields.
  assert.deepEqual($("#contact-form [required]").map((_, el) => $(el).attr("name")).get().sort(), ["email", "goal", "name", "service"]);
  assert.equal($("input[name='service']").attr("data-service-context"), "true");
  assert.equal($("#ct-services option").length, SERVICE_SUGGESTIONS.length);
  assert.equal($("input[name='timeline']").length, TIMELINES.length);
  assert.equal($(".ct-trap input").attr("tabindex"), "-1");
});

test("service suggestions cover every practice the site links with ?service=", () => {
  for (const p of pillars) assert.ok(SERVICE_SUGGESTIONS.includes(p.service), p.service);
});

test("direct contact and offices stay hidden until approved facts fill them", () => {
  const $ = render();
  assert.equal($("#proof-offices").length, 0);
  assert.equal($("a[href^='mailto:']").length, 0);
  const filled = render(content({ "proof-offices": { heading: "Reach us", direct_email: "hello@example.com", direct_phone: "+91 98765 43210", office_1_city: "Pune", office_1_address: "Baner", office_1_timezone: "IST" } }));
  assert.equal(filled("a[href='mailto:hello@example.com']").length, 1);
  assert.equal(filled("a[href='tel:+919876543210']").length, 1);
  assert.match(filled(".ct-office").text(), /Pune/);
  assert.deepEqual(Object.values(constrainEvidence("proof-offices", { heading: "x", direct_email: "a@b.co" })).filter(Boolean), []);
});

test("sections link only to live pages, and the other-ways cards render", () => {
  const $ = render(content({ "other-routes": { route_1_url: "/engagement-models", route_2_url: "/not-a-page", route_3_url: "/how-we-work" } }));
  assert.equal($("#other-routes a").length, 2);
  assert.equal($("#next-steps li").length, 3);
  assert.equal($("#prepare .ct-checklist li").length, 4);
  assert.equal($("#faq details").length, 5);
});

test("Contact JSON-LD is a ContactPage and QA uses the Contact band", () => {
  const graph = pageGraph({ path: "/contact", content: content(), site: "https://example.com" })["@graph"] as Record<string, any>[];
  assert.equal(graph.find((n) => n["@type"] === "ContactPage")?.mainEntity["@id"], "https://example.com/#organization");
  const qa = runContentQA(content(), "/contact");
  assert.match(qa.checks.find((c) => c.id === "word-band")?.detail ?? "", new RegExp(`target ${contactBand.min}-${contactBand.max}`));
});
