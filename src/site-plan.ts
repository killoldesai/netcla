import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type { Content } from "./content";
import bundledInventory from "./templates/site-plan.json";
import { faqRequirements } from "./faq-requirements";
export function validatePlanned(
  content: Content,
  brief: Record<string, any>,
  paths: string[],
) {
  const errors: string[] = [];
  if (content.schemaVersion !== 2)
    errors.push("Site Plan pages require structured content version 2");
  for (const h of brief.headings ?? []) {
    if (content.hiddenSections?.includes(h.id))
      errors.push("Required CSV section cannot be hidden: " + h.heading);
    const s = content.sections?.find((s) => s.id === h.id);
    if (!s || s.heading !== h.heading || s.level !== h.level)
      errors.push("Required heading mismatch: " + h.heading);
  }
  for (const requirement of faqRequirements(brief)) {
    const section = content.sections?.find((s) => s.id === requirement.id);
    const complete =
      section?.faqs.filter((f) => f.question.trim() && f.answer.trim()) ?? [];
    if (complete.length < requirement.minimum)
      errors.push(
        `FAQ section "${requirement.heading}" requires at least ${requirement.minimum} complete question-and-answer pairs`,
      );
    if (section?.faqs.some((f) => !f.question.trim() || !f.answer.trim()))
      errors.push(
        `FAQ section "${requirement.heading}" contains a blank question or answer`,
      );
  }
  if (
    content.sections?.some(
      (s) => !(brief.headings ?? []).some((h: any) => h.id === s.id),
    )
  )
    errors.push("Unknown section identifier");
  const links = [
    content.hero?.ctaPath,
    ...(content.sections ?? []).flatMap((s) => s.links.map((l) => l.path)),
  ].filter(Boolean);
  for (const url of links)
    if (!paths.includes(url!)) errors.push("Unresolved page reference: " + url);
  return errors;
}
type Row = Record<string, string>;
export type PlanEntry = {
  url: string;
  title: string;
  h1: string;
  cluster: string;
  phase: string;
  priority: string;
  pageType: string;
  keywords: string[];
  headings: { id: string; level: 2 | 3; heading: string }[];
  structure: string;
  scope: string;
  prompt: string;
  provenance: { file: string; pageId: string }[];
  generationAllowed: boolean;
  risks: string[];
  metrics: Record<string, string>;
};
const baseDir = path.join(
  process.cwd(),
  "research docs",
  "Claude",
  "Netofficials",
);
export function readSitePlan() {
  if (!fs.existsSync(baseDir))
    return bundledInventory as unknown as ReturnType<typeof readSourceSitePlan>;
  return readSourceSitePlan();
}
export function readSourceSitePlan() {
  const files = fs
    .readdirSync(baseDir)
    .filter((n) => /^\d\d_.*\.csv$/.test(n))
    .sort();
  const inputs = files.map((file) => ({
    file,
    text: fs.readFileSync(path.join(baseDir, file), "utf8"),
  }));
  const checksum = createHash("sha256")
    .update(JSON.stringify(inputs))
    .digest("hex");
  const rows: Row[] = inputs
    .filter((f) => !f.file.startsWith("00_"))
    .flatMap((f) =>
      (
        parse(f.text, {
          columns: true,
          bom: true,
          skip_empty_lines: true,
        }) as Row[]
      ).map((r) => ({ ...r, file: f.file })),
    );
  const master = parse(inputs.find((f) => f.file.startsWith("00_"))!.text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
  }) as Row[];
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    if (
      !/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(row.url) ||
      !row.master_ai_prompt ||
      !row.h1
    )
      throw new Error("Invalid inventory row " + row.page_id);
    groups.set(row.url, [...(groups.get(row.url) ?? []), row]);
  }
  const entries: PlanEntry[] = [...groups].map(([url, group]) => {
    const preferred =
      url === "/seo-services"
        ? group.find((r) => r.file.startsWith("12_"))
        : group.find((r) => r.file.startsWith("06_"));
    const r = preferred ?? group[0];
    const raw = [
      ...new Set(
        r.h2_structure
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    const risks: string[] = [];
    const prompt = [r, ...group.filter((g) => g !== r)]
      .map((g) => g.master_ai_prompt)
      .join(
        "\n\nSupplementary scope only (use the reconciled heading schema, not these competing heading instructions):\n",
      );
    if (/HIPAA|GDPR|SOC 2|ISO|Premier Partner/i.test(prompt))
      risks.push(
        "Verify compliance, credentials and contractual claims before use",
      );
    if (/\$\d|40-60%|\d+-day|\d+ to \d+ Weeks/i.test(prompt))
      risks.push("Verify prices, savings, delivery and support commitments");
    if (r.page_type === "Location")
      risks.push(
        "Verify location-specific usefulness and actual working-hour overlap; do not imply a local office",
      );
    const headings = raw.map((heading, i) => ({
      id: "section-" + (i + 1),
      level: (/^H3:/.test(heading) ? 3 : 2) as 2 | 3,
      heading: heading.replace(/^H[23]:\s*/, ""),
    }));
    return {
      url,
      title: r.meta_title,
      h1: r.h1,
      cluster: r.cluster,
      phase: r.phase,
      priority: r.priority,
      pageType: r.page_type,
      keywords: [r.primary_keyword, ...r.secondary_keywords.split(",")]
        .map((s) => s.trim())
        .filter(Boolean),
      headings,
      structure: group.map((g) => g.page_structure).join("\n"),
      scope: group.map((g) => g.content_scope).join("\n"),
      prompt,
      provenance: group.map((g) => ({ file: g.file, pageId: g.page_id })),
      generationAllowed: !["/portfolio", "/case-studies", "/careers"].includes(
        url,
      ),
      risks,
      metrics: {
        searchVolume: r.search_volume,
        keywordDifficulty: r.keyword_difficulty,
        serpFeatures: r.serp_features,
        database: "unverified",
        date: "unverified",
      },
    };
  });
  const report = {
    sourceRows: rows.length,
    uniquePages: entries.length,
    duplicates: [...groups]
      .filter(([, g]) => g.length > 1)
      .map(([url, g]) => ({ url, sources: g.map((r) => r.page_id) })),
    idUrlConflicts: rows.filter(
      (r) => master.find((m) => m.page_id === r.page_id)?.url !== r.url,
    ).length,
    masterOnly: master.filter((m) => !groups.has(m.url)).map((m) => m.url),
  };
  return { checksum, entries, report };
}
export function planBrief(e: PlanEntry) {
  return {
    sitePlan: true,
    version: 2,
    ...e,
    audience: "Global B2B buyers; India-based delivery",
    intent: e.pageType,
    primaryKeyword: e.keywords[0],
    evidenceApproved: false,
    designReady: false,
    promptVersion: "site-plan-v2",
  };
}
export function emptyPlanContent(e: PlanEntry) {
  return {
    schemaVersion: 2,
    title: e.title,
    description: "",
    texts: {},
    hero: {
      heading: e.h1,
      body: "",
      ctaLabel: "Discuss your project",
      ctaPath: "/contact",
    },
    sections: e.headings.map((h) => ({
      ...h,
      paragraphs: [],
      items: [],
      cards: [],
      table: { columns: [], rows: [] },
      faqs: [],
      links: [],
    })),
    sources: [],
    claims: [],
    hiddenSections: [],
    unresolved: ["Content has not been generated or reviewed."],
  };
}
export async function applySitePlan(c: PoolClient, inventory = readSitePlan()) {
  await c.query(
    "SELECT pg_advisory_xact_lock(hashtext('netofficials-site-plan'))",
  );
  const existing = await c.query(
    "SELECT id FROM site_plan_imports WHERE checksum=$1",
    [inventory.checksum],
  );
  if (existing.rowCount)
    return {
      message:
        "This inventory has already been imported; existing edits were preserved.",
      ...inventory.report,
    };
  const snapshot: Record<string, unknown> = {};
  for (const table of [
    "pages",
    "revisions",
    "redirects",
    "page_brief_versions",
  ])
    snapshot[table] = (await c.query("SELECT * FROM " + table)).rows;
  const imported = await c.query(
    "INSERT INTO site_plan_imports(checksum,inventory,report) VALUES($1,$2,$3) RETURNING id",
    [
      inventory.checksum,
      JSON.stringify(inventory.entries),
      JSON.stringify(inventory.report),
    ],
  );
  await c.query(
    "INSERT INTO site_plan_backups(import_id,snapshot) VALUES($1,$2)",
    [imported.rows[0].id, JSON.stringify(snapshot)],
  );
  const urls = inventory.entries.map((e) => e.url);
  const archived = await c.query(
    "UPDATE pages SET archived_at=now() WHERE published_revision_id IS NULL AND kind NOT IN ('article') AND path<>ALL($1::text[]) AND path NOT IN ('/blog','/privacy-policy','/terms','/thank-you','/404') AND archived_at IS NULL RETURNING id",
    [urls],
  );
  await c.query(
    "UPDATE jobs SET status='cancelled',lease_token=NULL,lease_until=NULL WHERE page_id=ANY($1::uuid[]) AND status IN ('queued','running')",
    [archived.rows.map((p) => p.id)],
  );
  for (const e of inventory.entries) {
    const kind = e.generationAllowed
      ? e.pageType === "Homepage" ||
        [
          "Company Verification",
          "Trust",
          "Qualified Enquiry",
          "Service Directory",
        ].includes(e.pageType)
        ? "company"
        : "service"
      : "manual";
    const p = await c.query(
      "INSERT INTO pages(path,template,title,kind,brief) VALUES($1,$2,$3,$4,$5) ON CONFLICT(path) DO UPDATE SET brief=pages.brief||excluded.brief,archived_at=NULL,updated_at=now() RETURNING *",
      [e.url, "site-plan", e.title, kind, JSON.stringify(planBrief(e))],
    );
    const page = p.rows[0];
    await c.query(
      "INSERT INTO page_brief_versions(page_id,brief) VALUES($1,$2)",
      [page.id, JSON.stringify(planBrief(e))],
    );
    // Preserve published templates/revisions. New drafts use the new content schema.
    if (!page.published_revision_id) {
      await c.query("UPDATE pages SET template=$1,kind=$2 WHERE id=$3", [
        "site-plan",
        kind,
        page.id,
      ]);
    }
    const r = await c.query(
      "INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'site-plan:empty') RETURNING id",
      [
        page.id,
        JSON.stringify(emptyPlanContent(e)),
        JSON.stringify({
          errors: [
            "Generate or write and review the content before publishing",
          ],
          warnings: e.risks,
        }),
      ],
    );
    await c.query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [
      r.rows[0].id,
      page.id,
    ]);
  }
  return {
    message: `Imported ${inventory.entries.length} planned pages; archived ${archived.rowCount} superseded drafts. No generation or publishing was started.`,
    ...inventory.report,
  };
}
