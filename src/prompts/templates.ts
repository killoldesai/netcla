import type { PageSpecification, SectionSpecification } from "../page-spec-schema";
import { sitePage, type PageType } from "../site-structure";

export function pageTypeFor(path: string): PageType {
  if (path.startsWith("/blog/")) return "guide";
  return sitePage(path)?.type ?? "service";
}

const section = (
  id: string,
  order: number,
  name: string,
  fields: string[],
  extra: Partial<SectionSpecification> = {},
): SectionSpecification => ({
  id,
  order,
  name,
  layout: "",
  fields,
  originalPrompt: "",
  hero: false,
  imagePrompt: "",
  ratio: "",
  originalRow: {},
  ...extra,
});

const pairs = (prefix: string, n: number, parts: string[]) =>
  Array.from({ length: n }, (_, i) => parts.map((p) => `${prefix}_${i + 1}_${p}`)).flat();

/**
 * Long-form guide layout. The imported CSV gives guides only two editorial
 * blocks; answer-engine and AI-assistant citations need a TL;DR, question-led
 * H2 sections, a FAQ and related services.
 */
export function guideSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections: SectionSpecification[] = [
    section("hero", 1, "Guide introduction", ["tag_pill", "h1", "subheadline", "cta_primary_label", "cta_primary_url"], {
      hero: true,
      imagePrompt: heroSpec?.imagePrompt ?? "",
      ratio: heroSpec?.ratio || "16:9",
      originalRow: heroSpec?.originalRow ?? {},
    }),
    section("key-takeaways", 2, "Key takeaways", ["section_label", "heading", "body_paragraph"]),
  ];
  for (let i = 1; i <= 5; i++)
    sections.push(section(`editorial-${i}`, 2 + i, `Guide section ${i}`, ["section_label", "heading", "body_paragraph"]));
  sections.push(
    section("faq", 8, "Frequently asked questions", faqFields),
    section("related-services", 9, "Related services", ["section_label", "heading", ...pairs("service", 3, ["name", "url", "reason"])]),
    section("cta-banner", 10, "Closing call to action", ["heading", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"]),
  );
  return sections;
}

const faqFields = ["section_label", "heading", ...Array.from({ length: 6 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()];
const needsFaq = new Set<PageType>(["pillar", "service", "technology", "industry", "hire", "location", "directory", "company"]);

/** Pages whose buyer questions need an FAQ before publishing. Other pages skip the check. */
export function requiresFaq(path: string) {
  if (path.startsWith("/blog/")) return true;
  // Listings and forms: the questions are answered elsewhere on the site.
  if (["/careers", "/faq", "/contact", "/case-studies", "/portfolio"].includes(path)) return false;
  // Pages outside the site map (legal, thank-you, 404) don't answer buyer questions.
  const type = sitePage(path)?.type;
  return type !== undefined && needsFaq.has(type);
}

/** Page families that share one skeleton. Everything else (company, contact, home, listings) keeps its own layout. */
export type Family = "hub" | "service" | "technology" | "hire" | "industry" | "location" | "guide" | "other";

export function familyOf(path: string): Family {
  if (path.startsWith("/blog/")) return "guide";
  // Pages outside the site structure (404, legal, thank-you) are not commercial pages, whatever pageTypeFor defaults to.
  switch (sitePage(path)?.type) {
    case "pillar":
      return "hub";
    case "service":
    case "technology":
    case "hire":
    case "industry":
    case "location":
      return sitePage(path)!.type as Family;
    default:
      return "other";
  }
}

/**
 * Words a finished page should land in (all visible copy, HTML stripped).
 * QA warns outside the band; the section targets below add up to it.
 */
export const wordBands: Record<Family, { min: number; max: number }> = {
  hub: { min: 2300, max: 3000 },
  service: { min: 2300, max: 3000 },
  technology: { min: 2300, max: 3000 },
  hire: { min: 2300, max: 2900 },
  industry: { min: 2300, max: 2900 },
  location: { min: 2300, max: 2900 },
  guide: { min: 2800, max: 3800 },
  other: { min: 0, max: 100000 },
};

const faq8 = ["section_label", "heading", ...Array.from({ length: 8 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()];
const ctaFields = ["heading", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"];
const heroFields = ["tag_pill", "h1", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"];
const head = ["section_label", "heading"];

/**
 * One skeleton for every commercial family:
 * hero, answer-first overview, capabilities, process, technology, audience,
 * (industries | compliance), cost factors, FAQ, related, CTA. Field names reuse the
 * patterns the renderer already understands (card_N_*, step_N_*, group_N_*, persona_N_*).
 * Unproven blocks (stats, testimonials) are not generated; they only appear when approved evidence exists.
 */
export function familySections(family: Family, source: PageSpecification): SectionSpecification[] {
  if (family === "guide") return guideSections(source);
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const hero = section("hero", 0, "Hero", heroFields, {
    hero: true,
    layout: "HeroSplit",
    imagePrompt: heroSpec?.imagePrompt ?? "",
    ratio: heroSpec?.ratio || "4:3",
    originalRow: heroSpec?.originalRow ?? {},
  });
  const overview = section("service-overview", 0, "Overview", [...head, "body_paragraph", "outcome_1", "outcome_2", "outcome_3", "outcome_4"], { layout: "EditorialSplit" });
  const deliver = section("what-we-deliver", 0, family === "hire" ? "Skills and responsibilities" : "What we deliver", [...head, ...pairs("card", 6, ["title", "body", "icon_key"])], { layout: "DeliverableGrid" });
  const process = section("process", 0, family === "hire" ? "Vetting and onboarding" : "Process", [...head, ...pairs("step", 5, ["title", "body"])], { layout: "TimelineStrip" });
  const tech = section("technology-stack", 0, "Technology stack", [...head, ...pairs("group", 4, ["name", "items"])], { layout: "TechnologyGrid" });
  const who = section("who-its-for", 0, family === "technology" ? "When to choose it" : "Who it is for", [...head, ...pairs("persona", 3, ["title", "problem", "outcome"])], { layout: "PersonaCards" });
  const industries = section("industry-applications", 0, "Industry applications", [...head, ...pairs("industry", 4, ["name", "url", "usecase"])], { layout: "IndustryLinks" });
  const compliance = section("compliance-data", 0, "Compliance and data", [...head, ...pairs("item", 4, ["title", "body"])], { layout: "CardGrid3Col" });
  const cost = section("cost-factors", 0, "Cost and timeline factors", [...head, "subheadline", ...pairs("factor", 5, ["title", "body"])], { layout: "CardGrid3Col" });
  const faq = section("faq", 0, "Frequently asked questions", faq8, { layout: "AccordionFull" });
  const related = section("related-services", 0, "Related services", [...head, ...pairs("service", 3, ["name", "url", "reason"])], { layout: "ServiceDirectory" });
  const cta = section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" });
  let sections: SectionSpecification[];
  if (family === "hub" && source.path === "/industries") {
    // The industries hub lists every sector page (11) and covers cross-sector compliance instead of a stack or sector-by-service grid.
    sections = [
      hero,
      overview,
      section("services-grid", 0, "Sectors we build for", [...head, ...pairs("svc", 11, ["title", "body", "url", "icon_key"])], { layout: "ServiceDirectory" }),
      section("why-netofficials", 0, "Why Netofficials", [...head, "body_paragraph", "adv_1", "adv_2", "adv_3", "adv_4"], { layout: "EditorialSplit" }),
      compliance,
      section("engagement-models", 0, "Engagement models", [...head, ...pairs("model", 3, ["name", "body", "best_for"])], { layout: "EngagementCards" }),
      cost,
      faq,
      section("related-hubs", 0, "Related hubs", [...head, ...pairs("hub", 3, ["name", "body", "url"])], { layout: "ServiceDirectory" }),
      cta,
    ];
  } else if (family === "hub") {
    sections = [
      hero,
      overview,
      section("services-grid", 0, "Child services", [...head, ...pairs("svc", 6, ["title", "body", "url", "icon_key"])], { layout: "ServiceDirectory" }),
      section("why-netofficials", 0, "Why Netofficials", [...head, "body_paragraph", "adv_1", "adv_2", "adv_3", "adv_4"], { layout: "EditorialSplit" }),
      tech,
      // Industry x service headings ("Healthcare Mobile App Development") let one hub rank for combination keywords.
      section("industry-applications", 0, "Industry applications", [...head, ...pairs("industry", 6, ["name", "url", "usecase"])], { layout: "IndustryLinks" }),
      section("engagement-models", 0, "Engagement models", [...head, ...pairs("model", 3, ["name", "body", "best_for"])], { layout: "EngagementCards" }),
      cost,
      faq,
      section("related-hubs", 0, "Related hubs", [...head, ...pairs("hub", 3, ["name", "body", "url"])], { layout: "ServiceDirectory" }),
      cta,
    ];
  } else if (family === "hire") sections = [hero, overview, deliver, process, tech, who, cost, faq, related, cta];
  else if (family === "industry") sections = [hero, overview, deliver, process, tech, who, compliance, cost, faq, related, cta];
  else if (family === "location") sections = [hero, overview, deliver, process, tech, who, cost, faq, related, cta];
  else sections = [hero, overview, deliver, process, tech, who, industries, cost, faq, related, cta];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the About page (all visible copy). */
export const aboutBand = { min: 1600, max: 2300 };

/**
 * The About page is a company profile, not a service page: its own section list and its own layout
 * (src/about-page.tsx). Practice rows and sector chips are computed from the site structure, so the
 * model only writes the copy around them. The proof-* sections are evidence-gated: they are never
 * generated, only filled by the owner from approved facts, and render only when they have content.
 */
export function aboutSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Statement", ["tag_pill", "h1", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"], {
      hero: true,
      layout: "AboutStatement",
      imagePrompt: heroSpec?.imagePrompt ?? "",
      ratio: "16:9",
      originalRow: heroSpec?.originalRow ?? {},
    }),
    section("company-story", 0, "Who we are", [...head, "body_paragraph", "pull_statement"], { layout: "StoryColumns" }),
    section("company-glance", 0, "Company at a glance", [...head, "founded_year", "base_city", "delivery_window", "practices_note"], { layout: "GlanceList" }),
    section("practice-index", 0, "What we do", [...head, "intro", ...Array.from({ length: 4 }, (_, i) => `practice_${i + 1}_summary`)], { layout: "PracticeIndex" }),
    section("principles", 0, "How we work", [...head, ...pairs("principle", 4, ["title", "body"])], { layout: "PrincipleCards" }),
    section("delivery-timeline", 0, "How a project runs", [...head, ...pairs("step", 5, ["title", "body"])], { layout: "Timeline" }),
    section("working-model", 0, "Where we work", [...head, "body_paragraph", "tools", "overlap_note"], { layout: "WorkingModel" }),
    section("industries-intro", 0, "Industries we know", [...head, "intro"], { layout: "SectorChips" }),
    section("india-partner", 0, "Why an India-based partner", [...head, ...pairs("topic", 3, ["title", "benefit", "watch"])], { layout: "TradeoffColumns" }),
    section("proof-team", 0, "Team", [...head, ...pairs("leader", 3, ["name", "title", "bio"])], { layout: "ProofTeam" }),
    section("proof-clients", 0, "Clients and work", [...head, "client_count", "client_note"], { layout: "ProofClients" }),
    section("proof-awards", 0, "Recognition", [...head, "award_1", "award_2", "award_3"], { layout: "ProofAwards" }),
    section("faq", 0, "Frequently asked questions", ["section_label", "heading", ...Array.from({ length: 6 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()], { layout: "AccordionFull" }),
    section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the Contact page (all visible copy; the form itself is fixed UI). */
export const contactBand = { min: 700, max: 1200 };

/**
 * The Contact page is a conversion page: form first, reassurance second. Its own section list and layout
 * (src/contact-page.tsx). Office and direct-contact details are evidence-gated (proof-offices): the owner
 * fills them from approved facts and the block stays hidden until then.
 */
export function contactSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Introduction", ["tag_pill", "h1", "subheadline", "trust_1", "trust_2", "trust_3"], { layout: "ContactIntro", originalRow: heroSpec?.originalRow ?? {} }),
    section("contact-form", 0, "Enquiry form", ["form_heading", "form_subheadline", "submit_label", "privacy_note", "goal_hint"], { layout: "EnquiryForm" }),
    section("next-steps", 0, "What happens next", [...head, ...pairs("step", 3, ["title", "body"])], { layout: "ThreeSteps" }),
    section("prepare", 0, "What to include", [...head, "intro", ...pairs("item", 4, ["title", "body"])], { layout: "Checklist" }),
    section("assurances", 0, "Assurances", [...head, ...pairs("item", 3, ["title", "body"])], { layout: "AssuranceColumns" }),
    section("other-routes", 0, "Other ways in", [...head, ...pairs("route", 3, ["name", "url", "body"])], { layout: "RouteCards" }),
    section("proof-offices", 0, "Offices and direct contact", [...head, "direct_email", "direct_phone", ...pairs("office", 2, ["city", "address", "timezone"])], { layout: "ProofOffices" }),
    section("faq", 0, "Frequently asked questions", ["section_label", "heading", ...Array.from({ length: 5 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()], { layout: "AccordionFull" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the Engagement Models page. */
export const engagementBand = { min: 1400, max: 2000 };

/**
 * Engagement Models is a comparison-and-decision page: a model-by-model matrix, a situation-to-model guide,
 * what drives the price under each model, and how an engagement starts. Own section list and layout
 * (src/engagement-page.tsx). The heading and section ids that older accepted content used are kept.
 */
export function engagementSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Introduction", ["tag_pill", "h1", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"], {
      hero: true,
      layout: "EngageHero",
      imagePrompt: heroSpec?.imagePrompt ?? "",
      ratio: "4:3",
      originalRow: heroSpec?.originalRow ?? {},
    }),
    section("models-comparison", 0, "The three models", [...head, ...pairs("model", 3, ["name", "tagline", "body", "management", "team", "pricing", "timeline", "changes", "best_for"])], { layout: "ModelMatrix" }),
    section("decision-guide", 0, "Which model fits", [...head, ...pairs("situation", 3, ["scenario", "choice", "recommendation"])], { layout: "DecisionRows" }),
    section("pricing-factors", 0, "What drives the price", [...head, "intro", ...pairs("factor", 4, ["title", "body"])], { layout: "FactorList" }),
    section("process", 0, "How an engagement starts", [...head, ...pairs("step", 4, ["title", "body"])], { layout: "StartSteps" }),
    section("faq", 0, "Frequently asked questions", ["section_label", "heading", ...Array.from({ length: 6 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()], { layout: "AccordionFull" }),
    section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the How We Work page. */
export const howWorkBand = { min: 1200, max: 1800 };

/**
 * How We Work explains the delivery method: the stages a project goes through, how the team communicates, the
 * tools behind it and the commitments the client keeps. Own section list and layout (src/how-work-page.tsx).
 * The only image is the hero; the stages are a real sequence, so they are numbered; nothing else is.
 */
export function howWorkSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Introduction", ["tag_pill", "h1", "subheadline", "signal_1", "signal_2", "signal_3", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"], {
      hero: true,
      layout: "MethodHero",
      imagePrompt: heroSpec?.imagePrompt ?? "",
      ratio: "16:9",
      originalRow: heroSpec?.originalRow ?? {},
    }),
    section("approach", 0, "The approach", [...head, "body_paragraph"], { layout: "EditorialSplit" }),
    section("stages", 0, "From brief to handover", [...head, "intro", ...pairs("stage", 5, ["title", "body", "receives"])], { layout: "StageSequence" }),
    section("communication", 0, "How we communicate", [...head, "intro", ...pairs("cadence", 4, ["name", "when", "who", "purpose"])], { layout: "CadenceTable" }),
    section("tools", 0, "Tools behind the work", [...head, ...pairs("tool", 4, ["name", "use"])], { layout: "ToolList" }),
    section("commitments", 0, "What we commit to", [...head, ...pairs("commit", 4, ["title", "body"])], { layout: "CommitmentList" }),
    section("faq", 0, "Frequently asked questions", ["section_label", "heading", ...Array.from({ length: 5 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()], { layout: "AccordionFull" }),
    section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the Why Choose Netofficials page. */
export const whyChooseBand = { min: 1300, max: 1900 };

/**
 * Why Choose Netofficials is an honest case for the company: the reasons, a category comparison (large outsourcing
 * firms, freelancers) that says when each is the better choice, who Netofficials is not right for, and where to read
 * next. Testimonials are evidence-gated (proof-testimonials): never generated, hidden until the owner supplies them.
 */
export function whyChooseSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Introduction", ["tag_pill", "h1", "subheadline", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url"], {
      hero: true,
      layout: "WhyHero",
      imagePrompt: heroSpec?.imagePrompt ?? "",
      ratio: "4:3",
      originalRow: heroSpec?.originalRow ?? {},
    }),
    section("reasons", 0, "Reasons", [...head, "intro", ...pairs("reason", 6, ["title", "body"])], { layout: "ReasonList" }),
    section("comparison", 0, "How we compare", [...head, "intro", ...pairs("row", 5, ["attribute", "us", "firms", "freelancers"]), "firms_better", "freelancers_better"], { layout: "ComparisonTable" }),
    section("not-a-fit", 0, "When we are not the right fit", [...head, "intro", ...pairs("fit", 3, ["title", "body"])], { layout: "FitList" }),
    section("proof-testimonials", 0, "Client feedback", [...head, ...pairs("quote", 3, ["text", "name", "role"])], { layout: "ProofQuotes" }),
    section("routes", 0, "Where to read next", [...head, ...pairs("route", 3, ["name", "url", "body"])], { layout: "RouteList" }),
    section("faq", 0, "Frequently asked questions", ["section_label", "heading", ...Array.from({ length: 5 }, (_, i) => [`q${i + 1}`, `a${i + 1}`]).flat()], { layout: "AccordionFull" }),
    section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Word band for the /blog index: only the intro copy is written; the guide list comes from the database. */
export const blogIndexBand = { min: 200, max: 650 };

/**
 * The guides index is a listing, not an article. The model writes the hero, one short intro per topic, the
 * newsletter band and the closing band; the featured guide and the cards are data (src/blog-posts.ts), so they
 * always match what is published. No illustrations are generated for the index itself.
 */
export function blogIndexSections(source: PageSpecification): SectionSpecification[] {
  const heroSpec = source.sections.find((s) => s.id === "hero");
  const sections = [
    section("hero", 0, "Introduction", ["tag_pill", "h1", "subheadline"], { layout: "IndexHero", originalRow: heroSpec?.originalRow ?? {} }),
    section("topics", 0, "Topics", [...head, "intro", "topic_1_blurb", "topic_2_blurb", "topic_3_blurb"], { layout: "TopicIntros" }),
    section("newsletter", 0, "Newsletter", [...head, "subheadline", "privacy_note"], { layout: "NewsletterBand" }),
    section("cta-banner", 0, "Closing call to action", ctaFields, { layout: "DarkCtaBand" }),
  ];
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** Pages with their own band and label instead of a family (company profile, contact, engagement models, how we work, why choose, guides index). */
const bespokePages: Record<string, { band: { min: number; max: number }; label: string }> = {
  "/about": { band: aboutBand, label: "company profile" },
  "/contact": { band: contactBand, label: "contact" },
  "/engagement-models": { band: engagementBand, label: "engagement models" },
  "/how-we-work": { band: howWorkBand, label: "how we work" },
  "/why-choose-netofficials": { band: whyChooseBand, label: "why choose" },
  "/blog": { band: blogIndexBand, label: "guides index" },
};
export const pageBand = (path: string) => bespokePages[path]?.band;
export const pageLabel = (path: string) => bespokePages[path]?.label;

/** The specification the pipeline actually generates against. */
export function effectiveSpec(spec: PageSpecification): PageSpecification {
  const type = pageTypeFor(spec.path);
  // The guides index is a listing, so it is checked before the guide (article) layout that /blog/* pages use.
  if (spec.path === "/blog") return { ...spec, sections: blogIndexSections(spec) };
  if (type === "guide") return { ...spec, sections: guideSections(spec) };
  if (spec.path === "/about") return { ...spec, sections: aboutSections(spec) };
  if (spec.path === "/contact") return { ...spec, sections: contactSections(spec) };
  if (spec.path === "/engagement-models") return { ...spec, sections: engagementSections(spec) };
  if (spec.path === "/how-we-work") return { ...spec, sections: howWorkSections(spec) };
  if (spec.path === "/why-choose-netofficials") return { ...spec, sections: whyChooseSections(spec) };
  // Hubs and every service, technology, hire, industry and location page share one skeleton.
  const family = familyOf(spec.path);
  if (family !== "other") return { ...spec, sections: familySections(family, spec) };
  // Every commercial page answers buyer questions (FAQ rich results, AI citations).
  if (needsFaq.has(type) && !spec.sections.some((s) => /faq/.test(s.id))) {
    const sections = [...spec.sections];
    const cta = sections.findIndex((s) => s.id === "cta-banner");
    sections.splice(cta >= 0 ? cta : sections.length, 0, section("faq", 0, "Frequently asked questions", faqFields));
    return { ...spec, sections: sections.map((s, i) => ({ ...s, order: i + 1 })) };
  }
  return spec;
}

/** Sections that get a generated illustration, besides the hero. */
export function imageSectionIds(spec: PageSpecification): string[] {
  const type = pageTypeFor(spec.path);
  if (spec.path === "/blog") return [];
  // The About page tells its story with four illustrations: statement banner, story, delivery loop, timezone bands.
  if (spec.path === "/about")
    return ["hero", "company-story", "delivery-timeline", "working-model"].filter((id) => spec.sections.some((s) => s.id === id));
  // The Contact page is a form page: no illustrations. How We Work illustrates only its hero.
  if (spec.path === "/contact") return [];
  if (spec.path === "/how-we-work") return spec.sections.some((s) => s.id === "hero") ? ["hero"] : [];
  // Every page's hero gets an illustration, except utility pages (legal, 404,
  // thank-you) where a text hero is the right call.
  const utility = /^\/(404|thank-you|privacy-policy|terms|cookie-policy)$/.test(spec.path);
  const ids = spec.sections.filter((s) => s.hero || (s.id === "hero" && !utility)).map((s) => s.id);
  const secondary =
    type === "guide"
      ? "editorial-2"
      : ["service", "technology", "pillar", "industry"].includes(type)
        ? "service-overview"
        : undefined;
  if (secondary && spec.sections.some((s) => s.id === secondary)) ids.push(secondary);
  return ids;
}

/** Ratio for an image section; heroes follow the spec, inline figures are landscape. */
export function imageRatio(spec: PageSpecification, sectionId: string) {
  const s = spec.sections.find((x) => x.id === sectionId);
  if (s?.hero || s?.id === "hero") return /^\d+:\d+$/.test(s.ratio) ? s.ratio : "4:3";
  return "16:9";
}

/** Target lengths by field family, used by prompts and by QA. */
export const lengthTargets: { pattern: RegExp; min: number; max: number; label: string }[] = [
  { pattern: /^h1$/, min: 5, max: 12, label: "H1" },
  { pattern: /^heading$/, min: 3, max: 12, label: "heading" },
  { pattern: /^subheadline$/, min: 20, max: 45, label: "subheadline" },
  { pattern: /^body_paragraph$/, min: 200, max: 250, label: "overview body" },
  { pattern: /^card_\d+_body$/, min: 35, max: 52, label: "card body" },
  { pattern: /^svc_\d+_body$/, min: 25, max: 42, label: "child service" },
  { pattern: /^persona_\d+_(?:problem|outcome)$/, min: 20, max: 38, label: "persona" },
  { pattern: /^step_\d+_body$/, min: 35, max: 52, label: "process step" },
  { pattern: /^factor_\d+_body$/, min: 25, max: 42, label: "cost factor" },
  { pattern: /^item_\d+_body$/, min: 25, max: 45, label: "compliance item" },
  { pattern: /^a\d+$/, min: 50, max: 85, label: "FAQ answer" },
  { pattern: /^(?:industry_\d+_usecase|service_\d+_reason)$/, min: 12, max: 45, label: "link reason" },
  { pattern: /^hub_\d+_body$/, min: 15, max: 40, label: "related hub" },
  { pattern: /^principle_\d+_body$/, min: 30, max: 50, label: "principle" },
  { pattern: /^practice_\d+_summary$/, min: 20, max: 34, label: "practice summary" },
  { pattern: /^topic_\d+_(?:benefit|watch)$/, min: 25, max: 45, label: "partner trade-off" },
  { pattern: /^pull_statement$/, min: 12, max: 30, label: "pull statement" },
  { pattern: /^route_\d+_body$/, min: 14, max: 32, label: "route" },
  { pattern: /^model_\d+_body$/, min: 35, max: 58, label: "engagement model" },
  { pattern: /^model_\d+_(?:management|team|pricing|timeline|changes)$/, min: 5, max: 20, label: "matrix cell" },
  { pattern: /^model_\d+_best_for$/, min: 8, max: 22, label: "matrix best-for" },
  { pattern: /^situation_\d+_scenario$/, min: 8, max: 18, label: "situation" },
  { pattern: /^situation_\d+_recommendation$/, min: 18, max: 40, label: "recommendation" },
  { pattern: /^stage_\d+_body$/, min: 30, max: 50, label: "stage" },
  { pattern: /^stage_\d+_receives$/, min: 8, max: 20, label: "stage receives" },
  { pattern: /^cadence_\d+_(?:when|who)$/, min: 4, max: 14, label: "cadence cell" },
  { pattern: /^cadence_\d+_purpose$/, min: 10, max: 24, label: "cadence purpose" },
  { pattern: /^tool_\d+_use$/, min: 8, max: 20, label: "tool use" },
  { pattern: /^commit_\d+_body$/, min: 28, max: 42, label: "commitment" },
  { pattern: /^reason_\d+_body$/, min: 26, max: 46, label: "reason" },
  { pattern: /^topic_\d+_blurb$/, min: 10, max: 30, label: "topic intro" },
  { pattern: /^row_\d+_(?:us|firms|freelancers)$/, min: 6, max: 24, label: "comparison cell" },
  { pattern: /^(?:firms|freelancers)_better$/, min: 14, max: 40, label: "when better" },
  { pattern: /^fit_\d+_body$/, min: 22, max: 40, label: "not a fit" },
];

/** Guides run longer per section. */
export const guideBodyTarget = { min: 280, max: 480 };

/**
 * The layout an existing draft was generated with. Drafts created before a
 * template change keep validating against their original sections until the
 * page is regenerated in full.
 */
export function specForContent(
  spec: PageSpecification,
  content?: { pageSections?: { id: string }[] } | null,
): PageSpecification {
  const effective = effectiveSpec(spec);
  const ids = new Set(content?.pageSections?.map((s) => s.id) ?? []);
  if (!ids.size || effective.sections.every((s) => ids.has(s.id))) return effective;
  return spec.sections.every((s) => ids.has(s.id)) ? spec : effective;
}
