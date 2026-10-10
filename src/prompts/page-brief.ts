import { z } from "zod";
import type { PageSpecification } from "../page-spec-schema";
import { pillarFor, sitePage } from "../site-structure";
import { pageTypeFor } from "./templates";
import { composeMetaTitle, isKeywordTitle, tidyMetaTitle } from "./meta-title";
import { plainDashes } from "./punctuation";

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
  answerSummary: text(500).default(""),
  keyFacts: list(6, 200).default([]),
  schemaAbout: z
    .array(z.object({ name: text(80), sameAs: text(300).default("") }))
    .transform((v) => v.slice(0, 8))
    .default([]),
  serviceType: text(100).default(""),
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
      "metaTitle: comma-separated keywords, primary keyword first then 1-2 supporting keywords, at most 60 characters, ends with ' | Netofficials' only if it fits. Example: 'Mobile App Development Services, iOS, Android | Netofficials'.",
      "metaDescription: 140-155 characters, includes the primary keyword, one concrete scope detail (what is built, for whom) and one action; no quotes, no ellipsis.",
      "answerSummary: 40-60 words that directly answer what this service is and who it is for; it must stand alone as a quoted answer; start with a definition.",
      "keyFacts: 4-6 short factual lines (<=25 words each) using ONLY approved evidence or definitional facts about the technology; never invent statistics.",
      "schemaAbout: 4-8 entities the page is about, each {name, sameAs} where sameAs is a Wikipedia or Wikidata URL ONLY if you are certain it exists, otherwise an empty string.",
      "serviceType: the schema.org serviceType in 2-5 words, e.g. 'Mobile app development'.",
      "images: one entry for each of these section ids: " + input.imageSections.join(", ") + ". subject = what a flat conceptual illustration should show for this topic (no text, no people's faces); alt = a factual description of that illustration in at most 125 characters.",
      ...(spec.path === "/blog"
        ? [
            "GUIDES INDEX: the listing page for Netofficials' buyer guides (cost, scope, choosing a provider) on software, websites and search marketing. primaryKeyword is 'software development guides'; secondaryKeywords include 'website cost guides', 'SEO cost guides India' and 'how to choose a software development company'.",
            "answerSummary starts 'Netofficials publishes buyer guides on...' and names the three topics. keyFacts use only approved evidence; none are needed. serviceType is an empty string. images: none are needed (return an empty list); the guides carry their own illustrations.",
          ]
        : []),
      ...(spec.path === "/why-choose-netofficials"
        ? [
            "WHY CHOOSE PAGE: the honest case for choosing Netofficials, an India-based software development company. primaryKeyword is 'why choose netofficials'; secondaryKeywords include 'software development company India', 'Netofficials vs freelancers' and 'outsourcing firm vs freelancer'. Do NOT target 'best' or 'reviews' keywords.",
            "answerSummary starts 'Teams choose Netofficials, an India-based software development company, because...' and names the working practices (engineers who scope the work build it, direct access to the technical lead, one team across disciplines, written scope, client-owned code). No rankings, figures or competitor names. keyFacts use only approved evidence or those practices. serviceType is an empty string. images: the hero only, a flat illustration of one small team connected to several disciplines, no people or faces.",
          ]
        : []),
      ...(spec.path === "/how-we-work"
        ? [
            "HOW WE WORK PAGE: explains how Netofficials, an India-based software development company, delivers a project from first brief to handover. primaryKeyword is 'how software development company works' unless the research gives a stronger query; secondaryKeywords include 'agile software development process' and 'software development process India'.",
            "answerSummary starts 'Netofficials delivers software projects in five stages: ...' and names them. keyFacts use only approved evidence or the method itself (scoped before build, sprint reviews, code handover); no cadence times, durations or figures. serviceType is an empty string. images: the hero only, a flat illustration of a delivery pipeline with stages and a review step, no people or faces.",
          ]
        : []),
      ...(spec.path === "/engagement-models"
        ? [
            "ENGAGEMENT MODELS PAGE: explains how a client can work with Netofficials, an India-based software development company: fixed-price project, dedicated development team, staff augmentation. primaryKeyword is 'software development engagement models'; secondaryKeywords include 'dedicated development team model', 'staff augmentation model India' and 'fixed price software development'.",
            "answerSummary starts 'Netofficials offers three software development engagement models: ...' and names all three with one distinguishing phrase each. keyFacts use only approved evidence or definitional facts about the models; never a minimum term, rate, onboarding time or support period unless an approved fact states it. serviceType is an empty string. images: one entry for the hero only, a flat illustration of three different team structures around one product, no people or faces.",
          ]
        : []),
      ...(spec.path === "/contact"
        ? [
            "CONTACT PAGE: a conversion page for sending a project enquiry to Netofficials, an India-based software development company. primaryKeyword is 'contact Netofficials' unless the research gives a stronger query; secondaryKeywords include 'software development company India contact' and 'get a software development quote'.",
            "answerSummary starts 'To contact Netofficials, send a short project brief through the enquiry form...' and says what happens next without response times. keyFacts use only approved evidence; no email, phone or address unless an approved fact states it. serviceType is an empty string. images: none are needed (return an empty list).",
          ]
        : []),
      ...(spec.path === "/about"
        ? [
            "ABOUT PAGE: this is the company profile of Netofficials, an India-based software development company, not a service page. primaryKeyword is 'software development company India' unless the research gives a stronger query; secondaryKeywords include 'custom software development India' and 'about Netofficials'.",
            "Never position Netofficials as top, leading, best, number one or award-winning. The page earns trust by stating what it builds, how it delivers and who it works with.",
            "answerSummary starts 'Netofficials is an India-based software development company that builds...'. keyFacts use only approved evidence or the practice names (custom software, AI and automation, cloud and DevOps, mobile apps, web, digital marketing, developer hiring); no founding year, headcount, client or award unless an approved fact states it. serviceType is an empty string. schemaAbout lists the practice technologies, not people.",
            "images: four flat illustrations with no people or faces: hero = a wide abstract workshop of software layers and interface panels; company-story = a stack of connected product, cloud and mobile layers; delivery-timeline = a loop of discovery, build, test and handover stages; working-model = abstract time-zone bands crossing a globe-like grid. No map outlines, flags or text.",
          ]
        : []),
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
      answerSummary: "string",
      keyFacts: ["string"],
      schemaAbout: [{ name: "string", sameAs: "string" }],
      serviceType: "string",
      images: [{ sectionId: "string", subject: "string", alt: "string" }],
    },
  });
}

/** Parse model output and drop anything that points outside the allowed links. */
export function parseBrief(raw: unknown, links: LinkOption[]): PageBrief {
  const brief = pageBriefSchema.parse(raw);
  const allowed = new Set(links.map((l) => l.path));
  brief.internalLinks = brief.internalLinks.filter((l) => allowed.has(l.path)).slice(0, 6);
  if (!isKeywordTitle(brief.metaTitle) || brief.metaTitle.length > 60) {
    // Entities arrive as definitions ("HIPAA (Health Insurance ...), the US law ..."); only the name belongs in a title.
    const names = brief.entities.map((e) => e.split(/[,(]/)[0].trim()).filter((e) => e && e.length <= 24);
    brief.metaTitle = composeMetaTitle(brief.primaryKeyword, brief.secondaryKeywords, "Netofficials", names);
  }
  brief.metaTitle = tidyMetaTitle(brief.metaTitle);
  // Meta text and summaries never carry em or en dashes.
  brief.metaDescription = plainDashes(brief.metaDescription);
  brief.answerSummary = plainDashes(brief.answerSummary);
  brief.angle = plainDashes(brief.angle);
  brief.keyFacts = brief.keyFacts.map(plainDashes);
  if (brief.metaDescription.length > 155) {
    const cut = brief.metaDescription.slice(0, 155);
    const boundary = cut.lastIndexOf(" ");
    brief.metaDescription = (boundary > 0 ? cut.slice(0, boundary) : cut).replace(/[\s,;:\-–—(]+$/, "");
  }
  return brief;
}
