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
  assert.ok($("link[href^='/assets/nx/pages/skeleton.css']").length);
  const ids = $("main > section[id]").map((_, el) => $(el).attr("id")).get();
  assert.deepEqual(ids, ["hero", "service-overview", "what-we-deliver", "process", "technology-stack", "who-its-for", "industry-applications", "cost-factors", "faq", "related-services", "cta-banner"]);
  assert.equal($("h1").length, 1);
  // Background rhythm: hero paper, dark band for process, paper and white alternating between the rest.
  assert.ok($("#hero").hasClass("page-hero"));
  assert.ok($("#hero").hasClass("page-hero") && !$("#hero").hasClass("section--white"));
  assert.ok($("#process").hasClass("band"));
  assert.ok(!$("#cta-banner").hasClass("band"));
  assert.ok(!$("#service-overview").hasClass("section--white"));
  assert.ok($("#what-we-deliver").hasClass("section--white"));
});

test("overview leads with the quick answer and shows the key facts", () => {
  const $ = render("/android-app-development");
  assert.match($("#service-overview .quick__label").text(), /Quick answer/);
  assert.match($("#service-overview .quick .lead").text(), /body_paragraph/);
  assert.equal($("#service-overview aside.facts li").length, 2);
  assert.equal($("#service-overview .overview__outcomes li").length, 4);
});

test("cost factors are a list, FAQ is a native accordion, and the sub-nav links to real sections", () => {
  const $ = render("/android-app-development");
  assert.equal($("#cost-factors .sk-rows > li").length, 5);
  assert.equal($("#faq details").length, 8);
  assert.equal($("#faq details[open]").length, 1);
  const targets = $("nav.subnav a").map((_, a) => $(a).attr("href")).get();
  assert.ok(targets.length >= 3);
  for (const href of targets) assert.equal($(href).length, 1, href);
  // The sub-nav sits right after the hero.
  assert.equal($("#hero").next().is("nav.subnav"), true);
});

test("hubs get the child-service cards, industries, engagement models and no process band", () => {
  const $ = render("/mobile-app-development");
  assert.equal($("#services-grid a.hub-card").length, 6);
  assert.equal($("#industry-applications .ind").length, 6);
  assert.equal($("#engagement-models .model").length, 3);
  assert.equal($("#engagement-models .model[hidden]").length, 2);
  assert.equal($("#engagement-models [data-seg] [role=radio]").length, 3);
  assert.ok($("#engagement-models").hasClass("band"));
  assert.equal($("#process").length, 0);
  assert.equal($("#why-netofficials .sk-adv").length, 4);
});

test("industry cards link to the matching industry page when the model left the link empty", () => {
  const c = content("/mobile-app-development", {
    "industry-applications": { industry_1_name: "Healthcare Mobile App Development", industry_1_url: "", industry_2_name: "Space Mobile App Development", industry_2_url: "" },
  });
  const $ = render("/mobile-app-development", c);
  assert.equal($("#industry-applications a.ind").first().attr("href"), "/healthcare-software-development");
  assert.equal($("#industry-applications .ind").eq(1).find("a").length, 0);
});

test("industry pages render compliance cards; legacy drafts keep the old renderer", () => {
  const $ = render("/healthcare-software-development");
  assert.equal($("#compliance-data .sk-card").length, 4);
  assert.equal($("#related-services .more a").length, 3);
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
  assert.deepEqual(ids, ["hero", "guide", "cta-banner"]);
  assert.equal($("#guide section.guide-chapter[id^=editorial-]").length, 5);
  assert.equal($("#guide .guide-takeaways li").length, 2);
  assert.equal($("#guide .guide-toc li").length, 5);
  assert.equal($("#guide .guide-toc a").first().attr("href"), "#editorial-1");
  assert.equal($("#guide #faq details").length, 6);
  assert.ok($("#guide #related-services .more a").length > 0);
  assert.equal($(".guide-author").length, 1);
  assert.match($(".guide-meta").text(), /min read/);
  assert.equal($("h1").length, 1);
});
