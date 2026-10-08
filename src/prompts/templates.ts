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
const needsFaq = new Set<PageType>(["pillar", "service", "technology", "industry", "hire", "location"]);

/** The specification the pipeline actually generates against. */
export function effectiveSpec(spec: PageSpecification): PageSpecification {
  const type = pageTypeFor(spec.path);
  if (type === "guide") return { ...spec, sections: guideSections(spec) };
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
  { pattern: /^subheadline$/, min: 20, max: 40, label: "subheadline" },
  { pattern: /^body_paragraph$/, min: 150, max: 260, label: "overview body" },
  { pattern: /^(?:card|persona)_\d+_(?:body|problem|outcome)$/, min: 30, max: 75, label: "card body" },
  { pattern: /^step_\d+_body$/, min: 35, max: 70, label: "process step" },
  { pattern: /^a\d+$/, min: 45, max: 100, label: "FAQ answer" },
  { pattern: /^(?:industry_\d+_usecase|service_\d+_reason)$/, min: 12, max: 45, label: "link reason" },
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
