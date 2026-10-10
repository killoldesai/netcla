/** Keyword file names for images, derived from the alt text (no model call needed). */

const PREFIX = /^(?:(?:conceptual|flat|isometric|simple|clean|abstract)\s+)?(?:illustration|diagram|image|graphic|visual|infographic|picture|artwork|mockup)?\s*(?:showing|of|for|depicting|illustrating)?\s*/i;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const STOP = new Set(["a", "an", "and", "the", "of", "for", "to", "in", "with", "from", "on", "at", "by", "or"]);

/** Shortens a slug at a word boundary, dropping stop words left at the end. */
function capSlug(slug: string, max: number) {
  let out = slug;
  if (slug.length > max) {
    const cut = slug.slice(0, max + 1);
    out = cut.slice(0, cut.lastIndexOf("-")) || slug.slice(0, max);
  }
  const words = out.split("-");
  while (words.length > 1 && STOP.has(words[words.length - 1])) words.pop();
  return words.join("-");
}

/**
 * "Conceptual illustration for Mobile App Development Services | Netofficials"
 *   → "mobile-app-development-services-netofficials"
 */
export function keywordName(alt: string, topic = "", maxLength = 60) {
  let core = alt.split(/\s+[|—–]\s+|\s+-\s+|,\s+/)[0].trim();
  for (let i = 0; i < 3; i++) core = core.replace(PREFIX, "").trim();
  let descriptor = slugify(core);
  // The page's topic leads the name so search engines see the service first.
  const keyword = slugify(topic);
  if (keyword && !descriptor.includes(keyword)) descriptor = keyword + (descriptor ? "-" + descriptor : "");
  const brand = /netofficials/i.test(alt) || keyword ? "netofficials" : "";
  const base = capSlug(descriptor, brand ? maxLength - brand.length - 1 : maxLength);
  return brand && base ? `${base}-${brand}` : base || "netofficials-illustration";
}

/** Keeps names unique across the library: a repeat gets its section id appended. */
export function uniqueName(name: string, sectionId: string, taken: Set<string>) {
  if (!taken.has(name)) return name;
  const suffix = `-${slugify(sectionId)}`;
  return capSlug(name, 60 - suffix.length) + suffix;
}
