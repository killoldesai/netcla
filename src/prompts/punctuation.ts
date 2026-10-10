/**
 * Generated copy that leans on em dashes reads as machine-written. The writer prompt forbids them, and this
 * deterministic pass removes any that still get through: " — " and " – " become a comma, and a dash between
 * two digits becomes "to". HTML tags are left alone.
 */
const DASH = /[—–]/;

export function hasDash(value: string): boolean {
  return DASH.test(value.replace(/<[^>]+>/g, " "));
}

export function plainDashes(value: string): string {
  if (!DASH.test(value)) return value;
  return value
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) return part;
      return part
        .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2") // 3-6 months
        .replace(/\s*[—–]\s*/g, ", ") // a clause break
        .replace(/,\s*,/g, ",")
        .replace(/\s+,/g, ",")
        .replace(/,\s*([.!?:;])/g, "$1")
        .replace(/^,\s*/, "");
    })
    .join("");
}
