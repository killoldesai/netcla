import sanitizeHtml from "sanitize-html";
import { Parser } from "htmlparser2";
import type { Content } from "./content";

const inlineTags = ["strong", "b", "em", "i", "u", "s", "code", "br"];
export function sanitizeRichHTML(
  html: string,
  inline = false,
  allowedPaths?: string[],
) {
  if (inline)
    html = html
      .replace(/<\/(?:p|h[1-6]|li|div)>/gi, "<br>")
      .replace(/(?:<br\s*\/?\s*>\s*)+$/i, "");
  return sanitizeHtml(html, {
    allowedTags: inline
      ? inlineTags
      : [
          ...inlineTags,
          "p",
          "h2",
          "h3",
          "h4",
          "ul",
          "ol",
          "li",
          "blockquote",
          "pre",
          "hr",
          "a",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
        ],
    allowedAttributes: {
      a: ["href", "title"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: allowedPaths
      ? {
          a: (tagName, attribs) => ({
            tagName,
            attribs:
              attribs.href?.startsWith("/") &&
              !allowedPaths.includes(attribs.href.split(/[?#]/)[0])
                ? {}
                : attribs,
          }),
        }
      : {},
  });
}
export function richPlainText(html: string): string {
  let text = "";
  const parser = new Parser(
    {
      ontext(value) {
        text += value;
      },
      onopentag(name) {
        if (name === "br") text += "\n";
      },
      onclosetag(name) {
        if (
          ["p", "h2", "h3", "h4", "li", "blockquote", "pre", "tr"].includes(
            name,
          )
        )
          text += "\n\n";
        else if (["td", "th"].includes(name)) text += "\t";
      },
    },
    { decodeEntities: true },
  );
  parser.write(html);
  parser.end();
  return text.replace(/\n{3,}/g, "\n\n").trim();
}
export function richParagraphs(text: string): string[] {
  if (!text) return [];
  const paragraphs: string[] = [];
  for (const block of text.split(/\n\n+/)) {
    const last = paragraphs.length - 1;
    if (last >= 0 && paragraphs[last].length + block.length + 2 <= 6000)
      paragraphs[last] += "\n\n" + block;
    else paragraphs.push(block);
  }
  return paragraphs;
}
export const sameText = (a: string, b: string) =>
  a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
export const escapeText = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const textHTML = (text: string) =>
  text
    .split(/\n\n+/)
    .map((p) => `<p>${escapeText(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

// Plain strings remain the source of truth for validation, generation and SEO.
export function richFields(content: Content): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, text] of Object.entries(content.texts))
    fields[`texts.${key}`] = text;
  if (content.hero)
    for (const key of ["heading", "body", "ctaLabel"] as const)
      fields[`hero.${key}`] = content.hero[key];
  for (const s of content.sections ?? []) {
    const prefix = `sections.${s.id}.`;
    fields[prefix + "heading"] = s.heading;
    fields[prefix + "paragraphs"] = s.paragraphs.join("\n\n");
    s.items.forEach((v, i) => (fields[prefix + `items.${i}`] = v));
    for (const key of ["cards", "faqs", "links"] as const)
      s[key].forEach((item, i) => {
        for (const [field, value] of Object.entries(item))
          if (field !== "path") fields[prefix + `${key}.${i}.${field}`] = value;
      });
    s.table.columns.forEach(
      (v, i) => (fields[prefix + `table.columns.${i}`] = v),
    );
    s.table.rows.forEach((row, i) =>
      row.forEach((v, j) => (fields[prefix + `table.rows.${i}.${j}`] = v)),
    );
  }
  return fields;
}
export function richHTML(
  content: Pick<Content, "richText">,
  key: string,
  text: string,
  inline = false,
): string | undefined {
  const entry = content.richText?.[key];
  if (!entry || entry.text !== text) return undefined;
  const html = sanitizeRichHTML(entry.html, inline);
  return sameText(richPlainText(html), text) ? html : undefined;
}
export function normalizeRichContent(content: Content): Content {
  if (!content.richText) return content;
  const fields = richFields(content);
  return {
    ...content,
    richText: Object.fromEntries(
      Object.entries(content.richText).flatMap(([key, entry]) => {
        if (fields[key] !== entry.text) return [];
        const html = sanitizeRichHTML(entry.html);
        return sameText(richPlainText(html), entry.text)
          ? [[key, { text: entry.text, html }]]
          : [];
      }),
    ),
  };
}
