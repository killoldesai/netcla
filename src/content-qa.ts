import type { Content } from "./content";
import { bannedPhrases } from "./prompts/system";
import { hasDash } from "./prompts/punctuation";
import { familyOf, guideBodyTarget, lengthTargets, pageBand, pageTypeFor, requiresFaq, wordBands } from "./prompts/templates";
import { pageGraph } from "./structured-data";

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

/** "Service A, Service B, Service C" (optional " | Netofficials" suffix): two or more keyword parts joined by ", ". */
const isCommaKeywordTitle = (value: string) => {
  const core = value.replace(/\s*\|\s*Netofficials\s*$/i, "").trim();
  const parts = core.split(",").map((p) => p.trim()).filter(Boolean);
  return core.includes(", ") && parts.length >= 2;
};

/**
 * Figures that read as claims: percentages, multipliers, years of experience, "500+", prices, and counts of
 * people or work. A single digit next to a capitalised product name is a version, not a count.
 */
export const unsupportedFigure = new RegExp(
  [
    String.raw`(?<![\d.])\d+(?:\.\d+)?\s?(?:%|[xXkK]\b|[Yy]ears?\b)`,
    String.raw`(?<![\w.])\d+\s?\+`,
    String.raw`\$\s?\d`,
    String.raw`(?<![\d.])\d{2,}\s?(?:[Cc]lients?|[Pp]rojects?|[Dd]evelopers?)\b`,
    String.raw`(?<![A-Z][\w.+#-]*\s)(?<![\d.])\d\s?(?:[Cc]lients|[Pp]rojects|[Dd]evelopers)\b`,
  ].join("|"),
);

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
  const family = familyOf(path);
  // Commercial families share the new skeleton; guides get only the length band.
  const commercial = family !== "other" && family !== "guide";
  // The About page has its own band and structured data but is not a commercial skeleton page.
  const contact = path === "/contact";
  const profile = !!pageBand(path); // pages with their own band, summary and structured data (About, Contact, Engagement Models)

  // Meta tags
  const title = seo?.metaTitle || content.title;
  add({
    id: "meta-title",
    label: "Meta title 30–60 characters",
    status: title.length >= 30 && title.length <= 60 ? "pass" : title.length > 70 || title.length < 15 ? "fail" : "warn",
    detail: `${title.length} characters`,
  });
  if (commercial)
    add({
      id: "meta-title-keywords",
      label: "Meta title is a comma-separated keyword list",
      status: isCommaKeywordTitle(title) && title.length <= 60 ? "pass" : "warn",
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

  // Em and en dashes read as machine-written; the writer is told not to use them and a cleaner removes them.
  const dashed = all.filter((f) => hasDash(f.value)).map((f) => `${f.section}.${f.key}`);
  add({ id: "dashes", label: "No em or en dashes in copy", status: dashed.length ? "warn" : "pass", detail: dashed.slice(0, 6).join(", ") || undefined });

  // Lengths
  const short: string[] = [];
  const long: string[] = [];
  for (const f of all) {
    if (!f.value.trim()) continue;
    const target =
      guide && f.key === "body_paragraph" && /^editorial-/.test(f.section)
        ? { ...guideBodyTarget, label: "guide section" }
        : f.section === "working-model" && f.key === "body_paragraph"
          ? { min: 80, max: 120, label: "working model" }
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
  const [directMin, directMax] = commercial ? [40, 60] : [20, 80];
  const indirect = answerBlocks.filter((s) => {
    const first = s.fields.body_paragraph.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? s.fields.body_paragraph.split(/\n\n/)[0];
    const n = words(first);
    return n < directMin || n > directMax;
  });
  if (answerBlocks.length)
    add({
      id: "direct-answer",
      label: commercial ? "Sections open with a 40–60 word direct answer" : "Sections open with a direct answer",
      status: indirect.length ? "warn" : "pass",
      detail: indirect.map((s) => s.id).join(", ") || undefined,
    });
  const faqs = all.filter((f) => /^(?:q\d+|cat_\d+_q\d+)$/.test(f.key) && f.value.trim());
  if (requiresFaq(path)) {
    // The family standard is 8; fewer than 3 still blocks, as it did before the new skeleton.
    const pass = commercial ? 8 : 5;
    const warnFloor = 3;
    add({
      id: "faq",
      label: commercial ? "At least 8 FAQs" : "At least 5 FAQs",
      status: faqs.length >= pass ? "pass" : faqs.length >= warnFloor ? "warn" : "fail",
      detail: `${faqs.length} questions`,
    });
  } else add({ id: "faq", label: "FAQs not required for this page type", status: "pass", detail: `${faqs.length} questions` });

  // Family skeleton: total copy against the band, plus the answer summary used by answer engines.
  if (commercial || guide || profile) {
    const total = all.reduce((n, f) => n + words(plain(f.value)), 0);
    const band = pageBand(path) ?? wordBands[family];
    const inBand = total >= band.min && total <= band.max;
    // Outside the band is a warning; only a page under half the minimum is treated as broken.
    add({
      id: "word-band",
      label: "Page length fits the family band",
      status: inBand ? "pass" : total < band.min * 0.5 ? "fail" : "warn",
      detail: `${total} words (target ${band.min}-${band.max})`,
    });
  }
  const summary = seo?.answerSummary?.trim() ?? "";
  if (summary || commercial || profile) {
    const n = summary ? words(summary) : 0;
    add({
      id: "answer-summary",
      label: "Answer summary is 40-60 words",
      // Drafts written before the summary existed are flagged, not blocked.
      status: n >= 40 && n <= 60 ? "pass" : "warn",
      detail: summary ? `${n} words` : "missing",
    });
  }

  // Structured data must describe what the page actually shows.
  if (commercial || profile) {
    let check: QACheck;
    try {
      const graph = (pageGraph({ path, content, site: "https://example.com" })["@graph"] ?? []) as Record<string, any>[];
      const main = graph.some((n) => ["Service", "Article", "WebPage", "AboutPage", "ContactPage", "CollectionPage"].includes(n["@type"]));
      const trail = graph.some((n) => n["@type"] === "BreadcrumbList");
      const faqNode = graph.find((n) => n["@type"] === "FAQPage");
      const pairs = sections.flatMap((s) =>
        Object.keys(s.fields).filter((k) => /^(?:q\d+|cat_\d+_q\d+)$/.test(k) && s.fields[k]?.trim() && s.fields[k.replace(/q(\d+)$/, "a$1")]?.trim()),
      ).length;
      const faqOk = pairs === 0 ? !faqNode : faqNode?.mainEntity?.length === pairs;
      const missing = [!main && "main entity", !trail && "BreadcrumbList", !faqOk && `FAQPage for ${pairs} questions`].filter(Boolean);
      check = missing.length
        ? { id: "jsonld", label: "Structured data matches the page", status: "warn", detail: `missing ${missing.join(", ")}` }
        : { id: "jsonld", label: "Structured data matches the page", status: "pass", detail: `${pairs} FAQ pairs` };
    } catch (error) {
      check = { id: "jsonld", label: "Structured data matches the page", status: "warn", detail: error instanceof Error ? error.message : String(error) };
    }
    add(check);
  }

  // Internal links
  const links = new Set<string>();
  for (const f of all) {
    if (/(?:url|path|href)$/.test(f.key) && f.value.startsWith("/") && f.value !== "/contact") links.add(f.value);
    for (const m of f.value.matchAll(/href="(\/[^"#?]*)"/g)) links.add(m[1]);
  }
  // The guides index links to every guide from the database, so its own fields need not carry links.
  add({ id: "internal-links", label: "2+ internal links to related pages", status: links.size >= 2 || path === "/blog" ? "pass" : "warn", detail: path === "/blog" ? "links come from the guide list" : `${links.size} links` });

  // Images
  const assets = sections.filter((s) => s.asset);
  add({
    id: "images",
    label: "Images have descriptive alt text",
    status: assets.length === 0 ? (contact || path === "/blog" ? "pass" : "warn") : assets.every((s) => s.asset!.alt.length >= 15 && !/^conceptual illustration for/i.test(s.asset!.alt)) ? "pass" : "warn",
    detail: assets.length ? `${assets.length} images` : "No images yet",
  });

  // Trust: figures that look like claims need approved evidence.
  const claims = all
    .filter((f) => !/(?:url|icon|items|name)$/.test(f.key))
    // "TLS 1.2+" or "OAuth 2.0" are versions, not claims: a figure must not be part of a decimal.
    // Product versions ("Magento 2 developer", "Vue 3 projects", "ES2015+") are not claims either.
    .filter((f) => unsupportedFigure.test(plain(f.value)))
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
