import { publishPassingDrafts } from "@/admin-publish";
import { s3Regions, saveStorageSettings, storageSettings, storageSettingsSchema, storageStatus, testStorage } from "@/asset-storage";
import { effectiveSpec, specForContent } from "@/prompts/templates";
import { requireOwner, assertOrigin } from "@/auth";
import { query, transaction } from "@/db";
import {
  consoleList,
  consoleOverview,
  consoleSettings,
  listSchema,
} from "@/admin-console-data";
import { z } from "zod";
import { boundedJSON } from "@/request-limits";
import { reviewPage } from "@/admin-review";
import { contentSchema, validateContent } from "@/content";
import { getDesign } from "@/designs";
import {
  validateBlueprint,
  validateSectionFields,
  type PageSpecification,
} from "@/page-spec-schema";
import { POST as publishingMutation } from "../../publishing/route";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ resource: string }> };
const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET(request: Request, context: Context) {
  try {
    await requireOwner();
  } catch {
    return json({ error: "Sign in to continue" }, 401);
  }
  try {
    const { resource } = await context.params;
    const search = new URL(request.url).searchParams;
    if (resource === "overview")
      return json(
        await consoleOverview(
          z.coerce
            .number()
            .refine((v) => [7, 30, 90].includes(v))
            .parse(search.get("days") ?? 30),
        ),
      );
    if (resource === "settings") return json(await consoleSettings());
    if (resource === "storage") return json({ status: await storageStatus(), regions: s3Regions });
    if (resource === "sitemap")
      return json({
        pages: await query(
          `SELECT p.id,p.path,p.title,p.published_revision_id IS NOT NULL published,
             COALESCE(r.content->>'schemaVersion','1') version,
             (r.validation->'qa'->>'score')::int qa,
             COALESCE(rr.status,'pending') review_status,
             (SELECT pr.status FROM pipeline_runs pr WHERE pr.page_id=p.id ORDER BY pr.created_at DESC LIMIT 1) run_status,
             EXISTS(SELECT 1 FROM page_specs s WHERE s.page_id=p.id) has_spec
           FROM pages p LEFT JOIN revisions r ON r.id=p.draft_revision_id LEFT JOIN revision_reviews rr ON rr.revision_id=p.draft_revision_id
           WHERE p.archived_at IS NULL ORDER BY p.path`,
        ),
      });
    if (resource === "options")
      return json({
        destinations: await query(
          "SELECT path,title FROM pages WHERE archived_at IS NULL ORDER BY path",
        ),
        categories: await query(
          "SELECT DISTINCT COALESCE(NULLIF(brief->>'cluster',''),kind) value FROM pages ORDER BY value",
        ),
        kinds: await query(
          "SELECT DISTINCT kind value FROM pages ORDER BY value",
        ),
      });
    if (resource === "evidence")
      return json({
        facts: await query(
          "SELECT id,statement,source_id,approved FROM facts ORDER BY created_at DESC",
        ),
        sources: await query(
          "SELECT id,title,url,excerpt,approved FROM sources ORDER BY created_at DESC",
        ),
      });
    const id = search.get("id");
    if (id) {
      z.string().uuid().parse(id);
      if (resource === "page-generation") {
        const runs = await query("SELECT r.id,r.status,r.created_at,r.result_revision_id,(SELECT draft_revision_id FROM pages WHERE id=r.page_id) draft_revision_id,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id) total,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='completed') completed,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='failed') failed,(SELECT string_agg(COALESCE(t.section_id,t.kind), ', ') FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='running') active,'pipeline' engine FROM pipeline_runs r WHERE r.page_id=$1 UNION ALL SELECT j.id,j.status,j.created_at,j.result_revision_id,(SELECT draft_revision_id FROM pages WHERE id=j.page_id),1,CASE WHEN j.status='completed' THEN 1 ELSE 0 END,CASE WHEN j.status='failed' THEN 1 ELSE 0 END,j.stage,'legacy' FROM jobs j WHERE j.page_id=$1 ORDER BY created_at DESC LIMIT 1", [id]);
        return json({run: runs[0] ?? null});
      }
      if (resource === "pages") {
        const [page] = await query(
          "SELECT p.*,r.content,r.validation,CASE WHEN p.published_revision_id IS NULL THEN NULL ELSE COALESCE(live.content->>'schemaVersion','1') END published_version,COALESCE(rr.status,'pending') review_status FROM pages p LEFT JOIN revisions r ON r.id=p.draft_revision_id LEFT JOIN revisions live ON live.id=p.published_revision_id LEFT JOIN revision_reviews rr ON rr.revision_id=p.draft_revision_id WHERE p.id=$1",
          [id],
        );
        if (!page) return json({ error: "Page not found" }, 404);
        const [spec] = await query(
          "SELECT id,specification FROM page_specs WHERE page_id=$1 ORDER BY created_at DESC LIMIT 1",
          [id],
        );
        const design = getDesign(
          page.path === "/" ? "software-led" : page.template,
        );
        return json({
          page: { ...page, sections: design.sections },
          spec: spec?.specification ? specForContent(spec.specification, page.content) : undefined,
          history: await query(
            "SELECT id,origin,created_at,validation FROM revisions WHERE page_id=$1 ORDER BY created_at DESC",
            [id],
          ),
          facts: await query("SELECT id,statement FROM facts WHERE approved"),
          run: (
            await query(
              "SELECT r.id,r.status,r.review_status,r.result_revision_id,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id) total,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='completed') completed,(SELECT count(*)::int FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='failed') failed,(SELECT string_agg(COALESCE(t.section_id,t.kind), ', ') FROM pipeline_tasks t WHERE t.run_id=r.id AND t.status='running') active FROM pipeline_runs r WHERE r.page_id=$1 ORDER BY r.created_at DESC LIMIT 1",
              [id],
            )
          )[0],
        });
      }
      if (resource === "revisions")
        return json(
          (
            await query(
              "SELECT content,validation FROM revisions WHERE id=$1",
              [id],
            )
          )[0] ?? {},
        );
      if (resource === "production")
        return json({
          tasks: await query(
            "SELECT id,kind,section_id,status,attempts,usage,error,request_snapshot,result FROM pipeline_tasks WHERE run_id=$1 ORDER BY created_at",
            [id],
          ),
        });
      if (resource === "media")
        return json(
          (
            await query(
              "SELECT a.id,a.alt,a.width,a.height,a.review_status,a.source_prompt,a.provider,a.model,p.path FROM generated_assets a LEFT JOIN pipeline_runs r ON r.id=a.run_id LEFT JOIN pages p ON p.id=r.page_id WHERE a.id=$1",
              [id],
            )
          )[0] ?? {},
        );
      if (resource === "leads")
        return json(
          (
            await query(
              "SELECT id,data,status,notes,created_at FROM leads WHERE id=$1",
              [id],
            )
          )[0] ?? {},
        );
      if (resource === "vacancies")
        return json(
          (await query("SELECT * FROM vacancies WHERE id=$1", [id]))[0] ?? {},
        );
      if (resource === "applications")
        return json(
          (
            await query(
              "SELECT a.id,a.name,a.email,a.phone,a.cover_message,a.consent_at,a.status,a.created_at,v.title FROM career_applications a JOIN vacancies v ON v.id=a.vacancy_id WHERE a.id=$1",
              [id],
            )
          )[0] ?? {},
        );
      if (resource === "subscribers")
        return json(
          (
            await query(
              "SELECT id,email,status,confirmed_at,created_at FROM newsletter_subscribers WHERE id=$1",
              [id],
            )
          )[0] ?? {},
        );
      if (resource === "outbox")
        return json(
          (
            await query(
              "SELECT id,recipient,subject,purpose,status,attempts,error,created_at FROM email_outbox WHERE id=$1",
              [id],
            )
          )[0] ?? {},
        );
    }
    return json(
      await consoleList(resource, listSchema.parse(Object.fromEntries(search))),
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof z.ZodError
            ? "Invalid filters"
            : error instanceof Error
              ? error.message
              : "Admin data unavailable",
      },
      400,
    );
  }
}
export async function POST(request: Request, context: Context) {
  let owner;
  try {
    owner = await requireOwner();
    assertOrigin(request);
  } catch {
    return json({ error: "Unauthorized" }, 401);
  }
  try {
    const { resource } = await context.params;
    const body = await boundedJSON(request, 2000000);
    let savedRevision: string | undefined;
    if (resource === "pages" && body.action === "publish-passing") {
      const result = await publishPassingDrafts(owner.id);
      await query("INSERT INTO audit_events(owner_id,action,details) VALUES($1,'pages:publish-passing',$2)", [owner.id, JSON.stringify({ published: result.published.length, skipped: result.skipped.length })]);
      return json({ ok: true, ...result });
    }
    if (resource === "storage") {
      // Test uses the submitted values, falling back to the stored secret when left blank.
      const current = await storageSettings();
      const input = storageSettingsSchema.parse(body.input);
      const merged = { ...input, secretAccessKey: input.secretAccessKey || current.secretAccessKey };
      if (body.action === "test") return json(await testStorage(merged));
      if (body.action === "save") {
        const status = await saveStorageSettings(input);
        await query("INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,'storage:save',$2)", [owner.id, status.provider]);
        return json({ ok: true, status });
      }
      throw new Error("Unknown storage action");
    }
    if (resource === "settings" && body.action === "defaults") {
      const defaults = z
        .object({
          provider: z.enum(["bedrock", "openrouter"]),
          model: z.string().min(1).max(200),
          imageModel: z.string().min(1).max(200),
          imageQuality: z.enum(["auto","low","medium","high","xhigh","max"]).default("medium"),
        })
        .strict()
        .parse(body.value);
      await query(
        "INSERT INTO settings(key,value) VALUES('generation_defaults',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [JSON.stringify(defaults)],
      );
    } else if (resource === "pages" && body.action === "review") {
      await reviewPage(body.id, body.revisionId, owner.id);
    } else if (resource === "pages" && body.action === "restore") {
      await transaction(async (c) => {
        const id = z.string().uuid().parse(body.id),
          revision = z.string().uuid().parse(body.revisionId);
        const match = await c.query(
          "SELECT id FROM revisions WHERE id=$1 AND page_id=$2",
          [revision, id],
        );
        if (!match.rowCount)
          throw new Error("Revision does not belong to this page");
        await c.query(
          "UPDATE pages SET draft_revision_id=$1,updated_at=now() WHERE id=$2",
          [revision, id],
        );
      });
    } else if (
      resource === "pages" &&
      ["save-v3", "save-legacy"].includes(body.action)
    ) {
      savedRevision = await transaction(async (c) => {
        const id = z.string().uuid().parse(body.id),
          base = z.string().uuid().parse(body.baseRevisionId),
          content = contentSchema.parse(body.content);
        const page = (
          await c.query("SELECT * FROM pages WHERE id=$1 FOR UPDATE", [id])
        ).rows[0];
        if (!page || page.draft_revision_id !== base)
          throw new Error(
            "Draft changed. Reload or keep your edits separately.",
          );
        if (body.action === "save-v3" && content.schemaVersion !== 3)
          throw new Error("Version-three content required");
        if (content.schemaVersion === 3) {
          const spec = (
            await c.query(
              "SELECT specification FROM page_specs WHERE page_id=$1 ORDER BY created_at DESC LIMIT 1",
              [id],
            )
          ).rows[0]?.specification as PageSpecification | undefined;
          if (!spec) throw new Error("Page specification missing");
          const effective = specForContent(spec, content);
          validateBlueprint(effective, content.pageBlueprint);
          const destinations = (
            await c.query("SELECT path FROM pages WHERE archived_at IS NULL")
          ).rows.map((p) => p.path);
          for (const section of effective.sections) {
            const actual = content.pageSections?.find(
              (s) => s.id === section.id,
            );
            if (!actual) throw new Error("Missing " + section.id);
            validateSectionFields(section, actual.fields, destinations);
          }
        }
        const validation = validateContent(content, getDesign(page.template));
        // Unresolved assets remain visible and block review; copy can still be saved.
        const revision = (
          await c.query(
            "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'owner:v3') RETURNING id",
            [id, JSON.stringify(content), JSON.stringify(validation)],
          )
        ).rows[0];
        await c.query(
          "UPDATE pages SET draft_revision_id=$1,updated_at=now() WHERE id=$2",
          [revision.id, id],
        );
        await c.query(
          "UPDATE pipeline_runs SET result_revision_id=$1,review_status='pending',updated_at=now() WHERE page_id=$2 AND result_revision_id=$3 AND status IN ('review','failed')",
          [revision.id, id, base],
        );
        return revision.id as string;
      });
    } else return publishingMutation(requestClone(request, body));
    await query(
      "INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,$2,$3)",
      [owner.id, resource + ":" + body.action, body.id ?? null],
    );
    return json({ ok: true, revisionId: savedRevision });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return json(
      { error: message },
      /changed|already active/.test(message) ? 409 : 400,
    );
  }
}
function requestClone(request: Request, body: unknown) {
  return new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(body),
  });
}
