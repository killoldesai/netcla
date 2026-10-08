import { z } from "zod";
import type { PageSpecification } from "../page-spec-schema";
import type { PageBrief } from "./page-brief";
import { imageRatio } from "./templates";

export const imageStyle = [
  "Flat vector editorial illustration on a plain white (#ffffff) background.",
  "Palette limited to indigo #4353b3, deep ink #0f1420, light grey #e2e5ea and a small accent of lime #b5ce20.",
  "Clean 2px line work, simple geometric shapes, generous empty space, consistent with a professional software company website.",
  "Strictly no gradients, glows, shadows, 3D rendering, photography, human faces, readable text, letters, numbers, logos or brand marks.",
].join(" ");

export const artDirectorSystemPrompt = [
  "You are the art director for Netofficials, a B2B software development company.",
  "You turn finished page copy into one precise brief for a flat conceptual illustration, plus the image's SEO metadata.",
  "The illustration must depict the specific concept the copy explains (its systems, workflow, components or outcome), not a generic laptop or office scene.",
  "Never ask for text, labels, letters, numbers, logos, brand marks, people's faces or photographs in the image: describe shapes, icons, diagrams and relationships instead.",
  "Output exactly one JSON object. No markdown.",
].join("\n");

/** Art director output: what to draw and how to describe it for search. */
export const artDirectionSchema = z.object({
  subject: z.string().trim().min(20).transform((v) => v.slice(0, 900)),
  alt: z.string().trim().min(10).transform((v) => v.replace(/\s+/g, " ").slice(0, 125)),
  filename: z.string().trim().min(3),
  caption: z.string().trim().default("").transform((v) => v.slice(0, 200)),
});
export type ArtDirection = z.infer<typeof artDirectionSchema>;

/** Lowercase, hyphenated, keyword-first file name (no extension). */
export function seoFilename(value: string, keyword = "") {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  let name = slug(value);
  const key = slug(keyword);
  if (key && !name.startsWith(key)) name = `${key}-${name}`;
  return name.split("-").filter(Boolean).slice(0, 10).join("-").slice(0, 80) || "netofficials-illustration";
}

const plain = (v: string) => v.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Prompt for the art director, built from the section copy that was just written. */
export function buildArtDirectionPrompt(input: {
  spec: PageSpecification;
  sectionId: string;
  brief?: PageBrief;
  fields: Record<string, string>;
  pageFields?: Record<string, string>;
  instruction?: string;
}) {
  const { spec, sectionId, brief, fields } = input;
  const copy = Object.entries(fields)
    .filter(([k, v]) => v && !/(?:url|icon|label)$/.test(k))
    .map(([k, v]) => `${k}: ${plain(v)}`)
    .join("\n")
    .slice(0, 2500);
  return JSON.stringify({
    task: `Write the illustration brief for the "${sectionId}" section of ${spec.path}.`,
    page: { title: brief?.metaTitle || spec.title, primaryKeyword: brief?.primaryKeyword, entities: brief?.entities?.slice(0, 10) },
    sectionCopy: copy,
    pageSummary: input.pageFields ? plain(Object.values(input.pageFields).join(" ")).slice(0, 800) : undefined,
    aspectRatio: imageRatio(spec, sectionId),
    ownerInstruction: input.instruction || undefined,
    requirements: [
      "subject: 60-140 words describing exactly what to draw: the main visual metaphor for this section's message, the key elements and how they connect, and the composition for the aspect ratio. Use concrete visual nouns (devices, screens with abstract blocks, nodes, pipelines, stacked layers, arrows).",
      "alt: a factual description of the illustration for screen readers and image search, 80-125 characters, naturally including the primary keyword. Do not start with 'Image of' or 'Illustration of'.",
      "filename: 3-8 lowercase words for the file name, starting with the primary keyword, describing the picture (for example 'flutter-app-development-single-codebase-architecture').",
      "caption: one sentence (max 160 characters) that could sit under the image, stating what it shows.",
    ],
    styleTheIllustratorWillApply: imageStyle,
    schema: { subject: "string", alt: "string", filename: "string", caption: "string" },
  });
}

/** Final image-model prompt. Falls back to the brief or the spec when no art direction exists. */
export function buildImagePrompt(spec: PageSpecification, sectionId: string, brief?: PageBrief, direction?: ArtDirection) {
  const planned = brief?.images.find((i) => i.sectionId === sectionId);
  const legacy = spec.sections
    .find((s) => s.id === sectionId)
    ?.imagePrompt.replace(/#[0-9a-f]{3,8}\b|lavender|light purple|purple|gradient\w*|\b\d{1,2}:\d{1,2}\b|aspect ratio[^.]*\./gi, "")
    .trim();
  const subject =
    direction?.subject ||
    planned?.subject ||
    legacy ||
    `A conceptual illustration of ${spec.title.replace(/\s*[|–-].*$/, "")}, showing the systems and workflow involved.`;
  const ratio = imageRatio(spec, sectionId);
  return {
    prompt: `${subject}\n\nStyle: ${imageStyle}\nComposition for a ${ratio} frame.`,
    ratio,
    alt: (direction?.alt || planned?.alt || `Illustration: ${subject}`).replace(/\s+/g, " ").slice(0, 125),
    name: seoFilename(direction?.filename || planned?.alt || spec.title, brief?.primaryKeyword ?? ""),
    caption: direction?.caption ?? "",
  };
}
