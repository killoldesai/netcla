import assert from "node:assert/strict";
import test from "node:test";
import type { PageSpecification } from "../src/page-spec-schema";
import { templateBlueprint } from "../src/page-template";
import { rulesFor } from "../src/prompts/sections";
import { canonicalSpecification } from "../src/prompts/spec-text";
import { effectiveSpec, familyOf, imageSectionIds, wordBands } from "../src/prompts/templates";

const heroImagePrompt = "flat illustration of an app";
const legacy = (path: string) =>
  ({
    path,
    title: "Page",
    databaseId: "00000000-0000-0000-0000-000000000000",
    source: "csv",
    blueprintPrompt: "",
    originalRows: [],
    sections: [
      { id: "hero", order: 1, name: "Hero", layout: "", fields: ["h1"], originalPrompt: "", hero: true, imagePrompt: heroImagePrompt, ratio: "4:3", originalRow: {} },
      { id: "stats-bar", order: 2, name: "Stats", layout: "", fields: ["stat_1_number"], originalPrompt: "", hero: false, imagePrompt: "", ratio: "", originalRow: {} },
    ],
  }) as unknown as PageSpecification;

const samples: Record<string, string> = {
  hub: "/mobile-app-development",
  service: "/android-app-development",
  technology: "/flutter-app-development",
  hire: "/hire-react-developer",
  industry: "/healthcare-software-development",
  location: "/software-development-company-australia",
};

test("every page maps to a family and the commercial ones share one skeleton", () => {
  for (const [family, path] of Object.entries(samples)) assert.equal(familyOf(path), family, path);
  assert.equal(familyOf("/blog/some-guide"), "guide");
  assert.equal(familyOf("/contact"), "other");
  assert.equal(familyOf("/"), "other");
  for (const [family, path] of Object.entries(samples)) {
    const ids = effectiveSpec(legacy(path)).sections.map((s) => s.id);
    assert.equal(ids[0], "hero", family);
    assert.equal(ids.at(-1), "cta-banner", family);
    // Hubs explain how to engage (models, why us) instead of a project process.
    for (const id of ["service-overview", family === "hub" ? "engagement-models" : "process", "technology-stack", "cost-factors", "faq"])
      assert.ok(ids.includes(id), `${family} has ${id}`);
    assert.equal(new Set(ids).size, ids.length, family + " has unique section ids");
  }
});

test("family variants swap only the audience-specific blocks", () => {
  const ids = (path: string) => effectiveSpec(legacy(path)).sections.map((s) => s.id);
  assert.ok(ids(samples.hub).includes("services-grid"));
  assert.ok(ids(samples.hub).includes("engagement-models"));
  // Hubs carry an industries block so one page can rank for "<industry> <service>" combinations.
  assert.ok(ids(samples.hub).includes("industry-applications"));
  assert.equal(effectiveSpec(legacy(samples.hub)).sections.find((s) => s.id === "industry-applications")!.fields.filter((f) => /_name$/.test(f)).length, 6);
  assert.ok(ids(samples.service).includes("industry-applications"));
  assert.ok(!ids(samples.hire).includes("industry-applications"));
  assert.ok(ids(samples.industry).includes("compliance-data"));
  assert.ok(!ids(samples.location).includes("compliance-data"));
});

test("canonical fields: no unproven stats, 8 FAQ pairs, hero artwork prompt kept, no illustration for body sections", () => {
  for (const path of Object.values(samples)) {
    const spec = effectiveSpec(legacy(path));
    const fields = spec.sections.flatMap((s) => s.fields);
    assert.ok(!fields.some((f) => /^stat_|^quote_|^client_/.test(f)), path);
    assert.equal(fields.filter((f) => /^q\d+$/.test(f)).length, 8, path);
    assert.equal(fields.filter((f) => /^a\d+$/.test(f)).length, 8, path);
    const hero = spec.sections.find((s) => s.id === "hero")!;
    assert.equal(hero.imagePrompt, heroImagePrompt);
    assert.equal(hero.hero, true);
    assert.ok(imageSectionIds(spec).includes("hero"));
  }
});

test("every canonical section has specific prompt rules and the blueprint validates", () => {
  const generic = rulesFor("no-such-section")[0];
  for (const path of Object.values(samples)) {
    const spec = effectiveSpec(legacy(path));
    for (const s of spec.sections) assert.notEqual(rulesFor(s.id)[0], generic, `${path} ${s.id} has no rules`);
    assert.doesNotThrow(() => templateBlueprint(spec), path);
  }
});

test("canonical specification renders prompts that name the fields and the word band", () => {
  const { spec, family, changed } = canonicalSpecification(legacy(samples.service));
  assert.equal(family, "service");
  assert.ok(changed);
  const overview = spec.sections.find((s) => s.id === "service-overview")!;
  assert.match(overview.originalPrompt, /body_paragraph/);
  assert.match(overview.originalPrompt, new RegExp(`${wordBands.service.min}-${wordBands.service.max}`));
  assert.match(spec.blueprintPrompt, /PAGE SECTIONS IN ORDER \(11 total\)/);
  assert.match(spec.blueprintPrompt, /metaTitle as comma-separated keywords/);
  // One-off pages without their own spec (About and Contact have one) keep the imported layout.
  const other = canonicalSpecification(legacy("/careers"));
  assert.equal(other.changed, false);
});
