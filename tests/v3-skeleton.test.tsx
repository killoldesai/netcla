import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { effectiveSpec } from "../src/prompts/templates";
import { templateBlueprint } from "../src/page-template";
import { isSkeletonContent } from "../src/v3-skeleton";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const paths = ["/", "/contact", "/mobile-app-development", "/android-app-development", "/flutter-app-development", "/services", "/how-we-work", "/healthcare-software-development"];
const fill = (key: string, n = 1) => `${key} ${"word ".repeat(n)}`.trim();

/** Build skeleton content for a path from the canonical spec, filling every field with a marker. */
function content(path: string, over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec({ path, title: "T", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification);
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Android App Development Services, Kotlin | Netofficials",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({
      id: s.id,
      order: i + 1,
      fields: { ...Object.fromEntries(s.fields.map((f) => [f, /url$/.test(f) ? "/contact" : /^(?:a\d+|body_paragraph)$/.test(f) ? `<p>${fill(f, 45)}</p><p>second paragraph</p>` : fill(f)])), ...(over[s.id] ?? {}) },
      evidenceIds: [],
      omitted: false,
    })),
    seo: { metaTitle: "Android App Development Services, Kotlin | Netofficials", metaDescription: "d".repeat(140), primaryKeyword: "android app development", keyFacts: ["Kotlin is the primary Android language.", "Google Play needs a developer account."] },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (path: string, c = content(path)) => load(renderToStaticMarkup(<V3Page content={c} path={path} paths={paths} />));

test("skeleton pages render every section in order with the shared design hooks", () => {
  const $ = render("/android-app-development");
  assert.ok($("main.v3-skeleton").length);
  assert.ok($("link[href^='/assets/v2/pages/service.css']").length);
  const ids = $("main > section[id]").map((_, el) => $(el).attr("id")).get();
  assert.deepEqual(ids, ["hero", "service-overview", "what-we-deliver", "process", "technology-stack", "who-its-for", "industry-applications", "cost-factors", "faq", "related-services", "cta-banner"]);
  assert.equal($("h1").length, 1);
  // Service pages use the showcase layout: topic hero scene, flowing process, cost cards around a character.
  assert.ok($("#hero").hasClass("sc-hero"));
  assert.ok($("link[href^='/assets/v2/pages/showcase.css']").length);
  assert.ok($("#process").hasClass("flow"));
  assert.ok($("#cta-banner").hasClass("cta-band"));
  assert.ok($("#service-overview").hasClass("sec") && !$("#service-overview").hasClass("sec--cloud"));
  assert.ok($("#what-we-deliver").hasClass("sec--cloud"));
});

test("overview keeps the answer beside the visual, facts in a row and the other paragraphs as labelled cards", () => {
  const $ = render("/android-app-development");
  assert.match($("#service-overview .sc-ov__answer").first().text(), /body_paragraph/);
  // Key facts (2) have their own row; the four outcomes float over the picture.
  assert.equal($("#service-overview .sc-ov__facts li").length, 2);
  assert.equal($("#service-overview .sc-fc .fc__row").length, 4);
  // The second paragraph becomes the first detail card with its fixed label; the full text stays in the HTML.
  assert.equal($("#service-overview .sc-ov__card").length, 1);
  assert.match($("#service-overview .sc-ov__card h3").first().text(), /What is covered/);
  assert.match($("#service-overview .sc-ov__card").first().text(), /second paragraph/);
});

test("overview with more than four paragraphs puts the extras in a native expander", () => {
  const long = content("/android-app-development", { "service-overview": { body_paragraph: ["a", "b", "c", "d", "e", "f"].map((x) => `<p>para ${x}</p>`).join("") } });
  const $ = render("/android-app-development", long);
  assert.equal($("#service-overview .sc-ov__card").length, 3);
  assert.equal($("#service-overview details.sc-ov__rest p").length, 2);
});

test("cost factors are floating cards, FAQ is a two-column native accordion and the page has no sub-nav", () => {
  const $ = render("/android-app-development");
  assert.equal($("#cost-factors .sc-factor").length, 5);
  assert.equal($("#faq details").length, 8);
  assert.equal($("#faq .sc-faq__cols .acc").length, 2);
  assert.equal($("nav.subnav").length, 0);
});

test("hubs get the child-service cards, industries, engagement models and no process band", () => {
  const $ = render("/mobile-app-development");
  assert.equal($("#services-grid a.cat").length, 6);
  assert.equal($("#industry-applications .icard").length, 6);
  assert.equal($("#engagement-models .mcard").length, 3);
  assert.ok($("#engagement-models").hasClass("models"));
  assert.equal($("#process").length, 0);
  assert.equal($("#why-netofficials .feat__g > div").length, 4);
});

test("industry cards link to the matching industry page when the model left the link empty", () => {
  const c = content("/mobile-app-development", {
    "industry-applications": { industry_1_name: "Healthcare Mobile App Development", industry_1_url: "", industry_2_name: "Space Mobile App Development", industry_2_url: "" },
  });
  const $ = render("/mobile-app-development", c);
  assert.equal($("#industry-applications a.icard").first().attr("href"), "/healthcare-software-development");
  assert.equal($("#industry-applications .icard").eq(1).find("a").length, 0);
});

test("industry pages render compliance cards; legacy drafts keep the old renderer", () => {
  const $ = render("/healthcare-software-development");
  assert.equal($("#compliance-data .cat").length, 4);
  assert.equal($("#related-services a.sc-rel__row").length, 3);
  const legacy = content("/android-app-development");
  legacy.pageSections = legacy.pageSections!.filter((s) => s.id !== "cost-factors");
  assert.equal(isSkeletonContent(legacy, "/android-app-development"), false);
  assert.equal(render("/android-app-development", legacy)("main.v3-skeleton").length, 0);
  assert.equal(isSkeletonContent(content("/android-app-development"), "/contact"), false);
});

test("guides render one article block with a contents rail, numbered chapters and no top sub-nav", () => {
  const path = "/blog/seo-vs-ppc";
  const c = content(path, { "key-takeaways": { body_paragraph: "<ul><li>First takeaway</li><li>Second takeaway</li></ul>" } });
  assert.ok(isSkeletonContent(c, path));
  const $ = render(path, c);
  assert.ok($("main.v3-skeleton").length);
  assert.equal($(".subnav").length, 0);
  const ids = $("main > section[id]").map((_, el) => $(el).attr("id")).get();
  assert.deepEqual(ids, ["hero", "guide", "faq", "related-services", "cta-banner"]);
  assert.equal($("#guide section.guide-chapter[id^=editorial-]").length, 5);
  assert.equal($("#guide .keybox li").length, 2);
  // Contents: key takeaways, the five chapters, FAQ and related services.
  assert.equal($("#guide nav.toc a").length, 8);
  assert.equal($("#guide nav.toc a").first().attr("href"), "#key-takeaways");
  assert.equal($("#faq details").length, 6);
  assert.ok($("#related-services a.rel").length > 0);
  assert.equal($(".guide-author").length, 1);
  assert.match($(".guide-meta").text(), /min read/);
  assert.equal($("h1").length, 1);
});
