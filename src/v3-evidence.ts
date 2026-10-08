import type { Content } from "./content";
const proofSection =
  /^(?:testimonials|featured-work|case-study-grid|team-highlights|awards-clients|office-details)$/;
const proofField =
  /^(?:stat_\d+_|quote_|client_|leader_|award_|certification_|office_|case_\d+_)/;
export function sectionNeedsEvidence(section: {
  id: string;
  fields: Record<string, string>;
}) {
  return (
    Object.entries(section.fields).some(
      ([key, value]) => !!value && proofField.test(key),
    ) ||
    (proofSection.test(section.id) &&
      Object.entries(section.fields).some(
        ([key, value]) =>
          !!value && !["heading", "section_label"].includes(key),
      ))
  );
}
export function verifiedV3Content(
  content: Content,
  approvedIds: string[],
): Content {
  const ids = new Set(approvedIds);
  return {
    ...content,
    pageSections: content.pageSections?.map((section) => {
      const verified =
        section.evidenceIds.length > 0 &&
        section.evidenceIds.every((id) => ids.has(id));
      if (verified) return section;
      return {
        ...section,
        fields: Object.fromEntries(
          Object.entries(section.fields).map(([key, value]) => [
            key,
            proofSection.test(section.id) || proofField.test(key) ? "" : value,
          ]),
        ),
      };
    }),
  };
}
