import { iconKeys, type PageSpecification, type SectionSpecification } from "../page-spec-schema";
import { pillarFor } from "../site-structure";
import type { LinkOption, PageBrief } from "./page-brief";
import { allowedHtml } from "./system";
import { guideBodyTarget, pageTypeFor } from "./templates";

type Rule = { match: RegExp; rules: string[] };

// One rule set per section family. Rules state the SEO / AEO / GEO / lead
// purpose of each field so the model writes to a job, not to a word count.
const sectionRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 5-12 words. Put the primary keyword (or its natural phrasing) in the first half. State what is delivered, not a slogan.",
      "subheadline: 25-40 words that directly answer 'what is this and who is it for', including one secondary keyword naturally.",
      "tag_pill: 2-4 words naming the category, e.g. 'Cross-platform apps'.",
      "cta_primary_label: 2-5 words, low-friction and specific, e.g. 'Get a scoped estimate'. cta_primary_url: /contact.",
      "cta_secondary_label/url: a useful next step on the page or a related allowed link (process, engagement models, related service).",
      "All stat_* fields: empty strings unless approved evidence supports them.",
    ],
  },
  {
    match: /^(?:service-overview|services-overview|editorial-overview|mission-values)$/,
    rules: [
      "heading: a question buyers search or a clear statement that contains the primary keyword.",
      "body_paragraph (HTML): first <p> is a 40-60 word direct answer that can stand alone as a featured snippet, starting with a definition ('X is…' or 'Netofficials builds…'). Then 2-3 <p> paragraphs covering scope, when it is the right choice, and its limits. Use entity names precisely. 160-240 words total. Include 1-2 internal links from the allowed list in natural anchor text.",
      "outcome_N: 6-14 words each, a concrete result or deliverable, no invented numbers.",
    ],
  },
  {
    match: /^key-takeaways$/,
    rules: [
      "heading: 'Key takeaways' or a short variant.",
      "body_paragraph (HTML): a <ul> of 4-6 <li>, each one complete, self-contained sentence an AI assistant could quote verbatim. Cover the answer, the main decision factors and what to do next.",
    ],
  },
  {
    match: /^editorial-\d+$|^editorial-details$/,
    rules: [
      `heading: phrase as the question a reader is asking at this point in the guide; include a secondary keyword where natural.`,
      `body_paragraph (HTML): open with a 40-60 word <p> that answers the heading directly. Then explain with <h3> sub-points, a <ul> or <ol> where the reader compares options or follows steps, and a <table> (with <thead>) when comparing 3+ options across criteria. ${guideBodyTarget.min}-${guideBodyTarget.max} words. Define terms the first time they appear. State cost and timeline as factors, never as invented figures.`,
      "section_label: 1-3 words.",
    ],
  },
  {
    match: /^(?:what-we-deliver|services-grid|differentiators|why-netofficials)$/,
    rules: [
      "heading: names what the buyer gets, not a slogan.",
      "card_N_title: 2-6 words naming a concrete deliverable or capability.",
      "card_N_body: 35-70 words, plain text. What it covers, which technologies or integrations are involved, and when a buyer needs it.",
      "card_N_icon_key: one value from approvedIconKeys or empty.",
    ],
  },
  {
    match: /process/,
    rules: [
      "heading: describes how the engagement runs, e.g. 'How a Flutter project runs from scope to release'.",
      "step_N_title: 2-5 words.",
      "step_N_body: 35-65 words: what happens, who is involved from the client side, and what the client receives at the end of the step.",
    ],
  },
  {
    match: /technolog|tech-stack|tools-stack/,
    rules: [
      "group_N_name: a layer such as 'Front end', 'Back end & APIs', 'Data', 'Cloud & DevOps', 'Testing'.",
      "group_N_items: comma-separated real, current technology names relevant to this service (entities). No versions unless essential.",
    ],
  },
  {
    match: /who-its-for|persona/,
    rules: [
      "persona_N_title: a buyer role or company situation (e.g. 'Founders validating an MVP').",
      "persona_N_problem: 20-40 words describing their situation in their words.",
      "persona_N_outcome: 20-40 words describing what they get from this service, without invented results.",
    ],
  },
  {
    match: /industr/,
    rules: [
      "industry_N_name: industry name. industry_N_url: only an industry page from the allowed links, or an empty string.",
      "industry_N_usecase: 15-40 words, a specific application of this service in that industry.",
    ],
  },
  {
    match: /faq/,
    rules: [
      "heading: e.g. 'Questions about <primary keyword>'.",
      "qN: questions written the way buyers type them into search or ask an AI assistant. Use the brief's buyerQuestions first. Cover cost factors, timeline factors, technology choice, code and IP ownership, communication across time zones, and support after launch.",
      "aN (HTML allowed): 50-90 words. The first sentence answers the question directly and completely. Then add the factors or conditions. No 'Great question', no hedging openers, no invented numbers.",
    ],
  },
  {
    match: /related/,
    rules: [
      "service_N_name: the linked page's name. service_N_url: only from the allowed links. service_N_reason: 12-30 words on when a buyer of this page also needs that service.",
    ],
  },
  {
    match: /^cta-banner$/,
    rules: [
      "heading: 4-9 words inviting the next step for this specific service.",
      "subheadline: 20-35 words explaining what happens after they enquire (reply with questions, scope, team) without offers, guarantees or prices.",
      "cta_primary_label: 2-5 words; cta_primary_url: /contact.",
      "cta_secondary_label/url: a lower-commitment option from the allowed links (process, engagement models, related guide).",
    ],
  },
];

export function rulesFor(sectionId: string) {
  return sectionRules.find((r) => r.match.test(sectionId))?.rules ?? [
    "heading: a clear statement or buyer question for this section's purpose.",
    "Every body-type field: specific, useful, 30-70 words, no filler.",
  ];
}

export function buildSectionPrompt(input: {
  spec: PageSpecification;
  section: SectionSpecification;
  brief: PageBrief;
  links: LinkOption[];
  facts: { id: string; statement: string }[];
  previous?: Record<string, string>;
  instruction?: string;
}) {
  const { spec, section, brief } = input;
  const outline = brief.outline.find((o) => o.sectionId === section.id);
  const otherSections = brief.outline.filter((o) => o.sectionId !== section.id).map((o) => `${o.sectionId}: ${o.purpose}`);
  return JSON.stringify({
    task: `Write the "${section.id}" section of ${spec.path}. Return one JSON object with exactly the fields listed.`,
    page: {
      path: spec.path,
      type: pageTypeFor(spec.path),
      pillar: pillarFor(spec.path)?.label,
      title: brief.metaTitle || spec.title,
    },
    strategy: {
      searchIntent: brief.searchIntent,
      audience: brief.audience,
      primaryKeyword: brief.primaryKeyword,
      secondaryKeywords: brief.secondaryKeywords,
      entities: brief.entities,
      buyerQuestions: brief.buyerQuestions,
      angle: brief.angle,
      thisSection: outline ?? { purpose: section.name },
      otherSectionsCover: otherSections,
      suggestedInternalLinks: brief.internalLinks,
    },
    exactFields: section.fields,
    fieldRules: rulesFor(section.id),
    htmlAllowedIn: "body_paragraph, mission_body, culture_paragraph and FAQ answers only. Allowed tags: " + allowedHtml,
    approvedIconKeys: iconKeys,
    approvedEvidence: input.facts,
    allowedInternalLinks: input.links.map((l) => ({ path: l.path, label: l.label })),
    previousVersion: input.previous,
    ownerInstruction: input.instruction,
    regeneration: input.previous
      ? "Improve on previousVersion substantively (accuracy, specificity, structure). Do not just paraphrase it."
      : undefined,
  });
}
