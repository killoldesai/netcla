import { randomUUID } from "node:crypto";
import { z } from "zod";
import { query, transaction } from "./db";
import { generate, providerSchema } from "./providers";
import { contentSchema, validateContent } from "./content";
import { getDesign } from "./designs";
import {
  sectionContentWarnings,
  validateBlueprint,
  type PageSpecification,
} from "./page-spec-schema";
import { generateHero } from "./production-assets";
import { templateBlueprint } from "./page-template";
import { runContentQA } from "./content-qa";
import { relatedPaths, sitePage, sitePages } from "./site-structure";
import { PROMPT_VERSION, strategistSystemPrompt, writerSystemPrompt } from "./prompts/system";
import { verifySameAs } from "./seo-verify";
import { buildRepairPrompt, mergeRepair, overLimitFields } from "./prompts/length-repair";
import { buildBriefPrompt, parseBrief, type LinkOption, type PageBrief } from "./prompts/page-brief";
import { buildSectionPrompt } from "./prompts/sections";
import { artDirectionSchema, artDirectorSystemPrompt, buildArtDirectionPrompt, buildImagePrompt } from "./prompts/images";
import { effectiveSpec, imageSectionIds, pageTypeFor, specForContent } from "./prompts/templates";
import { cleanSectionFields, parseModelJSON } from "./prompts/validate";

export const pilotPaths = [
  "/mobile-app-development",
  "/flutter-app-development",
  "/blog/custom-software-development-cost",
];
const MAX_ATTEMPTS = 3;

/** Internal link options: existing pages, closest relatives first. */
export function linkOptions(specPath: string, paths: string[]): LinkOption[] {
  const existing = new Set(paths);
  const ordered = [...relatedPaths(specPath, 40), ...sitePages.map((p) => p.path)];
  const seen = new Set<string>();
  const options: LinkOption[] = [];
  for (const path of ordered) {
    if (seen.has(path) || path === specPath || !existing.has(path)) continue;
    seen.add(path);
    const page = sitePage(path)!;
    options.push({ path, label: page.label, blurb: page.blurb });
  }
  return options.slice(0, 60);
}
export const pipelineSettingsSchema = z
  .object({
    textConcurrency: z.number().int().min(1).max(8).default(2),
    imageConcurrency: z.number().int().min(1).max(3).default(1),
    maxTokens: z.number().int().min(2000).max(32000).default(8000),
  })
  .strict();
export async function pipelineSettings() {
  const [record] = await query(
    "SELECT value FROM settings WHERE key='publishing_pipeline'",
  );
  return pipelineSettingsSchema.parse(record?.value ?? {});
}
export async function queuePages(input: unknown) {
  const value = z
    .object({
      paths: z.array(z.string()).min(1).max(5),
      provider: providerSchema,
      model: z.string().min(1).max(200),
      imageModel: z.string().min(1).max(200),
      imageQuality: z.enum(["auto","low","medium","high","xhigh","max"]).default("medium"),
      scope: z.enum(["page", "sections", "image"]).default("page"),
      /** Full-page runs normally draw new illustrations; this keeps the ones the current draft already has. */
      reuseImages: z.boolean().default(false),
      sectionIds: z.array(z.string()).max(50).default([]),
      baseRevisionId: z.string().uuid().optional(),
      instruction: z.string().trim().max(1000).optional(),
    })
    .strict()
    .parse(input);
  if (new Set(value.paths).size !== value.paths.length)
    throw new Error("Duplicate page selection");
  return transaction(async (c) => {
    const runs: string[] = [];
    for (const path of [...value.paths].sort()) {
      const spec = await c.query(
        "SELECT s.*,p.draft_revision_id FROM page_specs s JOIN pages p ON p.id=s.page_id WHERE s.path=$1 ORDER BY s.created_at DESC LIMIT 1",
        [path],
      );
      if (!spec.rows[0]) throw new Error("Import a specification for " + path);
      const s = spec.rows[0];
      let specification = effectiveSpec(s.specification as PageSpecification);
      const lockedPage = (
        await c.query(
          "SELECT id,draft_revision_id FROM pages WHERE id=$1 FOR UPDATE",
          [s.page_id],
        )
      ).rows[0];
      s.draft_revision_id = lockedPage.draft_revision_id;
      const active = await c.query(
        "SELECT id FROM pipeline_runs WHERE page_id=$1 AND status IN ('queued','running') UNION ALL SELECT id FROM jobs WHERE page_id=$1 AND status IN ('queued','running')",
        [s.page_id],
      );
      if (active.rows.length)
        throw new Error("Generation already active: " + active.rows[0].id);
      if (value.baseRevisionId && value.baseRevisionId !== s.draft_revision_id)
        throw new Error("Draft changed. Refresh before generating.");
      const base = (
        await c.query("SELECT content FROM revisions WHERE id=$1", [
          s.draft_revision_id,
        ])
      ).rows[0]?.content;
      if (value.scope !== "page" && base?.schemaVersion !== 3)
        throw new Error("Selective generation requires a version-three draft");
      // Partial runs keep the layout the existing draft was generated with.
      if (value.scope !== "page") {
        specification = specForContent(s.specification as PageSpecification, base);
        // Asking for a section the stored spec lacks (the synthesized FAQ) uses the effective spec.
        if (value.sectionIds.some((id) => !specification.sections.some((x) => x.id === id)))
          specification = effectiveSpec(s.specification as PageSpecification);
      }
      // A section added since the draft was made (e.g. an FAQ) has no blueprint entry
      // yet; take its entry from the template so the run can still be validated.
      const blueprintForRun =
        value.scope === "page"
          ? undefined
          : (() => {
              const stored = base.pageBlueprint ?? {};
              const missing = specification.sections.filter((x) => !stored[x.id]).map((x) => x.id);
              if (!missing.length) return stored;
              const full = templateBlueprint(specification) as Record<string, unknown>;
              return { ...stored, ...Object.fromEntries(missing.map((id) => [id, full[id]])) };
            })();
      if (value.scope !== "page")
        validateBlueprint(specification, blueprintForRun);
      if (
        value.scope === "sections" &&
        (!value.sectionIds.length ||
          value.sectionIds.some(
            (id) => !specification.sections.some((s) => s.id === id),
          ))
      )
        throw new Error("Select valid copy sections");
      const images = imageSectionIds(specification);
      if (value.scope === "image" && !images.length)
        throw new Error("This page has no designated illustration");
      const run = await c.query(
        "INSERT INTO pipeline_runs(spec_id,page_id,base_revision_id,provider,model,image_model,scope,selected_sections,image_quality,prompt_version,page_type,instruction) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id",
        [
          s.id,
          s.page_id,
          s.draft_revision_id,
          value.provider,
          value.model,
          value.imageModel,
          value.scope,
          JSON.stringify(value.sectionIds),
          value.imageQuality,
          PROMPT_VERSION,
          pageTypeFor(path),
          value.instruction ?? null,
        ],
      );
      const id = run.rows[0].id;
      runs.push(id);
      await c.query(
        "INSERT INTO pipeline_tasks(run_id,kind,status,result) VALUES($1,'blueprint',$2,$3)",
        [
          id,
          "completed",
          JSON.stringify(value.scope === "page" ? templateBlueprint(specification) : blueprintForRun),
        ],
      );
      // Partial runs reuse the page's latest brief so untouched sections stay consistent.
      const previousBrief =
        value.scope === "page"
          ? undefined
          : (
              await c.query(
                "SELECT t.result FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id WHERE r.page_id=$1 AND t.kind='brief' AND t.status='completed' ORDER BY t.updated_at DESC LIMIT 1",
                [s.page_id],
              )
            ).rows[0]?.result;
      await c.query(
        "INSERT INTO pipeline_tasks(run_id,kind,status,result) VALUES($1,'brief',$2,$3)",
        [id, previousBrief ? "completed" : "queued", previousBrief ? JSON.stringify(previousBrief) : null],
      );
      const baseSection = (sectionId: string) =>
        base?.pageSections?.find((x: any) => x.id === sectionId);
      for (const section of specification.sections) {
        // Evidence-gated proof sections are never written by the model; the owner fills them from approved facts.
        const regenerate =
          !/^proof-/.test(section.id) &&
          (value.scope === "page" ||
            (value.scope === "sections" && value.sectionIds.includes(section.id)));
        await c.query(
          "INSERT INTO pipeline_tasks(run_id,kind,section_id,status,result) VALUES($1,'section',$2,$3,$4)",
          [
            id,
            section.id,
            regenerate ? "queued" : "completed",
            regenerate ? null : JSON.stringify(baseSection(section.id)?.fields ?? {}),
          ],
        );
        if (images.includes(section.id)) {
          const keep =
            (value.reuseImages ||
              value.scope === "sections" ||
              (value.scope === "image" && value.sectionIds.length > 0 && !value.sectionIds.includes(section.id))) &&
            baseSection(section.id)?.asset;
          await c.query(
            "INSERT INTO pipeline_tasks(run_id,kind,section_id,status,result) VALUES($1,'asset',$2,$3,$4)",
            [id, section.id, keep ? "completed" : "queued", keep ? JSON.stringify(keep) : null],
          );
        }
      }
    }
    return runs;
  });
}
// Evidence fields are suppressed independently of model obedience. Approved evidence
// can be inserted during owner review; generation never creates a vacancy or proof.
/** True when the text is backed by an approved fact: the whole value appears, or most of its words and every number do. */
function supportedByFacts(value: string, facts: { statement: string }[]) {
  const text = value.trim().toLowerCase();
  if (!text) return false;
  const words = text.split(/[^a-z0-9]+/).filter((w) => w.length > 2 || /\d/.test(w));
  return facts.some((f) => {
    const fact = f.statement.toLowerCase();
    if (fact.includes(text)) return true;
    const numbers = words.filter((w) => /\d/.test(w));
    return numbers.every((n) => fact.includes(n)) && words.filter((w) => fact.includes(w)).length >= Math.ceil(words.length * 0.6);
  });
}

// Company facts the model may state only when an approved fact supports them.
const factFields: Record<string, string[]> = { "company-glance": ["founded_year", "base_city", "delivery_window"] };

export function constrainEvidence(
  sectionId: string,
  fields: Record<string, string>,
  facts: { statement: string }[] = [],
) {
  const output = { ...fields };
  for (const key of Object.keys(output)) {
    if (
      /^(?:stat_\d+_|quote_|client_|leader_|award_|certification_|office_|role_\d+_)/.test(
        key,
      )
    )
      output[key] = "";
  }
  if (
    /(?:testimonials|featured-work|case-study-grid|team-highlights|awards-clients|office-details|^proof-)/.test(
      sectionId,
    )
  )
    for (const key of Object.keys(output)) output[key] = "";
  for (const key of factFields[sectionId] ?? [])
    if (output[key] && !supportedByFacts(output[key], facts)) output[key] = "";
  return output;
}
export async function runPipelineTask() {
  const settings = await pipelineSettings(),
    token = randomUUID();
  const task = await transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(763251)");
    await c.query(
      `UPDATE pipeline_tasks SET status=CASE WHEN attempts>=${MAX_ATTEMPTS} THEN 'failed' ELSE 'queued' END,error='Worker lease expired',lease_token=NULL,lease_until=NULL WHERE status='running' AND lease_until<now()`,
    );
    const running = await c.query(
      "SELECT t.kind,count(*)::int n FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id WHERE t.status='running' AND r.status<>'cancelled' GROUP BY t.kind",
    );
    const counts = Object.fromEntries(running.rows.map((r) => [r.kind, r.n]));
    const textAvailable =
      (counts.blueprint ?? 0) + (counts.brief ?? 0) + (counts.section ?? 0) <
      settings.textConcurrency;
    const imageAvailable = (counts.asset ?? 0) < settings.imageConcurrency;
    // Sections and images wait for the run's blueprint and brief.
    const next = await c.query(
      `SELECT t.*,r.provider,r.model,r.image_model,r.image_quality,r.page_id,r.spec_id,r.base_revision_id,r.instruction,r.scope,s.specification,i.checksum
       FROM pipeline_tasks t JOIN pipeline_runs r ON r.id=t.run_id JOIN page_specs s ON s.id=r.spec_id JOIN page_spec_imports i ON i.id=s.import_id
       WHERE t.status='queued' AND t.next_attempt_at<=now() AND r.status IN ('queued','running')
         AND ((t.kind='asset' AND $1) OR (t.kind<>'asset' AND $2))
         AND (t.kind IN ('blueprint','brief') OR NOT EXISTS(SELECT 1 FROM pipeline_tasks b WHERE b.run_id=t.run_id AND b.kind IN ('blueprint','brief') AND b.status<>'completed'))
         AND (t.kind<>'asset' OR NOT EXISTS(SELECT 1 FROM pipeline_tasks c WHERE c.run_id=t.run_id AND c.kind='section' AND c.section_id=t.section_id AND c.status<>'completed'))
       ORDER BY r.created_at, CASE t.kind WHEN 'blueprint' THEN 0 WHEN 'brief' THEN 1 ELSE 2 END, t.created_at
       LIMIT 1 FOR UPDATE OF t SKIP LOCKED`,
      [imageAvailable, textAvailable],
    );
    if (!next.rows[0]) return null;
    await c.query(
      "UPDATE pipeline_tasks SET status='running',attempts=attempts+1,lease_token=$1,lease_until=now()+interval '10 minutes',updated_at=now() WHERE id=$2",
      [token, next.rows[0].id],
    );
    await c.query(
      "UPDATE pipeline_runs SET status='running',updated_at=now() WHERE id=$1 AND status IN ('queued','running')",
      [next.rows[0].run_id],
    );
    return { ...next.rows[0], attempts: next.rows[0].attempts + 1 };
  });
  if (!task) {
    await assembleReadyRuns();
    return false;
  }
  try {
    const baseContent =
      task.scope !== "page" && task.base_revision_id
        ? (await query("SELECT content FROM revisions WHERE id=$1", [task.base_revision_id]))[0]?.content
        : undefined;
    let spec =
      task.scope === "page"
        ? effectiveSpec(task.specification as PageSpecification)
        : specForContent(task.specification as PageSpecification, baseContent);
    // A section added after the draft was made (the FAQ) only exists in the effective spec.
    if (!spec.sections.some((x) => x.id === task.section_id))
      spec = effectiveSpec(task.specification as PageSpecification);
    const paths = (
      await query("SELECT path FROM pages WHERE archived_at IS NULL")
    ).map((p) => p.path as string);
    const facts = await query<{ id: string; statement: string }>(
      "SELECT id,statement FROM facts WHERE approved=true",
    );
    const links = linkOptions(spec.path, paths);
    const [briefTask] = await query(
      "SELECT result FROM pipeline_tasks WHERE run_id=$1 AND kind='brief' AND status='completed'",
      [task.run_id],
    );
    const brief = briefTask?.result as PageBrief | undefined;
    // A truncated reply is retried with more room.
    const maxTokens = Math.min(32000, Math.round(settings.maxTokens * (1 + 0.5 * (task.attempts - 1))));
    const snapshot = (request: unknown) =>
      query("UPDATE pipeline_tasks SET request_snapshot=$1 WHERE id=$2 AND lease_token=$3", [
        JSON.stringify(request),
        task.id,
        token,
      ]);
    let result: unknown,
      usage: unknown = {},
      notes: string[] = [];
    if (task.kind === "asset") {
      const sectionRows = await query(
        "SELECT section_id,result FROM pipeline_tasks WHERE run_id=$1 AND kind='section' AND status='completed'",
        [task.run_id],
      );
      const fieldsFor = (id: string) => (sectionRows.find((r) => r.section_id === id)?.result ?? {}) as Record<string, string>;
      let direction;
      try {
        const art = await generate(
          providerSchema.parse(task.provider),
          task.model,
          buildArtDirectionPrompt({
            spec,
            sectionId: task.section_id,
            brief,
            fields: fieldsFor(task.section_id),
            pageFields: task.section_id === "hero" ? fieldsFor("service-overview") : fieldsFor("hero"),
            instruction: task.instruction ?? undefined,
          }),
          1500,
          undefined,
          { temperature: 0.4, systemPrompt: artDirectorSystemPrompt },
        );
        direction = artDirectionSchema.parse(parseModelJSON(art.text));
      } catch (error) {
        // Fall back to the brief's plan rather than failing the image.
        notes.push(`${task.section_id}: art direction unavailable (${error instanceof Error ? error.message.slice(0, 120) : "error"}); used the page brief`);
      }
      const image = buildImagePrompt(spec, task.section_id, brief, direction);
      await snapshot({ direction, prompt: image.prompt, ratio: image.ratio, alt: image.alt, name: image.name, model: task.image_model, promptVersion: PROMPT_VERSION });
      const generated = await generateHero({
        runId: task.run_id,
        taskId: task.id,
        sectionId: task.section_id,
        model: task.image_model,
        quality: task.image_quality,
        prompt: image.prompt,
        ratio: image.ratio,
        alt: image.alt,
        name: image.name,
        caption: image.caption,
      });
      result = generated.reference;
      usage = generated.usage;
    } else {
      let prompt: string, system: string, temperature: number;
      if (task.kind === "brief") {
        prompt = buildBriefPrompt({ spec, links, facts, imageSections: imageSectionIds(spec) });
        system = strategistSystemPrompt;
        temperature = 0.4;
      } else if (task.kind === "section") {
        if (!brief) throw new Error("Page brief missing");
        const [baseRevision] = task.base_revision_id
          ? await query("SELECT content FROM revisions WHERE id=$1 AND page_id=$2", [task.base_revision_id, task.page_id])
          : [];
        const previous =
          baseRevision?.content?.schemaVersion === 3
            ? baseRevision.content.pageSections?.find((x: any) => x.id === task.section_id)?.fields
            : undefined;
        prompt = buildSectionPrompt({
          spec,
          section: spec.sections.find((x) => x.id === task.section_id)!,
          brief,
          links,
          facts,
          previous,
          instruction: task.instruction ?? undefined,
        });
        system = writerSystemPrompt;
        temperature = 0.5;
      } else throw new Error("Unsupported task kind: " + task.kind);
      await snapshot({ effectiveRequest: prompt, system, provider: task.provider, model: task.model, temperature, maxTokens, promptVersion: PROMPT_VERSION });
      const generated = await generate(providerSchema.parse(task.provider), task.model, prompt, maxTokens, undefined, {
        temperature,
        systemPrompt: system,
      });
      usage = generated.usage;
      await query("UPDATE pipeline_tasks SET result=$1,usage=$2 WHERE id=$3 AND lease_token=$4", [
        JSON.stringify({ rawResponse: generated.text }),
        JSON.stringify(usage),
        task.id,
        token,
      ]);
      const parsed = parseModelJSON(generated.text);
      if (task.kind === "brief") result = parseBrief(parsed, links);
      else {
        const sectionSpec = spec.sections.find((x) => x.id === task.section_id)!;
        let cleaned = cleanSectionFields(sectionSpec, parsed, paths);
        // Over-long fields get one shorten-only retry; the original stays if the retry is not shorter.
        const over = overLimitFields(cleaned.fields, task.section_id);
        if (over.length) {
          try {
            const retry = await generate(providerSchema.parse(task.provider), task.model, buildRepairPrompt(task.section_id, cleaned.fields, over), maxTokens, undefined, {
              temperature: 0.2,
              systemPrompt: system,
            });
            const merged = mergeRepair(cleaned.fields, (parseModelJSON(retry.text) as Record<string, unknown>), over);
            if (merged.fixed.length) {
              cleaned = cleanSectionFields(sectionSpec, merged.fields, paths);
              cleaned.notes.push(`shortened ${merged.fixed.join(", ")} to fit the word limits`);
            }
          } catch {
            cleaned.notes.push(`over word limit: ${over.map((o) => o.key).join(", ")}`);
          }
        }
        result = constrainEvidence(task.section_id, cleaned.fields, facts);
        notes = cleaned.notes;
      }
    }
    await query(
      "UPDATE pipeline_tasks SET status='completed',result=$1,usage=$2,notes=$3,error=NULL,lease_until=NULL,updated_at=now() WHERE id=$4 AND lease_token=$5 AND status='running' AND EXISTS(SELECT 1 FROM pipeline_runs r WHERE r.id=run_id AND r.status<>'cancelled')",
      [JSON.stringify(result), JSON.stringify(usage), JSON.stringify(notes), task.id, token],
    );
    await assembleReadyRuns();
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Generation failed";
    // Provider throttling is not the task's fault: wait and retry without
    // spending an attempt. Other transient errors, truncation and malformed
    // JSON get a limited number of retries with backoff.
    const throttled = /too many requests|throttl|rate.?limit|\(429\)|slow down/i.test(message);
    const retry = throttled || task.attempts < MAX_ATTEMPTS;
    await query(
      "UPDATE pipeline_tasks SET status=$1,error=$2,attempts=attempts-$6::int,usage=COALESCE(usage,'{}'::jsonb),lease_until=NULL,lease_token=NULL,next_attempt_at=now()+($3::int * interval '30 seconds')+(random()*interval '20 seconds'),updated_at=now() WHERE id=$4 AND lease_token=$5 AND status='running'",
      [retry ? "queued" : "failed", message, throttled ? 2 : task.attempts, task.id, token, throttled ? 1 : 0],
    );
    if (!retry)
      await query(
        "UPDATE pipeline_runs r SET status='failed',updated_at=now() WHERE r.id=$1 AND r.status IN ('queued','running') AND ( $2 IN ('blueprint','brief') OR NOT EXISTS(SELECT 1 FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status IN ('queued','running')))",
        [task.run_id, task.kind],
      );
  }
  return true;
}
export async function assembleReadyRuns() {
  await query(
    "UPDATE pipeline_runs r SET status='failed',updated_at=now() WHERE status IN ('queued','running') AND EXISTS(SELECT 1 FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='failed') AND NOT EXISTS(SELECT 1 FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status IN ('queued','running'))",
  );
  await transaction(async (c) => {
    const ready = await c.query(
      "SELECT r.*,s.specification,i.checksum,p.template FROM pipeline_runs r JOIN page_specs s ON s.id=r.spec_id JOIN page_spec_imports i ON i.id=s.import_id JOIN pages p ON p.id=r.page_id WHERE (r.status IN ('queued','running') OR (r.status='failed' AND r.result_revision_id IS NULL)) AND NOT EXISTS(SELECT 1 FROM pipeline_tasks t WHERE t.run_id=r.id AND ((t.kind<>'asset' AND t.status<>'completed') OR (t.kind='asset' AND t.status IN ('queued','running')))) FOR UPDATE OF r SKIP LOCKED",
    );
    for (const run of ready.rows) {
      await c.query("SAVEPOINT assemble_page");
      try {
        const tasks = (
          await c.query("SELECT * FROM pipeline_tasks WHERE run_id=$1", [
            run.id,
          ])
        ).rows;
        const brief = tasks.find((t) => t.kind === "brief" && t.status === "completed")?.result as PageBrief | undefined;
        const previousContent = (await c.query("SELECT content FROM revisions WHERE id=$1 AND page_id=$2", [run.base_revision_id, run.page_id])).rows[0]?.content;
        let spec =
          run.scope === "page"
            ? effectiveSpec(run.specification as PageSpecification)
            : specForContent(run.specification as PageSpecification, previousContent);
        // Sections the run selected may only exist in the effective spec (the FAQ).
        if (run.scope !== "page" && run.selected_sections.some((id: string) => !spec.sections.some((x) => x.id === id)))
          spec = effectiveSpec(run.specification as PageSpecification);
        const baseContent = run.scope !== "page" ? previousContent : undefined;
        const pageSections = spec.sections.map((s) => ({
          id: s.id,
          order: s.order,
          fields:
            tasks.find((t) => t.kind === "section" && t.section_id === s.id)
              ?.result ?? {},
          ...(tasks.some(
            (t) =>
              t.kind === "asset" &&
              t.section_id === s.id &&
              t.status === "completed" &&
              t.result,
          )
            ? {
                asset: tasks.find(
                  (t) => t.kind === "asset" && t.section_id === s.id,
                )?.result,
              }
            : {}),
          evidenceIds:
            run.scope === "image" ||
            (run.scope === "sections" && !run.selected_sections.includes(s.id))
              ? (baseContent?.pageSections?.find(
                  (section: any) => section.id === s.id,
                )?.evidenceIds ?? [])
              : [],
          omitted:
            baseContent?.pageSections?.find(
              (section: any) => section.id === s.id,
            )?.omitted ?? false,
        }));
        const hero = pageSections.find((s) => s.id === "hero")?.fields ?? {};
        const content = contentSchema.parse({
          ...baseContent,
          schemaVersion: 3,
          title: (brief?.metaTitle || baseContent?.title || hero.h1 || spec.title).slice(0, 150),
          description: (
            brief?.metaDescription ||
            baseContent?.description ||
            hero.subheadline ||
            "Learn about " +
              spec.title +
              " and discuss your requirements with Netofficials."
          ).slice(0, 320),
          seo: brief
            ? {
                metaTitle: brief.metaTitle,
                metaDescription: brief.metaDescription,
                primaryKeyword: brief.primaryKeyword,
                secondaryKeywords: brief.secondaryKeywords,
                entities: brief.entities,
                searchIntent: brief.searchIntent,
                buyerQuestions: brief.buyerQuestions,
                answerSummary: brief.answerSummary,
                keyFacts: brief.keyFacts,
                schemaAbout: await verifySameAs(brief.schemaAbout),
                serviceType: brief.serviceType,
                audience: brief.audience.slice(0, 200),
              }
            : baseContent?.seo,
          texts: {},
          pageBlueprint: tasks.find((t) => t.kind === "blueprint")?.result,
          pageSections,
          provenance: {
            specificationId: run.spec_id,
            specificationHash: run.checksum,
            runId: run.id,
            version: 1,
            promptVersion: run.prompt_version ?? undefined,
            validation: [
              "Unsupported proof fields suppressed",
              ...tasks.flatMap((t) => (Array.isArray(t.notes) ? t.notes : [])).slice(0, 150),
            ],
            generatedAt: new Date().toISOString(),
          },
          sources: baseContent?.sources ?? [],
          claims: baseContent?.claims ?? [],
          hiddenSections: baseContent?.hiddenSections ?? [],
          // Only a missing hero blocks the draft; other figures are optional.
          unresolved: tasks.some(
            (t) => t.kind === "asset" && t.section_id === "hero" && t.status !== "completed",
          )
            ? ["Missing required production hero illustration"]
            : [],
        });
        const validation: ReturnType<typeof validateContent> & { qa?: ReturnType<typeof runContentQA> } =
          validateContent(content, getDesign(run.template));
        validation.qa = runContentQA(content, spec.path);
        for (const t of tasks)
          if (t.kind === "asset" && t.section_id !== "hero" && t.status !== "completed")
            validation.warnings.push(`Illustration for ${t.section_id} could not be generated; regenerate images from the editor.`);
        for (const section of spec.sections) {
          if (run.scope === "image" || (run.scope === "sections" && !run.selected_sections.includes(section.id))) continue;
          validation.warnings.push(...sectionContentWarnings(section, pageSections.find(s => s.id === section.id)!.fields, previousContent?.pageSections?.find((s: any) => s.id === section.id)?.fields));
        }
        const currentPage = (
          await c.query(
            "SELECT draft_revision_id FROM pages WHERE id=$1 FOR UPDATE",
            [run.page_id],
          )
        ).rows[0];
        if (
          currentPage.draft_revision_id !== run.base_revision_id &&
          currentPage.draft_revision_id !== run.result_revision_id
        )
          validation.warnings.push(
            "A newer draft was retained. This generated revision is available for separate review.",
          );
        const revision = await c.query(
          "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'pipeline:v3') RETURNING id",
          [run.page_id, JSON.stringify(content), JSON.stringify(validation)],
        );
        const changed = await c.query(
          "UPDATE pages SET draft_revision_id=$1,updated_at=now() WHERE id=$2 AND (draft_revision_id IS NOT DISTINCT FROM $3::uuid OR draft_revision_id=$4::uuid)",
          [
            revision.rows[0].id,
            run.page_id,
            run.base_revision_id,
            run.result_revision_id,
          ],
        );
        await c.query(
          "UPDATE pipeline_runs SET status=$3,result_revision_id=$1,review_status='pending',error=NULL,updated_at=now() WHERE id=$2",
          [
            revision.rows[0].id,
            run.id,
            content.unresolved.length ? "failed" : "review",
          ],
        );
        await c.query("RELEASE SAVEPOINT assemble_page");
      } catch (error) {
        await c.query("ROLLBACK TO SAVEPOINT assemble_page");
        await c.query(
          "UPDATE pipeline_runs SET status='failed',error=$1,updated_at=now() WHERE id=$2",
          [
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Draft assembly failed",
            run.id,
          ],
        );
      }
    }
  });
}
export async function retryRun(id: string) {
  z.string().uuid().parse(id);
  await transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(763251)");
    const run = await c.query(
      "SELECT status,page_id FROM pipeline_runs WHERE id=$1 FOR UPDATE",
      [id],
    );
    if (!run.rows[0] || run.rows[0].status !== "failed")
      throw new Error("Only failed runs can be resumed");
    await c.query("SELECT id FROM pages WHERE id=$1 FOR UPDATE", [
      run.rows[0].page_id,
    ]);
    const [active] = (
      await c.query(
        "SELECT id FROM pipeline_runs WHERE page_id=$1 AND status IN ('queued','running') UNION ALL SELECT id FROM jobs WHERE page_id=$1 AND status IN ('queued','running')",
        [run.rows[0].page_id],
      )
    ).rows;
    if (active) throw new Error("Generation already active: " + active.id);
    await c.query(
      "UPDATE pipeline_tasks SET status='queued',attempts=0,error=NULL,lease_token=NULL,lease_until=NULL,next_attempt_at=now() WHERE run_id=$1 AND status='failed'",
      [id],
    );
    await c.query(
      "UPDATE pipeline_runs SET status='queued',updated_at=now() WHERE id=$1",
      [id],
    );
  });
}
export async function cancelRun(id: string) {
  z.string().uuid().parse(id);
  await transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(763251)");
    const result = await c.query(
      "UPDATE pipeline_runs SET status='cancelled',cancelled_at=now(),updated_at=now() WHERE id=$1 AND status IN ('queued','running','failed') RETURNING id",
      [id],
    );
    if (!result.rowCount) throw new Error("Run cannot be cancelled");
    await c.query(
      "UPDATE pipeline_tasks SET status='failed',error='Cancelled by owner',lease_token=NULL,lease_until=NULL WHERE run_id=$1 AND status IN ('queued','running')",
      [id],
    );
  });
}
