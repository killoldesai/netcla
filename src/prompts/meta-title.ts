/**
 * Keyword-style meta titles: "Primary Keyword, Secondary, Secondary | Netofficials".
 * Deterministic, so the model's title is repaired the same way every time.
 */

const MAX_TITLE = 60;
const MIN_KEYWORD_TITLE = 30;
const SMALL_WORDS = new Set(["a", "an", "and", "or", "the", "for", "of", "in", "to", "with", "on"]);

// Words that say nothing on their own once the primary keyword has been removed.
const GENERIC = new Set([
  "js", "dedicated", "services", "service", "company", "companies", "developer", "developers",
  "hire", "best", "top", "india", "custom", "solutions", "solution", "development", "agency", "team",
  "expert", "experts", "freelance", "offshore", "outsourcing", "cost", "pricing", "near", "me", "remote", "hourly", "affordable", "cheap", "senior", "junior", "sdk",
  "software", "computing", "managed", "business", "website", "websites", "from", "platform", "professional", "corporate", "enterprise", "build", "scratch", "application", "applications", "bespoke",
]);

const KEEP_TERMS = [
  "AI", "ML", "API", "APIs", "SaaS", "MVP", "CRM", "ERP", "iOS", "iPad", "iPhone", "IoT",
  "AWS", "GCP", "SEO", "PPC", "UI", "UX", "QA", "CI/CD", ".NET", "DevOps", "GraphQL",
  "MongoDB", "PostgreSQL", "TypeScript", "JavaScript", "Node.js", "Next.js", "React",
  "React Native", "Vue.js", "WordPress", "WooCommerce", "LLM", "LLMs", "RAG", "HIPAA", "FinTech",
  "PHP", "UK", "USA", "UAE", "HR", "IT", "LMS", "B2B", "B2C", "POC", "NLP", "GA4", "HRMS", "HRIS", "MES",
  "EdTech", "InsurTech", "LegalTech", "HRTech", "GenAI", "CI", "CD", "ASP.NET", "SQL", "REST", "GDPR", "KMM", "SPA", "AR", "VR", "MLOps", "Pulumi",
];
// Single-word lookup. Multi-word entries such as "React Native" match word by word.
const KEEP = new Map(KEEP_TERMS.map((t) => [t.toLowerCase(), t]));

function words(phrase: string): string[] {
  return phrase.trim().split(/\s+/).filter(Boolean);
}

/** Lowercase, and drop a trailing 's' so "services" and "service" compare equal. */
function norm(word: string): string {
  const w = word.toLowerCase();
  return w.length > 2 && w.endsWith("s") ? w.slice(0, -1) : w;
}

function titleCasePhrase(phrase: string): string {
  return words(phrase)
    .map((word, i) => {
      // Tokens with an internal capital (iOS, AI, APIs, SaaS) are already intentional.
      if (/[A-Z]/.test(word.slice(1))) return word;
      const lower = word.toLowerCase();
      const known = KEEP.get(lower);
      if (known) return known;
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** Cut to at most `max` characters at the last word boundary. */
function cutAtWordBoundary(text: string, max: number): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);
  const idx = window.lastIndexOf(" ");
  const cut = idx > 0 ? text.slice(0, idx) : text.slice(0, max);
  return cut.replace(/[\s,|]+$/, "");
}

type Candidate = { text: string; tokens: string[]; multi: boolean };

/**
 * Supporting keywords come from two places and are ranked before use:
 * - secondary keywords, with words already in the primary and generic filler removed
 *   ("machine learning development services" -> "machine learning");
 * - `extras` (the brief's entities), used whole or not at all, because trimming an
 *   entity breaks it ("Amazon Web Services" must never become "Amazon Web").
 * Candidates keep the model's relevance order, so two short keywords can beat one long phrase.
 */
function candidates(primary: string[], secondary: string[], extras: string[]): Candidate[] {
  const base = new Set(primary.map(norm));
  const out: Candidate[] = [];
  const make = (tokens: string[]) => ({ text: titleCasePhrase(tokens.join(" ")), tokens: tokens.map(norm), multi: tokens.length >= 2 });
  const useful = (w: string) => w.length >= 2 && !GENERIC.has(w.toLowerCase()) && !SMALL_WORDS.has(w.toLowerCase());
  for (const sec of secondary) {
    const tokens = words(sec).filter((w) => !base.has(norm(w)) && useful(w));
    if (tokens.length) out.push(make(tokens));
  }
  for (const entity of extras) {
    const tokens = words(entity);
    if (!tokens.length || tokens.some((w) => base.has(norm(w))) || !tokens.some(useful)) continue;
    out.push(make(tokens));
  }
  return out;
}

export function composeMetaTitle(primary: string, secondary: string[], brand = "Netofficials", extras: string[] = []): string {
  const suffix = brand ? ` | ${brand}` : "";
  const keywords = [cutAtWordBoundary(titleCasePhrase(primary), MAX_TITLE)];
  const seen = new Set(words(primary).map(norm));

  for (const c of candidates(words(primary), secondary, extras)) {
    if (keywords.length >= 3) break;
    if (c.tokens.every((t) => seen.has(t))) continue;
    // Too long: try the next keyword instead of stopping, a shorter one may still fit.
    if ([...keywords, c.text].join(", ").length + suffix.length > MAX_TITLE) continue;
    keywords.push(c.text);
    c.tokens.forEach((t) => seen.add(t));
  }

  const body = keywords.join(", ").replace(/[\s,|]+$/, "");
  const withBrand = body + suffix;
  return suffix && withBrand.length <= MAX_TITLE ? withBrand : body;
}

// Fragments that read as filler or as a cut-off phrase once they stand alone in a title.
const WEAK_PART = new Set([
  "web", "new", "end-to-end", "model", "container", "wal", "augmented", "businesses", "clients", "online",
  "engineer", "programmer", "consultant", "management", "app", "frontend", "front end", "tech", "system", "pipeline",
]);
const DANGLING = new Set(["as", "a", "an", "and", "or", "of", "for", "to", "with", "in", "on", "by"]);

/** Same word with dots and spaces removed, so "Nodejs" matches "Node.js". */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Cleans a title the model wrote: restores acronym casing (Php -> PHP, Ai/ml -> AI/ML) and
 * drops supporting keywords that are cut-off or repeat the primary (", As", ", Nodejs").
 * Keeps at least two parts, so a keyword-list title never collapses to a bare phrase.
 */
export function tidyMetaTitle(title: string, brand = "Netofficials"): string {
  const suffix = brand ? ` | ${brand}` : "";
  const body = title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
  const recase = (part: string) => part.split("/").map((seg) => titleCasePhrase(seg.replace(/\b([A-Za-z]{2,})\b/g, (m) => (KEEP.has(m.toLowerCase()) ? KEEP.get(m.toLowerCase())! : m)))).join("/");
  const parts = body.split(", ").map((p) => p.trim()).filter(Boolean).map(recase);
  const [primary, ...rest] = parts;
  const primaryKey = squash(primary ?? "");
  const kept = rest.filter((p) => {
    const w = words(p);
    const last = w[w.length - 1]?.toLowerCase() ?? "";
    if (DANGLING.has(last) || WEAK_PART.has(p.toLowerCase())) return false;
    return squash(p).length < 4 || !primaryKey.includes(squash(p));
  });
  const next = [primary, ...(kept.length ? kept : rest.slice(0, 1))].filter(Boolean).join(", ");
  return suffix && (next + suffix).length <= MAX_TITLE ? next + suffix : next;
}

/** True when the title is a comma-separated keyword list of 30 to 60 characters. */
export function isKeywordTitle(title: string): boolean {
  const t = title.trim();
  if (t.length < MIN_KEYWORD_TITLE || t.length > MAX_TITLE) return false;
  const body = t.endsWith(" | Netofficials") ? t.slice(0, -" | Netofficials".length) : t;
  if (!body.includes(", ")) return false;
  const parts = body.split(", ").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2;
}
