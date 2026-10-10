import { plainDashes } from "./punctuation";
import { z } from "zod";
import { iconKeys, internalPath, type SectionSpecification } from "../page-spec-schema";
import { sanitizeRichHTML } from "../rich-text";
import { htmlFieldPattern } from "./system";

const iconAliases: Record<string, string> = {
  "web-api": "api-plug",
  api: "api-plug",
  "api-integration": "api-plug",
};

/**
 * Normalise a generated section. Recoverable problems (a missing key, an
 * unknown link or icon, markup in a plain field) are repaired and reported as
 * notes instead of failing the whole section; unsafe content is removed.
 */
export function cleanSectionFields(
  spec: SectionSpecification,
  input: unknown,
  paths: string[],
): { fields: Record<string, string>; notes: string[] } {
  const raw = z.record(z.unknown()).parse(input);
  const notes: string[] = [];
  const fields: Record<string, string> = {};
  const extra = Object.keys(raw).filter((k) => !spec.fields.includes(k));
  if (extra.length) notes.push(`${spec.id}: ignored unexpected fields ${extra.join(", ")}`);
  for (const key of spec.fields) {
    let value = raw[key] == null ? "" : String(raw[key]).slice(0, 12000).trim();
    if (!(key in raw)) notes.push(`${spec.id}: model omitted ${key}`);
    if (htmlFieldPattern.test(key)) {
      if (/<[a-z]/i.test(value)) {
        const clean = sanitizeRichHTML(value, false, paths);
        if (clean.replace(/\s/g, "") !== value.replace(/\s/g, "")) notes.push(`${spec.id}.${key}: removed unsupported markup or links`);
        value = clean;
      } else if (value) {
        // Plain paragraphs become <p> blocks so the editor and renderer treat them alike.
        value = value
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
          .join("");
      }
    } else if (/<\/?[a-z][^>]*>/i.test(value)) {
      value = value.replace(/<[^>]+>/g, "").trim();
      notes.push(`${spec.id}.${key}: removed markup from a plain-text field`);
    }
    value = plainDashes(value);
    if (/javascript:|data:/i.test(value)) {
      value = "";
      notes.push(`${spec.id}.${key}: removed unsafe content`);
    }
    if (/(?:icon_key|_icon)$/.test(key) && value) {
      value = iconAliases[value.toLowerCase()] ?? value;
      if (!(iconKeys as readonly string[]).includes(value)) {
        notes.push(`${spec.id}.${key}: unknown icon "${value}" cleared`);
        value = "";
      }
    }
    if (/(?:url|path|href)$/.test(key) && value) {
      const path = value.split(/[?#]/)[0];
      if (!internalPath.safeParse(path).success || !paths.includes(path)) {
        notes.push(`${spec.id}.${key}: link to unknown page "${value}" removed`);
        value = "";
      }
    }
    fields[key] = value;
  }
  return { fields, notes };
}

/** Parse a JSON object out of a model reply that may be wrapped in a code fence. */
/** Balanced top-level {...} blocks in a reply, so commentary or a second draft around the JSON cannot break parsing. */
export function jsonObjects(text: string): string[] {
  const found: string[] = [];
  let depth = 0, start = -1, inString = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") {
      if (depth++ === 0) start = i;
    } else if (ch === "}" && depth > 0 && --depth === 0) found.push(text.slice(start, i + 1));
  }
  return found;
}

export function parseModelJSON(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const body = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  // Common model slip: unescaped double quotes in HTML attributes inside strings.
  const repaired = body.replace(/(<[a-z][a-z0-9]*\b[^<>]*?\s[a-z-]+=)"([^"\<>]*)"/gi, "$1'$2'");
  // When the reply holds several objects (a draft, then a corrected one) the last complete one wins.
  const blocks = jsonObjects(trimmed).reverse();
  for (const candidate of [trimmed, body, repaired, ...blocks]) {
    try {
      return JSON.parse(candidate);
    } catch {}
  }
  throw new Error("Model did not return valid JSON");
}
