import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { effectiveSpec, howWorkBand, howWorkSections, imageSectionIds, pageBand, pageLabel } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { isHowWorkContent } from "../src/how-work-page";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const paths = ["/", "/contact", "/engagement-models", "/portfolio", "/how-we-work"];
const base = { path: "/how-we-work", title: "How We Work", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;
const TOOLS = ["Jira", "Slack", "Git", "GitHub"];

function content(over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec(base);
  const filled = (id: string, fields: string[]) =>
    Object.fromEntries(
      fields.map((f) => {
        const tool = f.match(/^tool_(\d)_name$/);
        return [f, tool ? TOOLS[Number(tool[1]) - 1] : /url$/.test(f) ? "/contact" : /^a\d+$/.test(f) ? `<p>${f} answer</p>` : `${id} ${f}`];
      }),
    );
  return contentSchema.parse({
    schemaVersion: 3,
    title: "How Netofficials Delivers Software Projects",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: { ...filled(s.id, s.fields), ...(over[s.id] ?? {}) }, evidenceIds: [], omitted: false })),
    seo: { metaTitle: "How Software Development Company Works, Agile | Netofficials", metaDescription: "d".repeat(140), primaryKeyword: "how software development company works", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (c = content()) => load(renderToStaticMarkup(<V3Page content={c} path="/how-we-work" paths={paths} />));

test("the How We Work spec is its own page with a registered band and one hero illustration", () => {
  const ids = howWorkSections(base).map((s) => s.id);
  assert.deepEqual(ids, ["hero", "approach", "stages", "communication", "tools", "commitments", "faq", "cta-banner"]);
  assert.deepEqual(pageBand("/how-we-work"), howWorkBand);
  assert.equal(pageLabel("/how-we-work"), "how we work");
  assert.deepEqual(imageSectionIds(effectiveSpec(base)), ["hero"]);
  for (const id of ids) assert.notEqual(rulesFor(id, "/how-we-work")[0], rulesFor("no-such-section")[0], `${id} needs How We Work rules`);
});

test("the stages are the only numbered list on the page, and the deliverable is shown under each", () => {
  const c = content();
  assert.ok(isHowWorkContent(c, "/how-we-work"));
  const $ = render(c);
  assert.ok($("main.v3-how").length);
  assert.ok($("link[href^='/assets/v2/pages/how-we-work.css']").length);
  assert.equal($("[class*='v3-section'], [class*='v3-wrap']").length, 0, "no legacy section classes");
  assert.equal($("h1").length, 1);
  // Numbers come from the wf counter; the stages are the only numbered sequence on the page.
  assert.equal($("main .wf .n").length, 5);
  assert.deepEqual($("#stages .wf__step .n").map((_, el) => $(el).text()).get(), ["1", "2", "3", "4", "5"]);
  assert.equal($("#stages .wf__step").length, 5);
  assert.equal($("#stages .wf__step h3").length, 5);
  assert.equal($("#stages .hw-receives").length, 5);
  assert.equal($("#communication .kit-card").length, 4);
  assert.equal($("#tools .kit-card").length, 4);
  assert.equal($("#commitments .kit-card").length, 4);
  assert.equal($("#faq details").length, 5);
});

test("the tools are named as logo cards, and the hero signals are plain items", () => {
  const $ = render();
  assert.deepEqual($("#tools .kit-card h3").map((_, el) => $(el).text()).get(), TOOLS);
  assert.equal($("#hero .co-hero__ticks li").length, 3);
  assert.equal($("#hero .hs--stages").length, 1, "the hero shows the stages scene");
  assert.equal($("img.hw-scene").length, 0, "no picture under the hero");
  assert.equal($("#tools .techmark").length, 4, "each tool shows its logo");
});

test("a generated hero image does not replace the stages scene or add a picture under the hero", () => {
  const asset = { id: "a".repeat(32), name: "hero.png", src: "/media/hero.png", alt: "Delivery team", width: 1200, height: 900 };
  const c = content();
  c.pageSections = c.pageSections!.map((s) => (s.id === "hero" ? { ...s, asset } : s)) as typeof c.pageSections;
  const $ = load(renderToStaticMarkup(<V3Page content={c} path="/how-we-work" paths={paths} />));
  assert.equal($("img.hw-scene").length, 0);
  assert.equal($("#hero .hs--stages").length, 1);
});

test("every section that renders has its anchor id, and the omitted ones are absent", () => {
  const $ = render();
  for (const id of ["approach", "stages", "communication", "tools", "commitments", "faq"]) assert.equal($(`#${id}`).length, 1, id);
  const c = content();
  c.pageSections = c.pageSections!.map((s) => (s.id === "tools" ? { ...s, omitted: true } : s)) as typeof c.pageSections;
  assert.equal(load(renderToStaticMarkup(<V3Page content={c} path="/how-we-work" paths={paths} />))("#tools").length, 0);
});

test("older accepted content without the stages section keeps the legacy renderer", () => {
  const legacy = content();
  legacy.pageSections = legacy.pageSections!.filter((s) => s.id !== "stages");
  assert.ok(!isHowWorkContent(legacy, "/how-we-work"));
});

test("JSON-LD carries the five stages as a HowTo, and QA uses the How We Work band", () => {
  const graph = pageGraph({ path: "/how-we-work", content: content(), site: "https://example.com" })["@graph"] as Record<string, any>[];
  const page = graph.find((n) => n["@type"] === "WebPage")!;
  assert.equal(page.mainEntity["@type"], "HowTo");
  assert.equal(page.mainEntity.step.length, 5);
  assert.equal(page.mainEntity.step[0].position, 1);
  const qa = runContentQA(content(), "/how-we-work");
  assert.match(qa.checks.find((c) => c.id === "word-band")?.detail ?? "", new RegExp(`target ${howWorkBand.min}-${howWorkBand.max}`));
});
