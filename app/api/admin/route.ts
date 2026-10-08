import { publishPage } from "@/admin-publish";
import { NextResponse } from "next/server";
import { requireOwner, assertOrigin } from "@/auth";
import { query, transaction } from "@/db";
import { contentSchema, validateContent } from "@/content";
import { blockTextFields } from "@/rich-field-modes";
import { getDesign, allDesigns } from "@/designs";
import { homepageContent } from "@/homepage-content";
import { generate, providerSchema } from "@/providers";
import { z } from "zod";
import { parse } from "csv-parse/sync";
import { contentSQL } from "@/export";
import { safeURL } from "@/content";
import { modelCatalog } from "@/model-catalog";
import { credentialStatus, saveProviderCredentials } from "@/provider-credentials";
import { readSitePlan, applySitePlan } from "@/site-plan";
import { designReady } from "@/presentation";
import { adminMetrics } from "@/admin-metrics-server";
export const dynamic = "force-dynamic";
const id = z.string().uuid();
export async function GET(req: Request) {
  try {
    await requireOwner();
    const type = new URL(req.url).searchParams.get("type");
    if (type === "ai-models") {
      try {
        return NextResponse.json(
          await modelCatalog(
            providerSchema.parse(new URL(req.url).searchParams.get("provider")),
          ),
          { headers: { "Cache-Control": "no-store" } },
        );
      } catch (e) {
        return NextResponse.json(
          {
            error: e instanceof Error ? e.message : "Model catalog unavailable",
          },
          { status: 400 },
        );
      }
    }
    if (type === "site-plan-import") {
      const inventory = readSitePlan();
      const pages = await query(
        "SELECT path,published_revision_id,archived_at FROM pages",
      );
      return NextResponse.json(
        {
          ...inventory,
          changes: {
            add: inventory.entries
              .filter((e) => !pages.some((p) => p.path === e.url))
              .map((e) => e.url),
            match: inventory.entries
              .filter((e) => pages.some((p) => p.path === e.url))
              .map((e) => e.url),
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (type === "export") {
      const data = await transaction(async (c) => {
        await c.query(
          "SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
        );
        const snapshot: Record<string, Record<string, any>[]> = {};
        for (const t of [
          "sources",
          "facts",
          "pages",
          "revisions",
          "redirects",
          "assets",
          "site_plan_imports",
          "site_plan_backups",
          "page_brief_versions",
          "page_spec_imports",
          "page_specs",
          "pipeline_runs",
          "pipeline_tasks",
          "generated_assets",
          "revision_reviews",
        ])
          snapshot[t] = (await c.query("SELECT * FROM " + t)).rows;
        return snapshot;
      });
      const sql = contentSQL(data);
      return new NextResponse(sql, {
        headers: {
          "Content-Type": "application/sql",
          "Content-Disposition": 'attachment; filename="content.sql"',
          "Cache-Control": "no-store",
        },
      });
    }
    if (type === "leads-csv") {
      const rows = await query(
        "SELECT id,status,notes,created_at,data FROM leads ORDER BY created_at DESC",
      );
      const escape = (v: unknown) => {
        let t = String(v ?? "");
        if (/^[=+@-]/.test(t)) t = "'" + t;
        return '"' + t.replaceAll('"', '""') + '"';
      };
      return new NextResponse(
        [
          "id,status,name,email,service,goal,notes,created_at",
          ...rows.map((r) =>
            [
              r.id,
              r.status,
              r.data.name,
              r.data.email,
              r.data.service,
              r.data.goal,
              r.notes,
              r.created_at,
            ]
              .map(escape)
              .join(","),
          ),
        ].join("\n"),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="leads.csv"',
            "Cache-Control": "no-store",
          },
        },
      );
    }
    const [
      metrics,
      pages,
      revisions,
      briefVersions,
      jobs,
      pageJobs,
      leads,
      facts,
      sources,
      settings,
      configured,
      heartbeat,
    ] = await Promise.all([
      adminMetrics(),
      query(
        "SELECT p.*,r.content,r.validation FROM pages p LEFT JOIN revisions r ON r.id=p.draft_revision_id ORDER BY p.path",
      ),
      query(
        "SELECT id,page_id,created_at,origin,validation FROM revisions ORDER BY created_at DESC",
      ),
      query(
        "SELECT id,page_id,brief,created_at FROM page_brief_versions ORDER BY created_at DESC",
      ),
      query(
        "SELECT * FROM jobs WHERE status IN ('queued','running') OR id IN (SELECT id FROM jobs ORDER BY created_at DESC LIMIT 200) ORDER BY created_at DESC",
      ),
      query(
        "SELECT DISTINCT ON(page_id) page_id,status,base_revision_id,error,created_at FROM jobs ORDER BY page_id,created_at DESC",
      ),
      query("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200"),
      query("SELECT * FROM facts"),
      query("SELECT * FROM sources"),
      query(
        "SELECT * FROM settings WHERE key IN ('ai','ai_model_test','publishing_pipeline','generation_defaults','ses_delivery_status','career_retention_days')",
      ),
      credentialStatus(),
      query("SELECT value FROM settings WHERE key='worker_heartbeat'"),
    ]);
    return NextResponse.json(
      {
        metrics,
        pages: pages.map((p) => {
          const design = getDesign(
            p.path === "/" ? "software-led" : p.template,
          );
          const parsed = p.content ? contentSchema.parse(p.content) : undefined;
          const content =
            parsed && p.path === "/" ? homepageContent(design, parsed) : parsed;
          return {
            ...p,
            content,
            template: p.path === "/" ? "software-led" : p.template,
            validation: content
              ? validateContent(content, design)
              : { errors: [], warnings: [] },
            designReady:
              p.path === "/" ||
              designReady({ path: p.path, template: p.template, content }),
            sections: design.sections,
            blockTextFields: blockTextFields(design),
          };
        }),
        revisions,
        briefVersions,
        jobs,
        pageJobs,
        leads,
        facts,
        sources,
        settings,
        templates: allDesigns.map((d) => ({
          id: d.id,
          title: d.title,
          kind: d.kind,
        })),
        configured,
        workerHeartbeat: heartbeat[0]?.value ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unauthorized or unavailable" },
      { status: 401 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const o = await requireOwner();
    assertOrigin(req);
    const raw = await req.text();
    if (raw.length > 2000000) throw new Error("Request too large");
    const b = JSON.parse(raw);
    const action = z.string().parse(b.action);
    let result: unknown = { ok: true };
    if (action === "site-plan-import") {
      const inventory = readSitePlan();
      if (b.checksum !== inventory.checksum)
        throw new Error("Inventory changed; preview the import again");
      result = await transaction((c) => applySitePlan(c, inventory));
    } else if (["publish", "rollback"].includes(action)) {
      const pageId = id.parse(b.id);
      const published = await publishPage(pageId, o.id, action === "rollback" ? id.parse(b.revisionId) : undefined, typeof b.override === "string" ? b.override : undefined);
      result = {ok:true,message:"Page published",liveUrl:published.path,page:published};
    } else if (action === "unpublish") {
      const [unpublished] = await query(
        "UPDATE pages SET published_revision_id=NULL,updated_at=now() WHERE id=$1 RETURNING id,title,published_revision_id,draft_revision_id,first_published_at,updated_at",
        [id.parse(b.id)],
      );
      if (!unpublished) throw new Error("Page missing");
      result = { ok: true, message: "Page unpublished", page: unpublished };
    } else if (action === "lead") {
      await query("UPDATE leads SET status=$1,notes=$2 WHERE id=$3", [
        z
          .enum(["New", "Qualified", "Unqualified", "Contacted", "Closed"])
          .parse(b.status),
        z
          .string()
          .max(5000)
          .parse(b.notes ?? ""),
        id.parse(b.id),
      ]);
    } else if (action === "source") {
      await query(
        "INSERT INTO sources(title,url,excerpt,approved) VALUES($1,$2,$3,$4)",
        [
          z.string().min(1).max(200).parse(b.title),
          b.url ? safeURL.parse(b.url) : null,
          z.string().min(1).max(60000).parse(b.excerpt),
          z.boolean().parse(b.approved),
        ],
      );
    } else if (action === "fact") {
      await query(
        "INSERT INTO facts(statement,source_id,approved) VALUES($1,$2,$3)",
        [
          z.string().min(1).max(3000).parse(b.statement),
          b.sourceId ? id.parse(b.sourceId) : null,
          z.boolean().parse(b.approved),
        ],
      );
    } else if (action === "approve-source" || action === "approve-fact") {
      const approved = z.boolean().parse(b.approved),
        entity = id.parse(b.id);
      await transaction(async (c) => {
        await c.query(
          `UPDATE ${action === "approve-source" ? "sources" : "facts"} SET approved=$1 WHERE id=$2`,
          [approved, entity],
        );
      });
    } else if (action === "provider-credentials") {
      await saveProviderCredentials(b.value);
      result = { ok: true, message: "Provider credentials saved securely" };
    } else if (action === "settings") {
      const value = z
        .object({
          provider: providerSchema,
          model: z.string().trim().min(1).max(200),
        })
        .parse(b.value);
      await query(
        "INSERT INTO settings(key,value) VALUES('ai',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [JSON.stringify(value)],
      );
      result = { ok: true, message: "Default content-generation model saved" };
    } else if (action === "test-provider") {
      const started = Date.now(),
        provider = providerSchema.parse(b.provider),
        model = z.string().trim().min(1).max(200).parse(b.model);
      const r = await generate(provider, model, 'Return only {"ok":true}', 100);
      if (
        JSON.parse(
          r.text.replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, ""),
        ).ok !== true
      )
        throw new Error("Model returned incompatible output");
      const test = {
        provider,
        model,
        testedAt: new Date().toISOString(),
        elapsedMs: Date.now() - started,
      };
      await query(
        "INSERT INTO settings(key,value) VALUES('ai_model_test',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [JSON.stringify(test)],
      );
      result = {
        ok: true,
        message: "Provider responded with valid JSON",
        usage: r.usage,
        test,
      };
    } else if (action === "redirect") {
      const from = z
          .string()
          .regex(/^\/[a-zA-Z0-9/_\-.]*$/)
          .parse(b.path),
        to = z
          .string()
          .regex(/^\/[a-zA-Z0-9/_\-.]*$/)
          .parse(b.destination);
      if (from === to) throw new Error("Redirect cannot target itself");
      const [target] = await query(
        "SELECT id FROM pages WHERE path=$1 AND published_revision_id IS NOT NULL",
        [to],
      );
      if (!target) throw new Error("Target must be a published page");
      await query(
        "INSERT INTO redirects(path,destination) VALUES($1,$2) ON CONFLICT(path) DO UPDATE SET destination=excluded.destination",
        [from, to],
      );
    } else throw new Error("Unknown action");
    await query(
      "INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,$2,$3)",
      [o.id, action, b.id ?? null],
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Operation failed" },
      { status: 400 },
    );
  }
}

