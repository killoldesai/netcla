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
  assert.ok($("link[href^='/assets/engagement.css']").length);
  assert.equal($("[class*='sk-'], [class*='ab-'], [class*='ct-']").length, 0);
  assert.equal($("h1").length, 1);
  assert.equal($("table.en-matrix thead th").length, 3);
  assert.deepEqual($("table.en-matrix thead th strong").map((_, el) => $(el).text()).get(), NAMES);
  assert.equal($("table.en-matrix tbody tr").length, MATRIX_ROWS.length);
  assert.equal($("table.en-matrix tbody td").length, MATRIX_ROWS.length * 3);
  assert.equal($("table.en-matrix tbody td").first().attr("data-label"), NAMES[0]);
  // Numbers only where the order is real: the steps. Models, situations and sections carry none.
  assert.equal($("#models-comparison [class*='-n']").length, 0);
  assert.equal($("#decision-guide [class*='-n']").length, 0);
  assert.deepEqual($("#process .en-step-n").map((_, el) => $(el).text()).get(), ["1", "2", "3", "4"]);
  // No decorative gimmicks: no meter, no icon chips.
  assert.equal($("main .en-meter, main .en-icon, main svg").length, 0);
});

test("the selector pairs each situation with one recommendation that links to its column", () => {
  const $ = render();
  const radios = $("#decision-guide input[type='radio']");
  assert.equal(radios.length, 3);
  assert.equal($("#decision-guide input:checked").length, 1);
  assert.equal($("#decision-guide input[checked]").attr("id"), "en-sit-1");
  for (const id of ["en-sit-1", "en-sit-2", "en-sit-3"]) assert.equal($(`#decision-guide label[for='${id}']`).length, 1, id);
  assert.equal($("#decision-guide .en-result").length, 3);
  const hrefs = $("#decision-guide .en-result .en-btn").map((_, el) => $(el).attr("href")).get();
  assert.deepEqual(hrefs, ["#model-1", "#model-2", "#model-3"]);
  for (const href of hrefs) assert.equal($(href).length, 1, `${href} target exists`);
  assert.equal($("#pricing-factors .en-factors li").length, 4);
  assert.equal($("#process .en-steps li").length, 4);
  assert.equal($("#faq details").length, 6);
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
