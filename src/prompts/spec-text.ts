import type { PageSpecification, SectionSpecification } from "../page-spec-schema";
import { rulesFor } from "./sections";
import { PROMPT_VERSION } from "./system";
import { effectiveSpec, familyOf, pageBand, pageLabel, wordBands, type Family } from "./templates";

/**
 * Human-readable prompt text stored in the database for each section, so the
 * admin and the CSV-era tooling describe exactly what the pipeline generates.
 * The pipeline itself builds its prompts from the same rule lists at run time.
 */
export function renderSectionPrompt(spec: PageSpecification, section: SectionSpecification, family: Family) {
  const band = pageBand(spec.path) ?? wordBands[family];
  return [
    `Write the "${section.id}" section (${section.name}) of ${spec.path}${spec.title ? ` ("${spec.title}")` : ""}.`,
    `Page family: ${pageLabel(spec.path) ?? family}. Target for the whole page: ${band.min}-${band.max} words. Primary and secondary keywords, entities and the answer summary come from the page brief.`,
    `Return one JSON object with exactly these fields: ${section.fields.join(", ")}.`,
    "Rules:",
    ...rulesFor(section.id, spec.path).map((rule) => `- ${rule}`),
    "Voice: plain, specific, active; no hype, no banned phrases, no invented figures, clients or awards. Internal links only from the allowed list.",
  ].join("\n");
}

export function renderBlueprintPrompt(spec: PageSpecification, family: Family) {
  const band = pageBand(spec.path) ?? wordBands[family];
  const sections = spec.sections.map(
    (s, i) => `S${String(i + 1).padStart(2, "0")} | ${s.id} | ${s.name} | ${s.layout || "CardGrid3Col"} | ${s.fields.length} fields`,
  );
  return [
    `Component blueprint for ${spec.path} (${pageLabel(spec.path) ?? family} page, ${band.min}-${band.max} words).`,
    `PAGE SECTIONS IN ORDER (${spec.sections.length} total):`,
    ...sections,
    "Every section uses an approved component. The hero is HeroSplit, the closing section is DarkCtaBand. Stats and testimonials appear only when approved evidence exists.",
    "SEO output (page brief): metaTitle as comma-separated keywords (primary first, max 60 characters, ' | Netofficials' when it fits), metaDescription 140-155 characters, answerSummary 40-60 words, keyFacts, schemaAbout entities, serviceType. JSON-LD is generated from the page content.",
  ].join("\n");
}

/** The specification stored in the database for a page: canonical sections plus rendered prompts. */
export function canonicalSpecification(spec: PageSpecification): { spec: PageSpecification; family: Family; changed: boolean } {
  const family = familyOf(spec.path);
  // The About page has its own section list, so it is canonicalised too; other one-off pages keep their imported spec.
  if (family === "other" && !pageBand(spec.path)) return { spec, family, changed: false };
  const canonical = effectiveSpec(spec);
  const sections = canonical.sections.map((s) => ({ ...s, originalPrompt: renderSectionPrompt(canonical, s, family) }));
  const next: PageSpecification = {
    ...canonical,
    source: `canonical-templates ${PROMPT_VERSION}`,
    sections,
    blueprintPrompt: renderBlueprintPrompt({ ...canonical, sections }, family),
  };
  return { spec: next, family, changed: true };
}
