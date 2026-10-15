import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { engagementBand, engagementSections, effectiveSpec, pageBand, pageLabel } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { MATRIX_ROWS, isEngagementContent } from "../src/engagement-page";
import { V3Page } from "../src/v3-page";
import type { PageSpecification } from "../src/page-spec-schema";

const paths = ["/", "/contact", "/how-we-work", "/why-choose-netofficials", "/engagement-models"];
const base = { path: "/engagement-models", title: "Engagement Models", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;
const NAMES = ["Fixed-Price Project", "Dedicated Development Team", "Staff Augmentation"];

function content(over: Record<string, Record<string, string>> = {}) {
  const spec = effectiveSpec(base);
  const filled = (id: string, fields: string[]) =>
    Object.fromEntries(
      fields.map((f) => {
        const model = f.match(/^model_(\d)_name$/);
        const choice = f.match(/^situation_(\d)_choice$/);
        return [f, model ? NAMES[Number(model[1]) - 1] : choice ? NAMES[Number(choice[1]) - 1] : /url$/.test(f) ? "/contact" : /^a\d+$/.test(f) ? `<p>${f} answer</p>` : `${id} ${f}`];
      }),
    );
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Software Development Engagement Models, Dedicated Team",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: { ...filled(s.id, s.fields), ...(over[s.id] ?? {}) }, evidenceIds: [], omitted: false })),
    seo: { metaTitle: "Software Development Engagement Models, Dedicated Team", metaDescription: "d".repeat(140), primaryKeyword: "software development engagement models", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (c = content()) => load(renderToStaticMarkup(<V3Page content={c} path="/engagement-models" paths={paths} />));

test("the Engagement spec is its own comparison page with a registered band", () => {
  const ids = engagementSections(base).map((s) => s.id);
  assert.deepEqual(ids, ["hero", "models-comparison", "decision-guide", "pricing-factors", "process", "faq", "cta-banner"]);
  assert.deepEqual(pageBand("/engagement-models"), engagementBand);
  assert.equal(pageLabel("/engagement-models"), "engagement models");
  for (const id of ids) assert.notEqual(rulesFor(id, "/engagement-models")[0], rulesFor("no-such-section")[0], `${id} needs Engagement rules`);
  // Every model field in the matrix (and the cards' best-for line) exists in the spec.
  const fields = engagementSections(base).find((s) => s.id === "models-comparison")!.fields;
  for (const key of [...MATRIX_ROWS.map(([, k]) => k), "tagline", "name"]) for (const n of [1, 2, 3]) assert.ok(fields.includes(`model_${n}_${key}`), `model_${n}_${key}`);
});

test("rules forbid invented terms, rates and onboarding times", () => {
  const text = ["models-comparison", "pricing-factors", "process", "faq"].flatMap((id) => rulesFor(id, "/engagement-models")).join(" ");
  assert.match(text, /Never state a sprint length, meeting frequency in days or weeks, contract jurisdiction, minimum term, notice period, onboarding time/);
});

test("one comparison matrix with a column per model, plain headers and no model numbering", () => {
  const c = content();
  assert.ok(isEngagementContent(c, "/engagement-models"));
  const $ = render(c);
  assert.ok($("main.v3-engage").length);
  assert.ok($("link[href^='/assets/nx/pages/engagement.css']").length);
  assert.ok($(".nx").length, "rendered inside the redesigned shell");
  assert.equal($("[class*='en-']").length, 0, "no legacy en- classes");
  assert.equal($("h1").length, 1);
  assert.equal($("table.em-matrix thead th").length, 3);
  assert.deepEqual($("table.em-matrix thead th strong").map((_, el) => $(el).text()).get(), NAMES);
  assert.equal($("table.em-matrix tbody tr").length, MATRIX_ROWS.length);
  assert.equal($("table.em-matrix tbody td").length, MATRIX_ROWS.length * 3);
  assert.equal($("table.em-matrix tbody td").first().attr("data-label"), NAMES[0]);
  assert.ok($(".em-table-wrap").length, "matrix sits in a box that scrolls on phones");
  // Numbers only where the order is real: the steps. Models, situations and sections carry none.
  assert.equal($("#models-comparison [class*='-n']").length, 0);
  assert.equal($("#decision-guide [class*='-n']").length, 0);
  assert.equal($("#models-comparison .nx-step").length, 0);
  assert.equal($("#process .nx-step").length, 4);
  // The step numbers come from the list counter, not from text in the markup.
  assert.equal($("#process .nx-step span").length, 0);
  // No decorative gimmicks: no meter, no icon chips.
  assert.equal($("main .em-meter, main .en-icon, #models-comparison svg, #pricing-factors svg, #process svg").length, 0);
});

test("the selector pairs each situation with one recommendation that links to its column", () => {
  const $ = render();
  const radios = $("#decision-guide [role='radio']");
  assert.equal(radios.length, 3);
  assert.equal($("#decision-guide [role='radio'][aria-checked='true']").length, 1);
  assert.equal($("#decision-guide [role='radio']").first().attr("aria-checked"), "true");
  const values = radios.map((_, el) => $(el).attr("data-value")).get();
  assert.equal(new Set(values).size, 3);
  for (const v of values) assert.equal($(`#decision-guide .model[data-model='${v}']`).length, 1, v);
  // Only the first recommendation is shown; the segment switches the others on (behaviors.tsx).
  assert.equal($("#decision-guide .model:not([hidden])").length, 1);
  assert.equal($("#decision-guide .model").length, 3);
  const hrefs = $("#decision-guide .model .nx-arrowlink").map((_, el) => $(el).attr("href")).get();
  assert.deepEqual(hrefs, ["#model-1", "#model-2", "#model-3"]);
  for (const href of hrefs) assert.equal($(href).length, 1, `${href} target exists`);
  const ctas = $("#decision-guide .model .nx-btn").map((_, el) => $(el).attr("href")).get();
  assert.deepEqual(ctas, ["/contact?service=Engagement%20model", "/contact?service=Engagement%20model", "/contact?service=Engagement%20model"]);
  assert.equal($("#pricing-factors .em-factors .sk-card").length, 4);
  assert.equal($("#process .nx-steps li").length, 4);
  assert.equal($("#faq details").length, 6);
  assert.equal($("#faq details[open]").length, 1, "the first answer is open");
});

test("the hero uses the page image when it has one and the three-ways illustration when it does not", () => {
  const plain = render();
  assert.equal(plain("#hero svg.il").length, 1);
  assert.equal(plain("#hero img").length, 0);
  const withImage = content();
  (withImage.pageSections!.find((s) => s.id === "hero") as unknown as Record<string, unknown>).asset = { id: "a".repeat(32), name: "three-ways.png", src: "/media/three-ways.png", alt: "Three ways to work", width: 1200, height: 900 };
  const $ = render(withImage);
  assert.equal($("#hero img").length, 1);
  assert.equal($("#hero img").attr("alt"), "Three ways to work");
  assert.equal($("#hero img").attr("width"), "1200");
  assert.equal($("#hero svg.il").length, 0);
});

test("older accepted content without the new sections keeps the legacy renderer", () => {
  const legacy = content();
  legacy.pageSections = legacy.pageSections!.filter((s) => s.id !== "pricing-factors");
  assert.ok(!isEngagementContent(legacy, "/engagement-models"));
});

test("JSON-LD lists the three models and QA uses the Engagement band", () => {
  const graph = pageGraph({ path: "/engagement-models", content: content(), site: "https://example.com" })["@graph"] as Record<string, any>[];
  const page = graph.find((n) => n["@type"] === "WebPage")!;
  assert.equal(page.mainEntity["@type"], "ItemList");
  assert.deepEqual(page.mainEntity.itemListElement.map((i: any) => i.name), NAMES);
  const qa = runContentQA(content(), "/engagement-models");
  assert.match(qa.checks.find((c) => c.id === "word-band")?.detail ?? "", new RegExp(`target ${engagementBand.min}-${engagementBand.max}`));
});
