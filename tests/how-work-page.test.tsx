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
  assert.ok($("link[href^='/assets/how-work.css']").length);
  assert.equal($("[class*='sk-'], [class*='ab-'], [class*='ct-'], [class*='en-']").length, 0);
  assert.equal($("h1").length, 1);
  assert.equal($("#stages .hw-stage-n").length, 5);
  assert.deepEqual($("#stages .hw-stage-n").map((_, el) => $(el).text()).get(), ["1", "2", "3", "4", "5"]);
  assert.equal($("#stages .hw-stage-receives").length, 5);
  assert.equal($("#communication .hw-cadence tbody tr").length, 4);
  assert.equal($("#tools .hw-tools > div").length, 4);
  assert.equal($("#commitments .hw-commits > li").length, 4);
  assert.equal($("#faq details").length, 5);
});

test("the tools list is a definition list and the hero signals are plain items", () => {
  const $ = render();
  assert.deepEqual($("#tools dt").map((_, el) => $(el).text()).get(), TOOLS);
  assert.equal($(".hw-signals li").length, 3);
  assert.equal($("main svg").length, 0, "no decorative icons");
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
