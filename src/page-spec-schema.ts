import { z } from "zod";
import { htmlFieldPattern } from "./prompts/system";
import { sanitizeRichHTML } from "./rich-text";

export const componentNames = [
  "HeroSplit",
  "HeroFull",
  "ServiceDirectory",
  "CardGrid3Col",
  "CardGrid4Col",
  "DeliverableGrid",
  "TimelineStrip",
  "TechnologyGrid",
  "PersonaCards",
  "IndustryLinks",
  "ComparisonTable",
  "AccordionFull",
  "EngagementCards",
  "DarkCtaBand",
  "StatsStrip",
  "TestimonialRow",
  "FilterGrid",
  "FormSplit",
  "EditorialSplit",
  "VerifiedEvidence",
  "NewsletterSignup",
  "VacancyList",
] as const;
export const iconKeys = [
  "code-brackets",
  "mobile-device",
  "brain-circuit",
  "cloud-upload",
  "settings-gear",
  "layers-stack",
  "shield-check",
  "users-group",
  "rocket-launch",
  "chart-bar",
  "document-text",
  "api-plug",
  "flutter-diamond",
  "react-atom",
  "nodejs-hexagon",
  "python-snake",
  "aws-cloud",
  "kubernetes-wheel",
  "docker-whale",
  "terraform-blocks",
] as const;
export const internalPath = z
  .string()
  .regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
export const layoutSchema = z
  .object({
    recommended_component: z.enum(componentNames),
    spacing_above: z.union([
      z.literal(0),
      z.literal(32),
      z.literal(64),
      z.literal(96),
      z.literal(128),
    ]),
    background: z.enum([
      "#ffffff",
      "#f8fafd",
      "#061b31",
      "#533afd",
      "#b5ce20",
      "#4353b3",
    ]),
    max_width: z.enum(["1320px", "960px", "100pct"]),
    mobile_stack: z.string().max(400),
  })
  .strict();
export const pageBlueprintSchema = z.record(
  z.string().regex(/^[a-z][a-z0-9-]*$/),
  layoutSchema,
);
export const assetReferenceSchema = z
  .object({
    id: z.string().uuid(),
    hash: z.string().regex(/^[a-f0-9]{64}$/),
    alt: z.string().min(1).max(400),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mime: z.enum(["image/png", "image/webp", "image/svg+xml"]),
    // SEO file name (served as /media/<id>/<name>.webp) and caption.
    name: z.string().regex(/^[a-z0-9-]{3,90}$/).optional(),
    caption: z.string().max(300).optional(),
  })
  .strict();
export const pageSectionSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    order: z.number().int().positive(),
    fields: z.record(z.string().max(12000)),
    asset: assetReferenceSchema.optional(),
    evidenceIds: z.array(z.string().uuid()).default([]),
    omitted: z.boolean().default(false),
  })
  .strict();
export const generationProvenanceSchema = z
  .object({
    specificationId: z.string().uuid(),
    specificationHash: z.string().regex(/^[a-f0-9]{64}$/),
    runId: z.string().uuid(),
    version: z.literal(1),
    validation: z.array(z.string().max(1000)).max(200),
    generatedAt: z.string().datetime(),
    promptVersion: z.string().max(40).optional(),
  })
  .strict();
export type Blueprint = z.infer<typeof pageBlueprintSchema>;
export type PageSection = z.infer<typeof pageSectionSchema>;
export type SectionSpecification = {
  id: string;
  order: number;
  name: string;
  layout: string;
  fields: string[];
  originalPrompt: string;
  hero: boolean;
  imagePrompt: string;
  ratio: string;
  originalRow: Record<string, string>;
};
export type PageSpecification = {
  path: string;
  databaseId: string;
  title: string;
  source: string;
  blueprintPrompt: string;
  sections: SectionSpecification[];
  originalRows: Record<string, string>[];
};

export function validateSectionFields(
  spec: SectionSpecification,
  input: unknown,
  paths: string[],
) {
  const fields = z.record(z.string().max(12000)).parse(input);
  const actual = Object.keys(fields);
  if (
    actual.length !== spec.fields.length ||
    actual.some((k) => !spec.fields.includes(k))
  )
    throw new Error("Section output must match exact fields: " + spec.id);
  for (const [key, value] of Object.entries(fields)) {
    // Body fields keep limited, sanitised HTML; every other field is plain text.
    if (htmlFieldPattern.test(key)) {
      if (/javascript:|data:/i.test(value))
        throw new Error("Markup is not allowed: " + key);
      fields[key] = sanitizeRichHTML(value, false, paths);
      continue;
    }
    if (/<\/?[a-z][^>]*>|javascript:|data:/i.test(value))
      throw new Error("Markup is not allowed: " + key);
    if (/(?:icon_key|_icon)$/.test(key) && value) {
      // Normalize known provider aliases before validating against the sprite.
      const aliases: Record<string, string> = { "web-api": "api-plug", "api": "api-plug", "api-integration": "api-plug" };
      const canonical = aliases[value.trim().toLowerCase()];
      if (canonical) fields[key] = canonical;
    }
    if (
      /(?:icon_key|_icon)$/.test(key) &&
      value &&
      !(iconKeys as readonly string[]).includes(fields[key])
    )
      throw new Error("Unknown icon key: " + value);
    if (
      /(?:url|path|href)$/.test(key) &&
      value &&
      (!internalPath.safeParse(value).success || !paths.includes(value))
    )
      throw new Error("Unresolved internal destination: " + value);
  }
  return fields;
}
export function sectionContentWarnings(spec: SectionSpecification, fields: Record<string, string>, previous?: Record<string, string>) {
  const warnings: string[] = [];
  const prose = Object.entries(fields).filter(([key, value]) => value.trim() && /(?:body_paragraph|mission_body|_body|_answer)$/.test(key));
  if (prose.length && previous && prose.every(([key, value]) => value.trim() === previous[key]?.trim()))
    warnings.push(`${spec.id}: generated prose is unchanged from the base revision.`);
  const brief = prose.filter(([key, value]) => value.trim().split(/\s+/).length < (/body_paragraph|mission_body/.test(key) ? 80 : /_answer$/.test(key) ? 40 : 25));
  if (brief.length) warnings.push(`${spec.id}: brief copy in ${brief.map(([key]) => key).join(', ')}. Consider adding useful scope and buyer guidance.`);
  return warnings;
}
export function validateBlueprint(spec: PageSpecification, input: unknown) {
  const blueprint = pageBlueprintSchema.parse(input);
  if (
    Object.keys(blueprint).length !== spec.sections.length ||
    spec.sections.some((s) => !blueprint[s.id])
  )
    throw new Error("Blueprint must contain every section exactly once");
  for (const s of spec.sections) {
    const component = blueprint[s.id].recommended_component;
    if (s.id === "hero" && !["HeroSplit", "HeroFull"].includes(component))
      throw new Error("Hero must use an approved hero component");
    if (s.id === "cta-banner" && component !== "DarkCtaBand")
      throw new Error("Bottom CTA must use DarkCtaBand");
  }
  return blueprint;
}
