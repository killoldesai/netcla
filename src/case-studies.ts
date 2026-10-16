import { z } from "zod";
import { query } from "./db";
import { generate, parseOutput, providerSchema } from "./providers";
import { generateHero } from "./production-assets";
import { imageStyle, seoFilename } from "./prompts/images";
import { composeMetaTitle, tidyMetaTitle } from "./prompts/meta-title";
import { plainDashes } from "./prompts/punctuation";
import { industries as industryList } from "./service-directory-data";
import { serviceCatalog } from "./case-study-catalog";

/** The vocabulary the owner can pick from, taken from the site's own service and industry directory. */
export const serviceOptions = serviceCatalog.map((s) => s.name);
export const industryOptions = industryList.map((i) => i.name);
export const locationOptions = [
  "Dubai, UAE", "Abu Dhabi, UAE", "Riyadh, Saudi Arabia", "Doha, Qatar", "Mumbai, India", "Singapore",
  "London, UK", "Berlin, Germany", "Amsterdam, Netherlands", "New York, USA", "Austin, USA", "Toronto, Canada",
  "Sydney, Australia", "Nairobi, Kenya", "Lagos, Nigeria", "Johannesburg, South Africa",
];
const currencies: Record<string, string> = {
  UAE: "AED", "Saudi Arabia": "SAR", Qatar: "QAR", India: "INR", Singapore: "SGD", UK: "GBP", Germany: "EUR", Netherlands: "EUR",
  USA: "USD", Canada: "CAD", Australia: "AUD", Kenya: "KES", Nigeria: "NGN", "South Africa": "ZAR",
};
export const currencyFor = (location: string) => currencies[location.split(",").pop()?.trim() ?? location.trim()] ?? "USD";
const pickFrom = (values: string[] | undefined, allowed: string[]) => (values ?? []).filter((v) => allowed.includes(v));

export const ratios = ["16:9", "4:3", "1:1", "3:2"] as const;

// Model output is trimmed to the limits rather than rejected, so one long sentence never fails a whole run.
const text = (max: number) => z.string().default("").transform((v) => v.trim().slice(0, max));
const list = (max: number, item = 200) =>
  z.array(z.string()).default([]).transform((a) => a.map((s) => s.trim().slice(0, item)).filter(Boolean).slice(0, max));
const str = (min: number, max: number) => z.string().trim().min(min).transform((v) => v.slice(0, max));

/** The publishable body of a case study. Every field is optional until the owner supplies the facts. */
export const contentSchema = z.object({
  headline: text(140),
  summary: text(400),
  client: z.object({ name: text(120), industry: text(80), location: text(80), size: text(80) }).default({}),
  services: list(8, 80),
  timeline: text(120),
  challenge: text(2500),
  approach: text(3500),
  solution: text(3500),
  results: text(2500),
  outcomes: z
    .array(z.object({ metric: str(1, 80), value: str(1, 60), note: text(200) }))
    .default([])
    .transform((a) => a.slice(0, 6)),
  testimonial: z.object({ quote: text(500), attribution: text(120) }).default({}),
  techStack: list(16, 60),
  metaTitle: text(70),
  metaDescription: text(170),
  gaps: list(12, 240),
  disclosure: text(300),
  primaryKeyword: text(90),
  secondaryKeywords: list(6, 70),
});
export type CaseStudyContent = z.infer<typeof contentSchema>;
export const editableFields = ["headline", "summary", "challenge", "approach", "solution", "results", "metaTitle", "metaDescription"] as const;

const ideasSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: str(8,160),
        angle: str(20,500),
        why: text(400),
        services: list(3, 80),
        industry: text(80),
        location: text(80),
        evidenceNeeded: list(6, 160),
      }),
    )
    .min(1)
    .transform((a) => a.slice(0, 12)),
});

const imagePlanSchema = z.object({
  images: z
    .array(
      z.object({
        slot: str(2,40),
        purpose: text(200),
        prompt: str(40,1200),
        alt: str(10,125),
        ratio: z.enum(ratios).catch("16:9"),
        style: z.enum(["ui", "illustration"]).catch("ui"),
      }),
    )
    .min(1)
    .transform((a) => a.slice(0, 6)),
});

/** Realistic product-screen look for dashboards, admin panels and app screens. */
export const uiStyle = [
  "Photorealistic high-fidelity product UI screenshot rendered flat-on, as a real shipped SaaS web application, not an illustration.",
  "Clean modern interface that follows the product look given in the brief exactly: same palette, same sidebar, same top bar, same fonts, same chart and table styling on every screen.",
  "Believable layout: left sidebar navigation, top bar with search and avatar, KPI cards, line and bar charts, data tables with several rows, status chips, filters.",
  "Use short, legible English labels and plausible sample numbers. Keep text crisp and correctly spelled.",
  "No company, client, brand or product names anywhere in the image: the top bar shows only a plain grey logo placeholder and the page title, and labels are generic (Orders, Customers, Revenue, Inventory).",
  "Currency values use the client's local currency given in the brief. No device frames, no browser chrome, no people, no real brand logos, no watermarks.",
].join(" ");

/** The shared look of the case study's product. Generated once, then injected into every UI image prompt. */
export const designSchema = z.object({
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).catch("#4353b3"),
  nav: list(7, 40),
  styleGuide: text(1200),
  dataset: text(1200),
});
export type Design = z.infer<typeof designSchema>;

export async function ensureDesign(studyId: string, force = false): Promise<Design> {
  const s = await study(studyId);
  const current = designSchema.parse(s.design ?? {});
  if (!force && current.styleGuide && current.nav.length) return current;
  const c = contentSchema.parse(s.content);
  const location = c.client?.location || "";
  const design = await ask(
    designSchema,
    {
      task: "Define the single visual identity and sample data of the web app in this case study, so every screenshot of it looks like the same product.",
      title: s.title,
      services: c.services,
      industry: c.client?.industry || undefined,
      location: location || undefined,
      currency: location ? currencyFor(location) : undefined,
      summary: c.summary, solution: c.solution, outcomes: c.outcomes,
      requirements: [
        "accent: one hex colour like #1f6f5c that suits the industry. Avoid default bright blue unless it fits.",
        "nav: 4-6 left sidebar item labels in display order, matching what this product does (for example Overview, Shipments, Documents, Reports, Settings).",
        "styleGuide: 70-130 words fixing the look for ALL screens: sidebar width and colour, top bar contents (page title, search field, avatar, no names), page background and card colours, corner radius, font style, chart colours and style, table density, status chip colours.",
        "dataset: 70-130 words listing the SAME 5-8 entities (reference ids, customer or item names that are generic, no company names), the headline numbers every screen reuses (taken from outcomes where present) and the reporting period, in the local currency.",
        "No company, client, brand or product names anywhere.",
      ],
      schema: { accent: "#rrggbb", nav: ["string"], styleGuide: "string", dataset: "string" },
    },
    1800,
    0.4,
  );
  await query("UPDATE case_studies SET design=$2,updated_at=now() WHERE id=$1", [studyId, JSON.stringify(design)]);
  return design;
}

export async function saveDesign(studyId: string, input: unknown) {
  const design = designSchema.parse(input);
  await query("UPDATE case_studies SET design=$2,updated_at=now() WHERE id=$1", [studyId, JSON.stringify(design)]);
  return design;
}

const lookBlock = (d: Design) =>
  [
    "ALL screens in this set are the SAME product. Keep this look identical. If the screen description names different colours or navigation, ignore that and follow this look.",
    `Accent colour: ${d.accent}.`,
    `Always show the same left sidebar with these items in this order (highlight the item that matches the screen): ${d.nav.join(", ")}. Always show the same top bar.`,
    `Look: ${d.styleGuide}`,
    `Sample data to reuse: ${d.dataset}`,
  ].join("\n");

const scenarioSystem = [
  "You are building an ILLUSTRATIVE sample case study for Netofficials, a B2B software development company, for portfolio planning.",
  "The scenario is fictional and will be disclosed as illustrative. You may invent a plausible project, timeline, scope and sample metrics.",
  "The story is about one person or one organization in the location given in the brief who had an app built for their business, and how it helped them.",
  "Never name the client, the business, the app or any person. Describe them only by who they are and what they do, for example 'an independent restaurant owner in Dubai' or 'a facilities-management firm in London'. Titles and headlines must not contain a name either.",
  "Use the local currency given for money, and local context (taxes, regulation, payment habits) only where it is natural and accurate.",
  "Metrics must be modest and realistic for the work described. No dramatic percentages, no claims of awards, no named people, no quotes.",
  "Write plain, specific sentences. No em dashes, no slogans, no hype words, no rhetorical questions.",
  "Output exactly one JSON object and no markdown.",
].join("\n");

const system = [
  "You help Netofficials, a B2B software development company, build an honest case study portfolio.",
  "Never invent clients, names, numbers, percentages, dates, quotes or technologies. Use only facts the owner supplied.",
  "When a fact is missing, leave that field empty and add a short note to 'gaps' saying what the owner should supply.",
  "Write plain, specific sentences. No em dashes, no slogans, no hype words, no rhetorical questions, no filler openings.",
  "Output exactly one JSON object and no markdown.",
].join("\n");

async function defaults() {
  const [row] = await query("SELECT value FROM settings WHERE key='generation_defaults'");
  const d = (row?.value ?? {}) as Record<string, string>;
  const provider = providerSchema.safeParse(d.provider);
  if (!provider.success || !d.model) throw new Error("Choose a provider and model in Settings first");
  return { provider: provider.data, model: d.model, imageModel: d.imageModel, imageQuality: d.imageQuality ?? "medium" };
}

async function ask<T>(schema: z.ZodType<T, z.ZodTypeDef, any>, payload: unknown, maxTokens: number, temperature = 0.5, systemPrompt = system) {
  const d = await defaults();
  let problem = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await generate(d.provider, d.model, JSON.stringify(problem ? { ...(payload as object), previousAttemptProblem: problem } : payload), maxTokens, undefined, {
      systemPrompt,
      temperature,
    });
    try {
      return schema.parse(parseOutput(result.text));
    } catch (e) {
      problem = e instanceof z.ZodError ? e.issues.slice(0, 5).map((i) => i.path.join(".") + ": " + i.message).join("; ") : "The reply was not valid JSON";
    }
  }
  throw new Error("The AI reply was not in the expected format (" + problem + "). Try again, or pick a stronger model in Settings.");
}

const slugOf = (title: string) => seoFilename(title).slice(0, 60) || "case-study";
async function uniqueSlug(title: string) {
  const base = slugOf(title);
  for (let n = 0; n < 50; n++) {
    const slug = n ? `${base}-${n + 1}` : base;
    if (!(await query("SELECT 1 FROM case_studies WHERE slug=$1", [slug])).length) return slug;
  }
  throw new Error("Could not find a free slug");
}

export type Focus = { subject?: string; notes?: string; services?: string[]; industries?: string[]; locations?: string[] };
/** Resolves the owner's picks to valid options and a readable subject line. */
export function resolveFocus(input: Focus) {
  const services = pickFrom(input.services, serviceOptions);
  const industries = pickFrom(input.industries, industryOptions);
  const locations = pickFrom(input.locations, locationOptions);
  const subject =
    input.subject?.trim() ||
    `${services.length ? services.join(", ") : "software services"} for ${industries.length ? industries.join(", ") : "a range of industries"}${locations.length ? " in " + locations.join(", ") : ""}`;
  return { subject, services: services.length ? services : serviceOptions, industries: industries.length ? industries : industryOptions, locations: locations.length ? locations : locationOptions };
}

export async function brainstorm(input: Focus & { count: number }) {
  const focus = resolveFocus(input);
  const existing = await query("SELECT title FROM case_studies WHERE status<>'archived' UNION SELECT title FROM case_study_ideas WHERE status<>'dismissed' LIMIT 40");
  const out = await ask(
    ideasSchema,
    {
      task: `Brainstorm ${input.count} distinct case study ideas about this subject, so the portfolio shows range and proof rather than repetition.`,
      subject: focus.subject,
      ownerNotes: input.notes || undefined,
      alreadyCovered: existing.map((r) => r.title),
      allowedServices: focus.services,
      allowedIndustries: focus.industries,
      allowedLocations: focus.locations,
      requirements: [
        "services: 1-3 names copied exactly from allowedServices that the study combines (for example a web application plus UI/UX design). Mix single-service and multi-service ideas.",
        "industry: exactly one name copied exactly from allowedIndustries. Spread ideas across the allowed industries.",
        "location: exactly one value copied exactly from allowedLocations, the place the client is based. Spread ideas across the allowed locations.",
        "title: a specific working title naming the problem or outcome, not a slogan.",
        "angle: 1-3 sentences on the story: who the client is likely to be, the problem, and what the study would prove.",
        "why: why a prospective buyer would care, and which service or industry page it supports.",
        "evidenceNeeded: the real facts the owner must supply (metrics, dates, quotes, screenshots) for the study to be credible.",
        "Vary the services, industries and result types across ideas.",
      ],
      schema: { ideas: [{ title: "string", angle: "string", why: "string", services: ["string"], industry: "string", location: "string", evidenceNeeded: ["string"] }] },
    },
    4000,
    0.8,
  );
  const rows = [];
  for (const idea of out.ideas) {
    const services = pickFrom(idea.services, focus.services).slice(0, 3);
    const industry: string = idea.industry && focus.industries.includes(idea.industry) ? idea.industry : (focus.industries[rows.length % focus.industries.length] ?? "");
    const location: string = idea.location && focus.locations.includes(idea.location) ? idea.location : (focus.locations[rows.length % focus.locations.length] ?? "");
    rows.push(
      (
        await query(
          "INSERT INTO case_study_ideas(subject,title,angle,why,evidence_needed,services,industry,location) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [focus.subject, idea.title, idea.angle, idea.why, JSON.stringify(idea.evidenceNeeded), JSON.stringify(services.length ? services : focus.services.slice(0, 1)), industry, location],
        )
      )[0],
    );
  }
  return rows;
}

export async function createStudy(input: { title: string; subject: string; facts?: string; ideaId?: string; services?: string[]; industry?: string; location?: string }) {
  const slug = await uniqueSlug(input.title);
  // The chosen service mix and industry travel with the study into the draft and image prompts.
  const seed = contentSchema.parse({ services: input.services ?? [], client: { industry: input.industry ?? "", location: input.location ?? "" } });
  const [row] = await query(
    "INSERT INTO case_studies(idea_id,slug,title,subject,facts,content) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
    [input.ideaId ?? null, slug, input.title, input.subject, input.facts ?? "", JSON.stringify(seed)],
  );
  if (input.ideaId) await query("UPDATE case_study_ideas SET status='chosen' WHERE id=$1", [input.ideaId]);
  return row;
}

async function study(id: string) {
  const [row] = await query("SELECT * FROM case_studies WHERE id=$1", [id]);
  if (!row) throw new Error("Case study not found");
  return row;
}

const contentShape = {
  headline: "string", summary: "string", client: { name: "string", industry: "string", location: "string", size: "string" },
  services: ["string"], timeline: "string", challenge: "string", approach: "string", solution: "string", results: "string",
  outcomes: [{ metric: "string", value: "string", note: "string" }], testimonial: { quote: "string", attribution: "string" },
  techStack: ["string"], primaryKeyword: "string", secondaryKeywords: ["string"], metaTitle: "string (max 60 chars)", metaDescription: "string (max 155 chars)", gaps: ["string"],
};

export async function draftStudy(id: string) {
  const s = await study(id);
  if (s.facts.trim().length < 80) throw new Error("Add the real project facts first (at least a few sentences)");
  const prev = contentSchema.parse(s.content);
  const drafted = await ask(
    contentSchema,
    {
      task: "Write the case study from the owner's facts only.",
      workingTitle: s.title,
      subject: s.subject,
      ownerFacts: s.facts,
      servicesDelivered: prev.services.length ? prev.services : undefined,
      industry: prev.client.industry || undefined,
      location: prev.client.location || undefined,
      currency: prev.client.location ? currencyFor(prev.client.location) : undefined,
      requirements: [
        "If servicesDelivered is given, the study must cover how those services worked together, and 'services' must equal that list. If industry is given, use it.",
        "challenge, approach, solution and results are 2-4 short paragraphs each, separated by blank lines. Describe only what the facts support.",
        "outcomes: only metrics that appear in the facts, copied exactly. Leave empty if none.",
        "techStack: every programming language, framework, database, cloud service and tool named in the facts, as short names (for example 'Next.js', 'PostgreSQL', 'AWS'). If the facts name none, leave it empty and add a gap.",
        "primaryKeyword: the search phrase a buyer would type to find this kind of work, built from the services, industry and, where natural, the city (for example 'custom software development for logistics' or 'ecommerce development company Sydney'). Lowercase, 3-7 words, no brand names.",
        "secondaryKeywords: 3-5 related search phrases, including one with 'case study'.",
        "metaTitle: starts with the primaryKeyword, max 60 characters, ends with '| Netofficials'. metaDescription: 130-155 characters, contains the primaryKeyword once in natural words, states the problem and the result, no dashes.",
        "testimonial: only if a real quote is in the facts. Never write one.",
        "If the client wants to stay anonymous, describe them generically (for example 'a regional logistics company') and keep client.name empty.",
        "gaps: list every fact that would make the study stronger and is not in the facts.",
      ],
      schema: contentShape,
    },
    6000,
  );
  const content = {
    ...drafted,
    services: prev.services.length ? prev.services : drafted.services,
    client: { ...drafted.client, industry: prev.client.industry || drafted.client?.industry || "", location: prev.client.location || drafted.client?.location || "" },
  };
  const [row] = await query("UPDATE case_studies SET content=$2,updated_at=now() WHERE id=$1 RETURNING *", [id, JSON.stringify(finalizeMeta(contentSchema.parse(content), s.title))]);
  return row;
}

export async function rewriteField(id: string, field: (typeof editableFields)[number], instruction: string) {
  const s = await study(id);
  const content = contentSchema.parse(s.content);
  const out = await ask(
    z.object({ value: str(1,4000) }),
    {
      task: `Rewrite only the "${field}" field of this case study following the owner's instruction.`,
      instruction: instruction || "Make it clearer and more specific without adding new facts.",
      ownerFacts: s.facts,
      currentContent: content,
      schema: { value: "string" },
    },
    2500,
  );
  const next = { ...content, [field]: out.value };
  const [row] = await query("UPDATE case_studies SET content=$2,updated_at=now() WHERE id=$1 RETURNING *", [id, JSON.stringify(contentSchema.parse(next))]);
  return row;
}

export async function saveStudy(id: string, input: { title?: string; facts?: string; status?: string; content?: unknown }) {
  const current = await study(id);
  let content = input.content === undefined ? current.content : contentSchema.parse(input.content);
  const status = z.enum(["draft", "ready", "published", "archived"]).parse(input.status ?? current.status);
  if (status === "published") {
    const c = contentSchema.parse(content);
    const missing = (["headline", "summary", "challenge", "approach", "results"] as const).filter((k) => !c[k]);
    if (missing.length) throw new Error("Complete these fields before publishing: " + missing.join(", "));
    // A page never goes live with a meta title or description that is missing its keyword.
    content = finalizeMeta(c, input.title ?? current.title);
    if (current.origin === "auto" && !c.disclosure) throw new Error("Add the disclosure before publishing an illustrative scenario");
  }
  const [row] = await query(
    "UPDATE case_studies SET title=$2,facts=$3,status=$4,content=$5,published_at=CASE WHEN $4='published' THEN COALESCE(published_at,now()) ELSE published_at END,updated_at=now() WHERE id=$1 RETURNING *",
    [id, (input.title ?? current.title).slice(0, 200), input.facts ?? current.facts, status, JSON.stringify(content)],
  );
  return row;
}

export async function planImages(id: string, replace: boolean) {
  const s = await study(id);
  const content = contentSchema.parse(s.content);
  const design = await ensureDesign(id);
  const plan = await ask(
    imagePlanSchema,
    {
      task: "Plan 3-5 images that would make this case study look credible and well designed, with one generation prompt each.",
      title: s.title,
      productLook: design,
      services: content.services,
      industry: content.client?.industry || undefined,
      clientLocation: content.client?.location || undefined,
      currency: content.client?.location ? currencyFor(content.client.location) : undefined,
      content: { headline: content.headline, summary: content.summary, challenge: content.challenge, solution: content.solution, results: content.results, techStack: content.techStack },
      requirements: [
        "slot: a short id such as 'cover', 'challenge', 'architecture', 'workflow', 'results'.",
        "style: 'ui' for anything that shows the product (dashboards, admin panels, tracking screens, reports, mobile app screens) and use it for most images; 'illustration' only for abstract architecture or workflow diagrams.",
        "prompt for style ui: 60-140 words describing the main content area of one screen of the product. The sidebar, top bar, palette and fonts are applied automatically from productLook, so do not describe them. Reuse the entities and numbers from productLook.dataset. Say what kind of screen it is, which panels it has, the chart types, the table columns and a few example row values, the status chips, and the short labels to show. Never put a company, client or product name in the screen; use generic labels and amounts in the client's local currency. Describe real data and layout, never abstract blobs.",
        "prompt for style illustration: 50-120 words describing shapes, nodes and connections with no text.",
        "Do not ask for people, faces, real brand logos or phone/laptop device frames.",
        "Show the delivered services: for example an admin dashboard for software development, a storefront or catalogue screen for ecommerce, a rankings and traffic report for SEO, a campaign performance screen for PPC. Use the industry's own vocabulary in table columns and labels.",
        "alt: factual description for screen readers, 80-125 characters.",
        "ratio: 16:9 for the cover and wide scenes, 4:3 or 3:2 for inline figures, 1:1 for icons or detail.",
        "The first image must have slot 'cover'.",
      ],
      schema: { images: [{ slot: "string", purpose: "string", prompt: "string", alt: "string", ratio: "16:9|4:3|1:1|3:2", style: "ui|illustration" }] },
    },
    3000,
  );
  if (replace) await query("DELETE FROM case_study_images WHERE study_id=$1 AND asset_id IS NULL", [id]);
  const [{ n }] = await query("SELECT COALESCE(max(sort),-1)+1 n FROM case_study_images WHERE study_id=$1", [id]);
  const rows = [];
  for (const [i, image] of plan.images.entries())
    rows.push(
      (
        await query(
          "INSERT INTO case_study_images(study_id,slot,purpose,prompt,alt,ratio,style,sort) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [id, image.slot, image.purpose, image.prompt, image.alt, image.ratio, image.style, n + i],
        )
      )[0],
    );
  return rows;
}

export async function addImage(studyId: string, input: { slot?: string; prompt: string; alt?: string; ratio?: string; style?: string }) {
  await study(studyId);
  const [{ n }] = await query("SELECT COALESCE(max(sort),-1)+1 n FROM case_study_images WHERE study_id=$1", [studyId]);
  const [row] = await query(
    "INSERT INTO case_study_images(study_id,slot,prompt,alt,ratio,style,sort) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [studyId, (input.slot || "image").slice(0, 40), input.prompt, input.alt ?? "", z.enum(ratios).parse(input.ratio ?? "16:9"), z.enum(["ui", "illustration"]).parse(input.style ?? "ui"), n],
  );
  return row;
}

export async function saveImage(id: string, input: { prompt?: string; alt?: string; ratio?: string; slot?: string; style?: string }) {
  const [cur] = await query("SELECT * FROM case_study_images WHERE id=$1", [id]);
  if (!cur) throw new Error("Image not found");
  const [row] = await query(
    "UPDATE case_study_images SET prompt=$2,alt=$3,ratio=$4,slot=$5,style=$6,updated_at=now() WHERE id=$1 RETURNING *",
    [
      id,
      str(20,2000).parse(input.prompt ?? cur.prompt),
      (input.alt ?? cur.alt).slice(0, 300),
      z.enum(ratios).parse(input.ratio ?? cur.ratio),
      (input.slot ?? cur.slot).slice(0, 40),
      z.enum(["ui", "illustration"]).parse(input.style ?? cur.style),
    ],
  );
  return row;
}

/** Turns the saved prompt into a picture. The brand style is appended unless the prompt already carries its own. */
export async function generateStudyImage(id: string, useBrandStyle = true) {
  const [img] = await query("SELECT i.*,s.title,s.slug FROM case_study_images i JOIN case_studies s ON s.id=i.study_id WHERE i.id=$1", [id]);
  if (!img) throw new Error("Image not found");
  const d = await defaults();
  if (!d.imageModel) throw new Error("Choose an image model in Settings first");
  const look = img.style === "ui" ? lookBlock(await ensureDesign(img.study_id)) : "";
  const prompt = useBrandStyle
    ? `${img.prompt}\n\n${look ? look + "\n\n" : ""}Style: ${img.style === "ui" ? uiStyle : imageStyle}\nComposition for a ${img.ratio} frame.`
    : img.prompt;
  try {
    const { reference } = await generateHero({
      model: d.imageModel,
      quality: d.imageQuality,
      prompt,
      ratio: img.ratio,
      alt: img.alt || img.prompt.slice(0, 120),
      name: seoFilename(`${img.slot} ${img.title}`, img.slug),
    });
    const [row] = await query("UPDATE case_study_images SET asset_id=$2,error=NULL,updated_at=now() WHERE id=$1 RETURNING *", [id, reference.id]);
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    await query("UPDATE case_study_images SET error=$2,updated_at=now() WHERE id=$1", [id, message.slice(0, 300)]);
    throw error;
  }
}

export async function attachUpload(imageId: string, assetId: string) {
  const [row] = await query("UPDATE case_study_images SET asset_id=$2,error=NULL,updated_at=now() WHERE id=$1 RETURNING *", [imageId, assetId]);
  if (!row) throw new Error("Image not found");
  return row;
}

export async function listAll() {
  return {
    ideas: await query("SELECT * FROM case_study_ideas WHERE status<>'dismissed' ORDER BY created_at DESC LIMIT 100"),
    studies: await query(
      "SELECT s.id,s.slug,s.title,s.status,s.origin,s.progress,s.updated_at,(s.content->>'headline') headline,(SELECT count(*)::int FROM case_study_images i WHERE i.study_id=s.id AND i.asset_id IS NOT NULL) images FROM case_studies s ORDER BY s.updated_at DESC LIMIT 200",
    ),
  };
}

export async function getStudy(id: string) {
  const s = await study(id);
  return {
    study: s,
    images: await query(
      "SELECT i.*,a.width,a.height FROM case_study_images i LEFT JOIN generated_assets a ON a.id=i.asset_id WHERE i.study_id=$1 ORDER BY i.sort,i.created_at",
      [id],
    ),
  };
}

export async function removeStudy(id: string) {
  await query("DELETE FROM case_studies WHERE id=$1", [id]);
}
export async function removeImage(id: string) {
  await query("DELETE FROM case_study_images WHERE id=$1", [id]);
}
export async function dismissIdea(id: string) {
  await query("UPDATE case_study_ideas SET status='dismissed' WHERE id=$1", [id]);
}

const scenarioSchema = z.object({
  title: str(8,160),
  clientProfile: str(10,160),
  industry: str(3,80),
  facts: str(200,6000),
});
const DISCLOSURE = "Illustrative scenario with sample data. The client is not named and the figures are examples, not measured results.";
const progress = (id: string, step: string, extra: Record<string, unknown> = {}) =>
  query("UPDATE case_studies SET progress=$2,updated_at=now() WHERE id=$1", [id, JSON.stringify({ step, at: new Date().toISOString(), ...extra })]);

/** Starts N fully automatic case studies in the background and returns the new rows at once. */
export async function autoBuild(input: Focus & { count: number }) {
  const ideas = await brainstorm(input);
  const rows = [];
  for (const idea of ideas) {
    const row = await createStudy({ title: idea.title, subject: idea.subject, ideaId: idea.id, services: idea.services, industry: idea.industry, location: idea.location });
    await query("UPDATE case_studies SET origin='auto' WHERE id=$1", [row.id]);
    rows.push(row);
  }
  // Runs detached so the request returns immediately; progress is stored on each row.
  void (async () => {
    for (const [i, row] of rows.entries()) {
      const idea = ideas[i];
      try {
        await progress(row.id, "Writing the scenario");
        const sc = await ask(
          scenarioSchema,
          {
            task: "Invent one plausible success story for this case study idea: a person or organization based in the given location, their business problem, the app Netofficials built, and how it helped them. Write the facts as the owner's notes would read.",
            title: idea.title,
            angle: idea.angle,
            subject: idea.subject,
            services: idea.services,
            industry: idea.industry,
            location: idea.location,
            currency: currencyFor(idea.location || ""),
            requirements: [
              "The app Netofficials built must combine exactly these services: the story shows what each one contributed. The client works in the given industry.",
              "clientProfile: who they are without any name, such as 'an independent restaurant owner in Dubai', using the given location.",
              "industry: a short industry label.",
              "title: describes the problem or outcome and contains no name.",
              "facts: 250-500 words covering how they worked before the app, the problem it caused, what was built, the stack, the timeline, how it helped day to day, and 3 to 5 modest sample metrics with a stated period.",
            ],
            schema: { title: "string", clientProfile: "string", industry: "string", facts: "string" },
          },
          3500,
          0.8,
          scenarioSystem,
        );
        await query("UPDATE case_studies SET facts=$2,title=$3 WHERE id=$1", [row.id, sc.facts, sc.title]);
        await progress(row.id, "Writing the draft");
        const drafted = await draftStudy(row.id);
        const content = contentSchema.parse({
          ...drafted.content,
          client: { name: "", industry: idea.industry || sc.industry, location: idea.location || "", size: sc.clientProfile },
          services: idea.services.length ? idea.services : (drafted.content as any).services,
          disclosure: DISCLOSURE,
          gaps: [],
        });
        await query("UPDATE case_studies SET content=$2 WHERE id=$1", [row.id, JSON.stringify(content)]);
        await fillStack(row.id).catch(() => {});
        await progress(row.id, "Planning images");
        const images = await planImages(row.id, true);
        for (const [n, img] of images.entries()) {
          await progress(row.id, `Generating image ${n + 1} of ${images.length}`);
          try {
            await generateStudyImage(img.id);
          } catch {
            // The failure is stored on the image row; keep going with the rest.
          }
        }
        await progress(row.id, "Done");
      } catch (error) {
        await progress(row.id, "Failed", { error: (error instanceof Error ? error.message : "Unknown error").slice(0, 300) });
      }
    }
  })();
  return rows;
}

/** Reads the technologies named in the facts and the draft into the tech stack field. */
export async function fillStack(id: string) {
  const s = await study(id);
  const content = contentSchema.parse(s.content);
  const out = await ask(
    z.object({ techStack: list(16, 60) }),
    {
      task: "List the technologies used on this project: languages, frameworks, databases, cloud services, integrations and tools.",
      ownerFacts: s.facts,
      draft: { approach: content.approach, solution: content.solution, services: content.services },
      requirements: [
        "Only technologies named in ownerFacts or the draft. Use short official names, no versions, no duplicates.",
        "If none are named, return an empty list.",
      ],
      schema: { techStack: ["string"] },
    },
    600,
    0.1,
  );
  const [row] = await query("UPDATE case_studies SET content=$2,updated_at=now() WHERE id=$1 RETURNING *", [id, JSON.stringify({ ...content, techStack: out.techStack })]);
  return row;
}

/** A study for the public site: published ones for everyone, anything else only when previewing as the owner. */
export async function publicStudy(slug: string, preview: boolean) {
  const [s] = await query("SELECT * FROM case_studies WHERE slug=$1 AND (status='published' OR $2::boolean) AND status<>'archived'", [slug, preview]);
  if (!s) return null;
  const images = await query(
    "SELECT i.id,i.slot,i.alt,i.ratio,i.style,i.asset_id,a.width,a.height,a.alt asset_alt,a.seo_name FROM case_study_images i JOIN generated_assets a ON a.id=i.asset_id WHERE i.study_id=$1 ORDER BY i.sort,i.created_at",
    [s.id],
  );
  return { study: s, content: contentSchema.parse(s.content), images };
}

export async function publicStudies() {
  const rows = await query(
    "SELECT s.slug,s.title,s.content,s.published_at,(SELECT row_to_json(x) FROM (SELECT i.asset_id,i.alt,a.width,a.height,a.seo_name FROM case_study_images i JOIN generated_assets a ON a.id=i.asset_id WHERE i.study_id=s.id ORDER BY (i.slot='cover') DESC,i.sort LIMIT 1) x) cover FROM case_studies s WHERE s.status='published' ORDER BY s.published_at DESC NULLS LAST",
  );
  return rows.map((r) => ({ slug: r.slug as string, title: r.title as string, content: contentSchema.parse(r.content), publishedAt: r.published_at as string | null, cover: r.cover as { asset_id: string; alt: string; width: number; height: number; seo_name: string | null } | null }));
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The phrase a buyer would search for, from the services, industry and city when the AI gave none. */
export function derivePrimaryKeyword(c: CaseStudyContent, title: string) {
  const service = (c.services[0] ?? "").replace(/\s+services?$/i, "").toLowerCase();
  const industry = (c.client.industry ?? "").toLowerCase();
  if (service && industry) return `${service} for ${industry}`;
  return service || industry || title.toLowerCase();
}

/**
 * Makes sure the meta title and description carry the primary keyword, stay inside search display limits and
 * contain no dashes. Text that already passes is left alone, so the owner's own wording survives.
 */
export function finalizeMeta(c: CaseStudyContent, title: string): CaseStudyContent {
  const primary = (c.primaryKeyword || derivePrimaryKeyword(c, title)).trim();
  const secondary = c.secondaryKeywords.length
    ? c.secondaryKeywords
    : [...c.services.slice(1, 3), c.client.industry ? `${c.client.industry} software` : "", "case study"].filter(Boolean);
  const has = (text: string) => squash(text).includes(squash(primary));

  let metaTitle = plainDashes(c.metaTitle).trim();
  if (!metaTitle || metaTitle.length > 60 || !has(metaTitle)) metaTitle = tidyMetaTitle(composeMetaTitle(primary, [...secondary, "case study"], "Netofficials"));

  let metaDescription = plainDashes(c.metaDescription).trim();
  if (metaDescription.length < 110 || metaDescription.length > 160 || !has(metaDescription)) {
    const lead = `${sentenceCase(primary)} case study: `;
    const first = (c.summary.split(/(?<=[.!?])\s/)[0] || c.headline || title).replace(/\s+/g, " ").trim();
    let text = lead + first;
    if (text.length < 110) text += " See how Netofficials built it and what changed.";
    if (text.length > 155) {
      const cut = text.slice(0, 155);
      text = cut.slice(0, Math.max(cut.lastIndexOf(" "), 100)).replace(/[\s,;:(-]+$/, "");
    }
    metaDescription = plainDashes(text);
  }
  return { ...c, primaryKeyword: primary, secondaryKeywords: secondary.slice(0, 6), metaTitle, metaDescription };
}

/** Asks the model for fresh keywords and meta text from the finished draft, then repairs anything that misses the rules. */
export async function regenerateSeo(id: string) {
  const s = await study(id);
  const c = contentSchema.parse(s.content);
  if (!c.headline && !c.challenge) throw new Error("Write the draft first");
  const out = await ask(
    z.object({ primaryKeyword: text(90), secondaryKeywords: list(6, 70), metaTitle: text(90), metaDescription: text(220) }),
    {
      task: "Write the search keywords and the meta title and description for this case study page.",
      title: s.title,
      services: c.services,
      industry: c.client.industry || undefined,
      location: c.client.location || undefined,
      headline: c.headline,
      summary: c.summary,
      requirements: [
        "primaryKeyword: the phrase a buyer would type to find this work, from the services, industry and where natural the city. Lowercase, 3-7 words, no brand names.",
        "secondaryKeywords: 3-5 related phrases, one containing 'case study'.",
        "metaTitle: starts with the primaryKeyword, max 60 characters, ends with '| Netofficials'.",
        "metaDescription: 130-155 characters, contains the primaryKeyword once in natural words, says the problem and the result, no dashes, no hype.",
      ],
      schema: { primaryKeyword: "string", secondaryKeywords: ["string"], metaTitle: "string", metaDescription: "string" },
    },
    700,
    0.3,
  );
  const next = finalizeMeta({ ...c, ...out }, s.title);
  const [row] = await query("UPDATE case_studies SET content=$2,updated_at=now() WHERE id=$1 RETURNING *", [id, JSON.stringify(next)]);
  return row;
}
