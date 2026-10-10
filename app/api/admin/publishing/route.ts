import { specForContent } from "@/prompts/templates";
import { requireOwner, assertOrigin } from "@/auth";
import { credentialStatus } from "@/provider-credentials";
import { query, transaction } from "@/db";
import { z } from "zod";
import { loadSpecifications, importSpecifications } from "@/page-spec-import";
import {
  pipelineSettingsSchema,
  queuePages,
  retryRun,
  cancelRun,
} from "@/publishing-pipeline";
import { saveSesSettings, checkSes } from "@/ses-newsletter";
import { vacancySchema, deleteApplication } from "@/careers";
import { imageModels } from "@/production-assets";
import { sectionNeedsEvidence } from "@/v3-evidence";
import { contentSchema, validateContent } from "@/content";
import { getDesign } from "@/designs";
import {
  validateBlueprint,
  validateSectionFields,
  type PageSpecification,
} from "@/page-spec-schema";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireOwner();
    if (new URL(request.url).searchParams.get("models") === "images") {
      try {
        return Response.json(
          { models: await imageModels() },
          {
            headers: { "Cache-Control": "private, no-store" },
          },
        );
      } catch (error) {
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Image model discovery failed",
          },
          { status: 502 },
        );
      }
    }
    const requestedRevision = new URL(request.url).searchParams.get("revision");
    if (requestedRevision) {
      z.string().uuid().parse(requestedRevision);
      const [revision] = await query(
        "SELECT r.content,r.validation FROM revisions r JOIN pipeline_runs p ON p.result_revision_id=r.id WHERE r.id=$1",
        [requestedRevision],
      );
      if (!revision)
        return Response.json(
          { error: "Revision unavailable" },
          { status: 404 },
        );
      return Response.json(revision, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    if (new URL(request.url).searchParams.get("export") === "subscribers") {
      const rows = await query(
        "SELECT email,confirmed_at FROM newsletter_subscribers WHERE status='active' ORDER BY confirmed_at",
      );
      return new Response(
        "email,confirmed_at\r\n" +
          rows
            .map(
              (r) =>
                '"' +
                (/^[=+@-]/.test(r.email) ? "'" : "") +
                r.email.replaceAll('"', '""') +
                '","' +
                new Date(r.confirmed_at).toISOString() +
                '"',
            )
            .join("\r\n"),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition":
              'attachment; filename="confirmed-subscribers.csv"',
            "Cache-Control": "private, no-store",
          },
        },
      );
    }
    const results = await Promise.all([
      query(
        "SELECT s.id,s.path,s.created_at,i.checksum,s.specification,jsonb_array_length(s.specification->'sections') sections FROM page_specs s JOIN page_spec_imports i ON i.id=s.import_id WHERE s.import_id=(SELECT id FROM page_spec_imports ORDER BY created_at DESC LIMIT 1) ORDER BY s.path",
      ),
      query(
        "SELECT r.*,p.path,(SELECT jsonb_agg(jsonb_build_object('id',t.id,'kind',t.kind,'sectionId',t.section_id,'status',t.status,'usage',t.usage,'error',t.error,'attempts',t.attempts)) FROM pipeline_tasks t WHERE t.run_id=r.id) tasks FROM pipeline_runs r JOIN pages p ON p.id=r.page_id ORDER BY r.created_at DESC LIMIT 100",
      ),
      query(
        "SELECT id,run_id,section_id,width,height,alt,review_status FROM generated_assets ORDER BY created_at DESC LIMIT 200",
      ),
      query(
        "SELECT id,email,status,confirmed_at,created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 500",
      ),
      query(
        "SELECT id,recipient,subject,purpose,status,attempts,error,created_at FROM email_outbox ORDER BY created_at DESC LIMIT 100",
      ),
      query("SELECT * FROM vacancies ORDER BY created_at DESC"),
      query(
        "SELECT a.id,a.name,a.email,a.status,a.created_at,v.title FROM career_applications a JOIN vacancies v ON v.id=a.vacancy_id ORDER BY a.created_at DESC LIMIT 500",
      ),
      query(
        "SELECT key,value FROM settings WHERE key IN ('ses_delivery_status','publishing_pipeline','career_retention_days','ai')",
      ),
      query("SELECT key FROM settings WHERE key='ses_credentials'"),
    ]);
    return Response.json(
      {
        specifications: results[0],
        runs: results[1],
        assets: results[2],
        subscribers: results[3],
        outbox: results[4],
        vacancies: results[5],
        applications: results[6],
        settings: Object.fromEntries(results[7].map((r) => [r.key, r.value])),
        sesConfigured: results[8].length > 0,
        credentials: await credentialStatus(),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Unauthorized or publishing tables unavailable" },
      { status: 401 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    assertOrigin(request);
    const body = await request.json();
    let result: unknown = { ok: true };
    switch (body.action) {
      case "import":
        result = await importSpecifications(
          await loadSpecifications(),
          body.apply === true,
        );
        break;
      case "queue":
        result = { runs: await queuePages(body.input) };
        break;
      case "retry":
        await retryRun(body.id);
        break;
      case "cancel":
        await cancelRun(body.id);
        break;
      case "adopt-draft": {
        const id = z.string().uuid().parse(body.id);
        await query(
          "UPDATE pages p SET draft_revision_id=r.result_revision_id,updated_at=now() FROM pipeline_runs r WHERE r.id=$1 AND r.page_id=p.id AND r.result_revision_id IS NOT NULL",
          [id],
        );
        break;
      }
      case "settings": {
        const value = pipelineSettingsSchema.parse(body.input);
        await query(
          "INSERT INTO settings(key,value) VALUES('publishing_pipeline',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          [JSON.stringify(value)],
        );
        break;
      }
      case "asset-review":
        await query(
          "UPDATE generated_assets SET review_status=$1 WHERE id=$2",
          [
            z.enum(["accepted", "rejected"]).parse(body.status),
            z.string().uuid().parse(body.id),
          ],
        );
        break;
      case "asset-review-bulk":
        await query(
          "UPDATE generated_assets SET review_status=$1 WHERE id=ANY($2::uuid[])",
          [
            z.enum(["accepted", "rejected"]).parse(body.status),
            z.array(z.string().uuid()).min(1).max(500).parse(body.ids),
          ],
        );
        break;
      case "review":
        await transaction(async (c) => {
          const id = z.string().uuid().parse(body.id),
            status = z.enum(["accepted", "rejected"]).parse(body.status);
          const run = (
            await c.query(
              "SELECT r.*,s.specification,v.content,p.template FROM pipeline_runs r JOIN page_specs s ON s.id=r.spec_id JOIN revisions v ON v.id=r.result_revision_id JOIN pages p ON p.id=r.page_id WHERE r.id=$1 AND r.status='review' FOR UPDATE OF r",
              [id],
            )
          ).rows[0];
          if (!run) throw new Error("Run is not ready for review");
          await c.query(
            "UPDATE pipeline_runs SET review_status=$1,updated_at=now() WHERE id=$2",
            [status, id],
          );
          await c.query(
            "INSERT INTO revision_reviews(revision_id,status,owner_id) VALUES($1,$2,$3) ON CONFLICT(revision_id) DO UPDATE SET status=excluded.status,owner_id=excluded.owner_id,reviewed_at=now()",
            [run.result_revision_id, status, owner.id],
          );
        });
        break;
      case "save-content":
        await transaction(async (c) => {
          const id = z.string().uuid().parse(body.id),
            content = contentSchema.parse(body.content);
          const run = (
            await c.query(
              "SELECT r.*,s.specification,p.template FROM pipeline_runs r JOIN page_specs s ON s.id=r.spec_id JOIN pages p ON p.id=r.page_id WHERE r.id=$1 AND r.status='review' FOR UPDATE OF r",
              [id],
            )
          ).rows[0];
          if (!run || content.schemaVersion !== 3)
            throw new Error("Reviewable version-three draft required");
          const spec = specForContent(run.specification as PageSpecification, content),
            paths = (
              await c.query("SELECT path FROM pages WHERE archived_at IS NULL")
            ).rows.map((r) => r.path);
          if (
            content.provenance?.runId !== id ||
            content.provenance.specificationId !== run.spec_id
          )
            throw new Error("Draft provenance does not match this run");
          validateBlueprint(spec, content.pageBlueprint);
          for (const section of spec.sections) {
            const edited = content.pageSections?.find(
              (s) => s.id === section.id,
            );
            if (!edited) throw new Error("Missing section");
            validateSectionFields(section, edited.fields, paths);
          }
          const validation = validateContent(content, getDesign(run.template));
          if (validation.errors.length)
            throw new Error(validation.errors.join("; "));
          const saved = await c.query(
            "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'owner:v3') RETURNING id",
            [run.page_id, JSON.stringify(content), JSON.stringify(validation)],
          );
          await c.query(
            "UPDATE pages SET draft_revision_id=$1,updated_at=now() WHERE id=$2 AND draft_revision_id=$3",
            [saved.rows[0].id, run.page_id, run.result_revision_id],
          );
          await c.query(
            "UPDATE pipeline_runs SET result_revision_id=$1,review_status='pending',updated_at=now() WHERE id=$2",
            [saved.rows[0].id, id],
          );
        });
        break;
      case "ses-save":
        await saveSesSettings(body.input);
        break;
      case "ses-check":
        result = await checkSes(false);
        break;
      case "ses-test":
        result = await checkSes(true);
        break;
      case "subscriber-suppress":
        await query(
          "UPDATE newsletter_subscribers SET status='suppressed',confirmation_hash=NULL,updated_at=now() WHERE id=$1",
          [z.string().uuid().parse(body.id)],
        );
        break;
      case "subscriber-delete":
        await transaction(async (c) => {
          const removed = await c.query(
            "DELETE FROM newsletter_subscribers WHERE id=$1 RETURNING email",
            [z.string().uuid().parse(body.id)],
          );
          if (removed.rows[0])
            await c.query(
              "DELETE FROM email_outbox WHERE recipient=$1 AND purpose='newsletter-confirm'",
              [removed.rows[0].email],
            );
        });
        break;
      case "outbox-retry":
        await query(
          "UPDATE email_outbox SET status='queued',attempts=0,error=NULL,next_attempt_at=now() WHERE id=$1 AND status='failed'",
          [z.string().uuid().parse(body.id)],
        );
        break;
      case "vacancy-save": {
        const v = vacancySchema.parse(body.input);
        await query(
          "INSERT INTO vacancies(id,slug,title,department,location,employment_type,description,status,verified) VALUES(COALESCE($1::uuid,gen_random_uuid()),$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,department=excluded.department,location=excluded.location,employment_type=excluded.employment_type,description=excluded.description,status=excluded.status,verified=excluded.verified,updated_at=now()",
          [
            v.id ?? null,
            v.slug,
            v.title,
            v.department,
            v.location,
            v.employment_type,
            v.description,
            v.status,
            v.verified,
          ],
        );
        break;
      }
      case "application-status":
        await query("UPDATE career_applications SET status=$1 WHERE id=$2", [
          z
            .enum(["new", "reviewing", "interview", "declined", "hired"])
            .parse(body.status),
          z.string().uuid().parse(body.id),
        ]);
        break;
      case "application-delete":
        await deleteApplication(body.id);
        break;
      case "retention":
        await query(
          "INSERT INTO settings(key,value) VALUES('career_retention_days',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          [JSON.stringify(z.number().int().min(7).max(730).parse(body.days))],
        );
        break;
      default:
        throw new Error("Unknown action");
    }
    await query(
      "INSERT INTO audit_events(owner_id,action,details) VALUES($1,$2,$3)",
      [
        owner.id,
        "publishing:" + body.action,
        JSON.stringify({ id: body.id ?? null }),
      ],
    );
    await query('INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,$2,$3)', [owner.id, 'publishing:' + body.action, body.id ?? null]);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}
