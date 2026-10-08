import type { Content } from "./content";
import { bannedPhrases } from "./prompts/system";
import { guideBodyTarget, lengthTargets, pageTypeFor } from "./prompts/templates";

export type QACheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
};
export type QAReport = { score: number; checks: QACheck[]; version: 1 };

const stop = new Set(["a", "an", "the", "for", "and", "of", "in", "to", "with", "on", "services", "service"]);
export const plain = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const words = (value: string) => (plain(value).match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;
const stem = (word: string) => word.toLowerCase().replace(/(?:ing|es|s)$/, "");
/** Every meaningful keyword word appears (allowing simple plurals). */
export function containsKeyword(text: string, keyword: string) {
  const haystack = new Set((plain(text).toLowerCase().match(/[\p{L}\p{N}.+#-]+/gu) ?? []).map(stem));
  const needed = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && !stop.has(w))
    .map(stem);
  return needed.length > 0 && needed.every((w) => haystack.has(w));
}

export function runContentQA(content: Content, path: string): QAReport {
  const checks: QACheck[] = [];
  const add = (check: QACheck) => checks.push(check);
  const sections = (content.pageSections ?? []).filter((s) => !s.omitted);
  const field = (id: string, key: string) => sections.find((s) => s.id === id)?.fields[key] ?? "";
  const all = sections.flatMap((s) => Object.entries(s.fields).map(([key, value]) => ({ section: s.id, key, value })));
  const seo = content.seo;
  const keyword = seo?.primaryKeyword ?? "";
  const h1 = field("hero", "h1");
  const guide = pageTypeFor(path) === "guide";

  // Meta tags
  const title = seo?.metaTitle || content.title;
  add({
    id: "meta-title",
    label: "Meta title 30–60 characters",
    status: title.length >= 30 && title.length <= 60 ? "pass" : title.length > 70 || title.length < 15 ? "fail" : "warn",
    detail: `${title.length} characters`,
  });
  const description = seo?.metaDescription || content.description;
  add({
    id: "meta-description",
    label: "Meta description 120–160 characters",
    status: description.length >= 120 && description.length <= 160 ? "pass" : description.length < 70 || description.length > 200 ? "fail" : "warn",
    detail: `${description.length} characters`,
  });

  // Keyword placement
  if (keyword) {
    add({ id: "kw-title", label: "Primary keyword in meta title", status: containsKeyword(title, keyword) ? "pass" : "warn", detail: keyword });
    add({ id: "kw-h1", label: "Primary keyword in H1", status: containsKeyword(h1, keyword) ? "pass" : "warn", detail: keyword });
    const opening = [field("hero", "subheadline"), ...sections.filter((s) => s.id !== "hero").slice(0, 1).flatMap((s) => Object.values(s.fields))]
      .join(" ")
      .split(/\s+/)
      .slice(0, 120)
      .join(" ");
    add({ id: "kw-opening", label: "Primary keyword in the first 100 words", status: containsKeyword(opening, keyword) ? "pass" : "warn" });
  } else add({ id: "kw-brief", label: "Page has a keyword brief", status: "warn", detail: "Generate the page to create one" });

  if (!h1.trim()) add({ id: "h1", label: "Page has an H1", status: "fail" });

  // Banned phrases
  const lower = all.map((f) => plain(f.value).toLowerCase()).join(" \n ");
  const found = bannedPhrases.filter((p) => lower.includes(p.toLowerCase()));
  add({
    id: "banned-phrases",
    label: "No generic AI phrasing",
    status: found.length === 0 ? "pass" : found.length > 2 ? "fail" : "warn",
    detail: found.length ? found.slice(0, 6).join(", ") : undefined,
  });

  // Lengths
  const short: string[] = [];
  const long: string[] = [];
  for (const f of all) {
    if (!f.value.trim()) continue;
    const target =
      guide && f.key === "body_paragraph" && /^editorial-/.test(f.section)
        ? { ...guideBodyTarget, label: "guide section" }
        : lengthTargets.find((t) => t.pattern.test(f.key));
    if (!target) continue;
    const n = words(f.value);
    if (n < target.min * 0.75) short.push(`${f.section}.${f.key} (${n})`);
    if (n > target.max * 1.4) long.push(`${f.section}.${f.key} (${n})`);
  }
  add({ id: "length-short", label: "Copy meets minimum depth", status: short.length === 0 ? "pass" : short.length > 4 ? "fail" : "warn", detail: short.slice(0, 6).join(", ") || undefined });
  add({ id: "length-long", label: "Copy stays concise", status: long.length === 0 ? "pass" : "warn", detail: long.slice(0, 6).join(", ") || undefined });

  // AEO: direct answers and FAQ
  const answerBlocks = sections.filter((s) => /overview|editorial|mission/.test(s.id) && s.fields.body_paragraph);
  const indirect = answerBlocks.filter((s) => {
    const first = s.fields.body_paragraph.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? s.fields.body_paragraph.split(/\n\n/)[0];
    const n = words(first);
    return n < 20 || n > 80;
  });
  if (answerBlocks.length)
    add({ id: "direct-answer", label: "Sections open with a 40–60 word direct answer", status: indirect.length ? "warn" : "pass", detail: indirect.map((s) => s.id).join(", ") || undefined });
  const faqs = all.filter((f) => /^(?:q\d+|cat_\d+_q\d+)$/.test(f.key) && f.value.trim());
  add({ id: "faq", label: "At least 5 FAQs", status: faqs.length >= 5 ? "pass" : faqs.length >= 3 ? "warn" : "fail", detail: `${faqs.length} questions` });

  // Internal links
  const links = new Set<string>();
  for (const f of all) {
    if (/(?:url|path|href)$/.test(f.key) && f.value.startsWith("/") && f.value !== "/contact") links.add(f.value);
    for (const m of f.value.matchAll(/href="(\/[^"#?]*)"/g)) links.add(m[1]);
  }
  add({ id: "internal-links", label: "2+ internal links to related pages", status: links.size >= 2 ? "pass" : "warn", detail: `${links.size} links` });

  // Images
  const assets = sections.filter((s) => s.asset);
  add({
    id: "images",
    label: "Images have descriptive alt text",
    status: assets.length === 0 ? "warn" : assets.every((s) => s.asset!.alt.length >= 15 && !/^conceptual illustration for/i.test(s.asset!.alt)) ? "pass" : "warn",
    detail: assets.length ? `${assets.length} images` : "No images yet",
  });

  // Trust: figures that look like claims need approved evidence.
  const claims = all
    .filter((f) => !/(?:url|icon|items|name)$/.test(f.key))
    .filter((f) => /\b\d+(?:\.\d+)?\s?(?:%|x\b|\+|k\b|years?\b|clients?\b|projects?\b|developers?\b)|\$\s?\d/i.test(plain(f.value)))
    .filter((f) => !sections.find((s) => s.id === f.section)?.evidenceIds.length);
  add({
    id: "unsupported-figures",
    label: "No unsupported figures or claims",
    status: claims.length === 0 ? "pass" : "fail",
    detail: claims.slice(0, 5).map((c) => `${c.section}.${c.key}`).join(", ") || undefined,
  });

  if (content.unresolved.length)
    add({ id: "unresolved", label: "No unresolved generation issues", status: "fail", detail: content.unresolved.join("; ") });

  const weight = { pass: 1, warn: 0.5, fail: 0 } as const;
  const score = Math.round((checks.reduce((n, c) => n + weight[c.status], 0) / checks.length) * 100);
  return { score, checks, version: 1 };
}

/** Failing checks block publishing unless the owner records a reason. */
export function blockingChecks(report: QAReport) {
  return report.checks.filter((c) => c.status === "fail");
}
