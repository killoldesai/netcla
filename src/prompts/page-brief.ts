import { z } from "zod";
import type { PageSpecification } from "../page-spec-schema";
import { pillarFor, sitePage } from "../site-structure";
import { pageTypeFor } from "./templates";

const text = (max: number) => z.string().trim().transform((v) => v.slice(0, max));
const list = (max: number, len = 120) =>
  z.array(z.string().trim().min(1).transform((v) => v.slice(0, len))).transform((v) => v.slice(0, max));

/** Output of the strategy step. Lenient on length so a long answer is trimmed, not rejected. */
export const pageBriefSchema = z.object({
  searchIntent: z.enum(["informational", "commercial", "transactional", "navigational"]).catch("commercial"),
  audience: text(300),
  primaryKeyword: text(80).pipe(z.string().min(2)),
  secondaryKeywords: list(8, 80),
  entities: list(16, 60),
  buyerQuestions: list(8, 200),
  angle: text(400),
  outline: z
    .array(z.object({ sectionId: z.string(), purpose: text(300), points: list(6, 200).default([]) }))
    .default([]),
  internalLinks: z.array(z.object({ path: z.string(), anchor: text(80) })).default([]),
  metaTitle: text(70),
  metaDescription: text(170),
  images: z
    .array(z.object({ sectionId: z.string(), subject: text(500), alt: text(140) }))
    .default([]),
});
export type PageBrief = z.infer<typeof pageBriefSchema>;

export type LinkOption = { path: string; label: string; blurb: string };

/** Pull keyword research the site plan already holds for this page. */
export function researchNotes(spec: PageSpecification) {
  const row = spec.originalRows?.[0] ?? {};
  return {
    proposedTitle: row.proposed_title || spec.title,
    keywordCandidates: row.target_keyword_candidates || row.example_keyword || "",
    competitorExample: row.example_competitor || "",
    // The CSV master prompt holds keyword lists, accuracy notes and scope. Used as
    // research input only; its formatting and length instructions are superseded.
    researchBrief: (row.master_ai_prompt || "").slice(0, 6000),
  };
}

export function buildBriefPrompt(input: {
  spec: PageSpecification;
  links: LinkOption[];
  facts: { id: string; statement: string }[];
  imageSections: string[];
}) {
  const { spec } = input;
  const page = sitePage(spec.path);
  const pillar = pillarFor(spec.path);
  return JSON.stringify({
    task: "Plan this page before it is written. Return the JSON schema below.",
    page: {
      path: spec.path,
      workingTitle: spec.title,
      pageType: pageTypeFor(spec.path),
      pillar: pillar?.label,
      menuLabel: page?.label,
      sections: spec.sections.map((s) => ({ id: s.id, name: s.name })),
    },
    research: researchNotes(spec),
    approvedEvidence: input.facts,
    allowedInternalLinks: input.links,
    requirements: [
      "searchIntent: the dominant intent behind the primary keyword.",
      "primaryKeyword: the single query this page should rank for, as buyers type it (lowercase).",
      "secondaryKeywords: 4-8 close variants and long-tail queries, no stuffing.",
      "entities: 8-15 specific technologies, standards, platforms, roles or concepts an expert answer would mention.",
      "buyerQuestions: 5-8 real questions buyers ask before hiring (cost factors, timeline factors, technology choice, ownership of code/IP, communication across time zones, maintenance). These become the FAQ.",
      "angle: the one reason a buyer should enquire, stated without invented proof.",
      "outline: one entry per section id, with its purpose and 2-5 key points so sections do not repeat each other.",
      "internalLinks: 2-6 entries chosen only from allowedInternalLinks, with descriptive anchor text (not 'click here').",
      "metaTitle: at most 60 characters, primary keyword near the start, ends with ' | Netofficials' only if it fits.",
      "metaDescription: 140-155 characters, includes the primary keyword and a clear reason to enquire.",
      "images: one entry for each of these section ids: " + input.imageSections.join(", ") + ". subject = what a flat conceptual illustration should show for this topic (no text, no people's faces); alt = a factual description of that illustration in at most 125 characters.",
    ],
    schema: {
      searchIntent: "informational | commercial | transactional | navigational",
      audience: "string",
      primaryKeyword: "string",
      secondaryKeywords: ["string"],
      entities: ["string"],
      buyerQuestions: ["string"],
      angle: "string",
      outline: [{ sectionId: "string", purpose: "string", points: ["string"] }],
      internalLinks: [{ path: "string", anchor: "string" }],
      metaTitle: "string",
      metaDescription: "string",
      images: [{ sectionId: "string", subject: "string", alt: "string" }],
    },
  });
}

/** Parse model output and drop anything that points outside the allowed links. */
export function parseBrief(raw: unknown, links: LinkOption[]): PageBrief {
  const brief = pageBriefSchema.parse(raw);
  const allowed = new Set(links.map((l) => l.path));
  brief.internalLinks = brief.internalLinks.filter((l) => allowed.has(l.path)).slice(0, 6);
  return brief;
}
