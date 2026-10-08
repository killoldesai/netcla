import { z } from "zod";
import {
  pageBlueprintSchema,
  pageSectionSchema,
  generationProvenanceSchema,
} from "./page-spec-schema";
export const sectionSchema = z
  .object({
    id: z.string().regex(/^section-\d+$/),
    level: z.union([z.literal(2), z.literal(3)]),
    heading: z.string().min(1).max(200),
    paragraphs: z.array(z.string().max(6000)).max(12),
    items: z.array(z.string().max(1500)).max(30),
    cards: z
      .array(
        z
          .object({ title: z.string().max(200), body: z.string().max(3000) })
          .strict(),
      )
      .max(20),
    table: z
      .object({
        columns: z.array(z.string().max(150)).max(8),
        rows: z.array(z.array(z.string().max(1200)).max(8)).max(30),
      })
      .strict(),
    faqs: z
      .array(
        z
          .object({
            question: z.string().max(300),
            answer: z.string().max(3000),
          })
          .strict(),
      )
      .max(30),
    links: z
      .array(
        z
          .object({
            label: z.string().max(200),
            path: z.string().regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/),
          })
          .strict(),
      )
      .max(20),
  })
  .strict();
export const safeURL = z
  .string()
  .url()
  .refine(
    (v) => ["http:", "https:"].includes(new URL(v).protocol),
    "Use an HTTP or HTTPS URL",
  );
export const contentSchema = z
  .object({
    title: z.string().min(3).max(150),
    description: z.string().max(320),
    schemaVersion: z
      .union([z.literal(1), z.literal(2), z.literal(3)])
      .optional(),
    pageBlueprint: pageBlueprintSchema.optional(),
    pageSections: z.array(pageSectionSchema).max(80).optional(),
    provenance: generationProvenanceSchema.optional(),
    hero: z
      .object({
        heading: z.string().max(200),
        body: z.string().max(2000),
        ctaLabel: z.string().max(100),
        ctaPath: z.string().regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/),
      })
      .strict()
      .optional(),
    sections: z.array(sectionSchema).max(80).optional(),
    texts: z.record(z.string().max(6000)),
    richText: z
      .record(
        z
          .object({ text: z.string().max(72000), html: z.string().max(150000) })
          .strict(),
      )
      .optional(),
    sources: z.array(z.string().uuid()).max(100).default([]),
    claims: z
      .array(
        z.object({ text: z.string().max(1000), factId: z.string().uuid() }),
      )
      .max(100)
      .default([]),
    hiddenSections: z.array(z.string().max(100)).max(30).default([]),
    unresolved: z.array(z.string().max(1000)).max(100).default([]),
    author: z.string().max(100).optional(),
    // Search strategy produced by the page brief; editable in the admin SEO tab.
    seo: z
      .object({
        metaTitle: z.string().max(80).default(""),
        metaDescription: z.string().max(200).default(""),
        primaryKeyword: z.string().max(100).default(""),
        secondaryKeywords: z.array(z.string().max(100)).max(12).default([]),
        entities: z.array(z.string().max(80)).max(20).default([]),
        searchIntent: z.string().max(20).default(""),
        buyerQuestions: z.array(z.string().max(220)).max(10).default([]),
      })
      .strict()
      .optional(),
  })
  .strict();
export type Content = z.infer<typeof contentSchema>;
export type DesignNode = {
  tag?: string;
  attrs?: Record<string, string>;
  children?: DesignNode[];
  text?: string;
  slot?: string;
};
export type Design = {
  id: string;
  path: string;
  kind: string;
  title: string;
  styles: string[];
  nodes: DesignNode[];
  texts: Record<string, string>;
  gate: string;
  protectedFields?: string[];
  sections?: {
    id: string;
    label: string;
    fields: string[];
    required?: boolean;
  }[];
};
export type Validation = { errors: string[]; warnings: string[] };
export function validateContent(content: Content, design: Design): Validation {
  const errors: string[] = [],
    warnings: string[] = [];
  if (content.schemaVersion === 3) {
    errors.push(...content.unresolved);
    if (
      !content.pageBlueprint ||
      !content.pageSections?.length ||
      !content.provenance
    )
      errors.push("Incomplete version-three content");
    const sections = content.pageSections ?? [];
    if (new Set(sections.map((s) => s.id)).size !== sections.length)
      errors.push("Duplicate section identifiers");
    if (
      sections.some(
        (s, i) => s.order !== i + 1 || !content.pageBlueprint?.[s.id],
      )
    )
      errors.push("Invalid blueprint or section order");
    if (Object.keys(content.pageBlueprint ?? {}).length !== sections.length)
      errors.push("Blueprint section mismatch");
    if (
      sections.some((s) =>
        Object.values(s.fields).some((v) =>
          /<\/?[a-z][^>]*>|javascript:/i.test(v),
        ),
      )
    )
      errors.push("Executable markup is not allowed");
    if (content.description.length < 20)
      errors.push("Write a complete meta description");
    if (content.title.length > 65) warnings.push("Review search-title length");
    if (content.description.length > 170)
      warnings.push("Review meta description length");
    return { errors, warnings };
  }
  const expected = Object.keys(design.texts);
  if (content.description.length < 20)
    errors.push("Write a complete meta description");
  if (content.schemaVersion === 2) {
    if (!content.hero?.heading || !content.hero.body)
      errors.push("Complete the hero heading and opening answer");
    if (!content.sections?.length)
      errors.push("Required content sections are missing");
    for (const section of content.sections ?? []) {
      if (
        !section.paragraphs.length &&
        !section.items.length &&
        !section.cards.length &&
        !section.faqs.length &&
        !section.table.rows.length
      )
        errors.push("Empty section: " + section.heading);
      if (
        section.table.rows.some(
          (row) => row.length !== section.table.columns.length,
        )
      )
        errors.push("Comparison table columns do not match");
    }
    if (
      new Set(content.sections?.map((s) => s.id)).size !==
      content.sections?.length
    )
      errors.push("Duplicate section identifiers");
  }
  if (
    content.hiddenSections.some(
      (id) => !(design.sections ?? []).some((s) => s.id === id && !s.required),
    )
  )
    errors.push("Unknown or required section cannot be hidden");
  if (
    content.schemaVersion !== 2 &&
    expected.some((k) => !(k in content.texts))
  )
    errors.push("Missing required design text fields");
  if (
    content.schemaVersion !== 2 &&
    Object.keys(content.texts).some((k) => !expected.includes(k))
  )
    errors.push("Unknown text fields");
  const text = [
    content.title,
    content.description,
    ...Object.values(content.texts),
    ...(content.schemaVersion === 2
      ? [JSON.stringify(content.hero), JSON.stringify(content.sections)]
      : []),
  ].join(" ");
  if (/<\/?[a-z][^>]*>|javascript:/i.test(text))
    errors.push("Executable markup is not allowed");
  if (text.length < 700)
    warnings.push("Content is short; review depth and usefulness");
  if (content.title.length > 65) warnings.push("Review search-title length");
  if (content.description.length > 170)
    warnings.push("Review meta description length");
  for (const [k, v] of Object.entries(content.texts)) {
    if (
      content.schemaVersion !== 2 &&
      v.length > Math.max(160, (design.texts[k]?.length ?? 0) * 2.5)
    )
      warnings.push(`Review layout length: ${k}`);
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}
export const leadSchema = z
  .object({
    requestId: z.string().uuid(),
    name: z.string().trim().min(1).max(120),
    email: z.string().email().max(254),
    service: z.string().min(1).max(120),
    goal: z.string().trim().min(10).max(5000),
    website: z.union([z.literal(""), safeURL]).optional(),
    country: z.string().max(100).optional(),
    timeline: z.string().max(100).optional(),
    budget: z.string().max(200).optional(),
    platform: z.string().max(100).optional(),
    markets: z.string().max(200).optional(),
    campaign_status: z.string().max(200).optional(),
    starting_point: z.string().max(200).optional(),
    landingPage: z.string().max(500),
    referrer: z.string().max(1000).optional(),
    utm: z.record(z.string().max(200)).optional(),
    company_url: z.string().max(500).optional(),
  })
  .strict();
