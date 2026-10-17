import { z } from "zod";
import type { PageSpecification } from "../page-spec-schema";
import type { PageBrief } from "./page-brief";
import { imageRatio } from "./templates";

/**
 * House style for every generated page image. It matches the v2 site design: playful 3D clay objects and characters in
 * brand colours on a soft pastel or white backdrop. Stylised illustrated characters are allowed (roles, never real people);
 * photography and readable text are not.
 */
export const imageStyle = [
  "Stylised 3D clay illustration in a playful premium SaaS brand style: soft rounded shapes, smooth shading, gentle studio lighting, generous empty space.",
  "Colours: violet #5f5ff6, cobalt blue, hot pink, lime #b5ce20 and orange accents, with a plain white or soft pastel (lavender, sky blue, peach or pale lime) background.",
  "Any people are friendly illustrated 3D characters in colourful jackets or hoodies, shown as roles (developer, designer, engineer), never photorealistic faces or real individuals.",
  "Screens, boards and devices show only abstract coloured blocks and bars.",
  "Strictly no photography, no readable text, letters, numbers, logos or brand marks anywhere in the image, no dark or busy backgrounds.",
].join(" ");

export const artDirectorSystemPrompt = [
  "You are the art director for Netofficials, a B2B software development company.",
  "You turn finished page copy into one precise brief for a stylised 3D clay illustration (friendly illustrated characters and soft rounded objects on a pastel background), plus the image's SEO metadata.",
  "The illustration must depict the specific concept the copy explains (its systems, workflow, components or outcome) as a small scene: ALWAYS one friendly illustrated role character (a developer, designer or engineer in a colourful jacket or hoodie) interacting with chunky 3D clay objects such as a board of cards, devices, a pipeline or stacked layers. Not a generic laptop or office scene, and never a flat diagram.",
  "In the subject, never name colours, hex codes, line weights or art styles (no flat, vector, outline, minimal, indigo): the house style is applied separately.",
  "Never ask for text, labels, letters, numbers, logos, brand marks or photographs in the image: describe objects, abstract coloured blocks, icons, characters and their relationships instead. Characters are illustrated roles, never real people.",
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
      "subject: 60-140 words describing exactly what to draw: the main visual metaphor for this section's message, the key elements and how they connect, and the composition for the aspect ratio. Use concrete visual nouns (devices, screens with abstract coloured blocks, boards of cards, nodes, pipelines, stacked layers, arrows, an illustrated role character working with them).",
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
    prompt: `Style (mandatory, overrides any style wording in the scene): ${imageStyle}\n\nScene: ${subject}\n\nComposition for a ${ratio} frame.`,
    ratio,
    alt: (direction?.alt || planned?.alt || `Illustration: ${subject}`).replace(/\s+/g, " ").slice(0, 125),
    name: seoFilename(direction?.filename || planned?.alt || spec.title, brief?.primaryKeyword ?? ""),
    caption: direction?.caption ?? "",
  };
}
