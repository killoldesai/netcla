import { lengthTargets } from "./templates";

// Models overshoot word limits even when told the exact number. Instead of accepting a page that
// is 30% over its band, an over-long field is sent back once with its limit and asked to shorten.

const plain = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
export const wordCount = (value: string) => (plain(value).match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

/** A field is over limit once it passes its target maximum by this much. */
const TOLERANCE = 1.12;

export type OverLimit = { key: string; words: number; max: number; label: string };

/** Fields whose limit differs from the general rule for their name (the same field name appears in several sections). */
const sectionMax: Record<string, Record<string, number>> = {
  "why-netofficials": { body_paragraph: 110 },
  "company-story": { body_paragraph: 260 },
  "working-model": { body_paragraph: 120 },
};

export function overLimitFields(fields: Record<string, string>, sectionId = ""): OverLimit[] {
  const out: OverLimit[] = [];
  for (const [key, value] of Object.entries(fields)) {
    const target = lengthTargets.find((t) => t.pattern.test(key));
    if (!target || !value) continue;
    const max = sectionMax[sectionId]?.[key] ?? target.max;
    const words = wordCount(value);
    if (words > max * TOLERANCE) out.push({ key, words, max, label: target.label });
  }
  return out;
}

export function buildRepairPrompt(sectionId: string, fields: Record<string, string>, over: OverLimit[]) {
  return JSON.stringify({
    task: `Some fields in the "${sectionId}" section are over their word limit. Shorten ONLY the fields listed so each is at or under its maximum. Keep every fact, entity name, internal link and the same HTML structure (for HTML fields keep the <p> blocks, drop the least important detail). Do not add new claims. Return one JSON object containing exactly these keys.`,
    fields: Object.fromEntries(over.map((o) => [o.key, fields[o.key]])),
    limits: Object.fromEntries(over.map((o) => [o.key, { currentWords: o.words, maxWords: o.max, kind: o.label }])),
  });
}

/** Merge shortened values in, keeping the original wherever the retry did not actually get shorter. */
export function mergeRepair(fields: Record<string, string>, repaired: Record<string, unknown>, over: OverLimit[]) {
  const next = { ...fields };
  const fixed: string[] = [];
  for (const o of over) {
    const value = repaired[o.key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (wordCount(value) < o.words) {
      next[o.key] = value.trim();
      fixed.push(o.key);
    }
  }
  return { fields: next, fixed };
}
