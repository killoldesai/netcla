export function isFAQSection(heading: string) {
  return /\bfrequently asked questions\b|\bfaqs?\b/i.test(heading);
}
export function faqRequirements(brief: Record<string, any>) {
  const source = [brief.prompt, brief.scope, brief.content_scope]
    .filter(Boolean)
    .join(" ");
  const count = source.match(
    /\bfaqs?\s*[-:–—]?\s*(\d+)\s+(?:buyer\s+)?questions\b/i,
  );
  const minimum = count ? Math.min(30, Math.max(1, Number(count[1]))) : 1;
  return (brief.headings ?? [])
    .filter((h: any) => isFAQSection(h.heading))
    .map((h: any) => ({ id: h.id, heading: h.heading, minimum }));
}
