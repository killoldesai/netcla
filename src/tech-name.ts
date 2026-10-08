/** Normalise a technology name for lookup ("Next.js 14" -> "next.js"). */
export function normalizeTech(name: string) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\s+v?\d+(?:\.\d+)*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}
