// Creates the two hub pages that exist in the site structure but not in the database
// (/digital-marketing-services and /industries): a page row, an empty draft revision and a canonical spec.
// Dry run by default; --apply writes. Nothing is generated or published.
import { createHash } from "node:crypto";
import { pool, query, transaction } from "../src/db";
import type { PageSpecification } from "../src/page-spec-schema";
import { canonicalSpecification } from "../src/prompts/spec-text";
import { PROMPT_VERSION } from "../src/prompts/system";
import { emptyPlanContent, planBrief, type PlanEntry } from "../src/site-plan";

const apply = process.argv.includes("--apply");
const entry = (e: Pick<PlanEntry, "url" | "title" | "h1" | "cluster" | "keywords" | "scope" | "prompt">): PlanEntry => ({
  ...e,
  phase: "1",
  priority: "P0",
  pageType: "Core Service",
  headings: [],
  structure: "Hub: hero, answer-first overview, child pages, why Netofficials, supporting block, engagement models, cost factors, FAQ, related hubs, CTA",
  provenance: [],
  generationAllowed: true,
  risks: [],
  metrics: {},
});

const entries = [
  entry({
    url: "/digital-marketing-services",
    title: "Digital Marketing Services | Netofficials",
    h1: "Digital Marketing Services",
    cluster: "Digital Marketing",
    keywords: ["digital marketing services", "digital marketing company India", "SEO and PPC services", "performance marketing services"],
    scope: "Hub for SEO, technical SEO, local SEO, ecommerce SEO, Google Ads management and PPC; how organic and paid search work together; five-step process; tracking and reporting (GA4, Search Console, Google Ads); cost variables; India delivery; FAQ",
    prompt: "Write the hub page for Netofficials' digital marketing services at /digital-marketing-services. Netofficials is an India-based software and digital agency. Link to every digital marketing service page in the allowed links.",
  }),
  entry({
    url: "/industries",
    title: "Industries We Build Software For | Netofficials",
    h1: "Software Development for Your Industry",
    cluster: "Industries",
    keywords: ["industry software development", "custom software development for industries", "sector specific software development", "software development for regulated industries"],
    scope: "Hub for the eleven sector pages (healthcare, fintech, edtech, HR tech, insurtech, legal tech, logistics, manufacturing, real estate, retail, travel); compliance regimes that recur across sectors; how sector knowledge shapes scope; engagement models; cost variables; FAQ",
    prompt: "Write the hub page for Netofficials' industry software development work at /industries. List every sector page in the allowed links exactly once. Name real regulations only when certain; never claim certification.",
  }),
];

try {
  for (const e of entries) {
    const found = await query("SELECT id FROM pages WHERE path=$1", [e.url]);
    if (found.length) {
      console.log(e.url, "already exists, skipping");
      continue;
    }
    console.log(apply ? "creating" : "would create", e.url);
    if (!apply) continue;
    await transaction(async (c) => {
      const page = (
        await c.query("INSERT INTO pages(path,template,title,kind,brief) VALUES($1,'site-plan',$2,'service',$3) RETURNING *", [e.url, e.title, JSON.stringify(planBrief(e))])
      ).rows[0];
      await c.query("INSERT INTO page_brief_versions(page_id,brief) VALUES($1,$2)", [page.id, JSON.stringify(planBrief(e))]);
      const rev = await c.query("INSERT INTO revisions(page_id,content,validation,origin) VALUES($1,$2,$3,'site-plan:empty') RETURNING id", [
        page.id,
        JSON.stringify(emptyPlanContent(e)),
        JSON.stringify({ errors: ["Generate or write and review the content before publishing"], warnings: [] }),
      ]);
      await c.query("UPDATE pages SET draft_revision_id=$1 WHERE id=$2", [rev.rows[0].id, page.id]);
      const base = { path: e.url, title: e.title, databaseId: page.id, source: "seed-hubs", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;
      const { spec } = canonicalSpecification(base);
      const checksum = createHash("sha256").update(JSON.stringify({ seed: e.url, version: PROMPT_VERSION })).digest("hex");
      const imp = await c.query("INSERT INTO page_spec_imports(checksum,sources,summary) VALUES($1,$2,$3) RETURNING id", [
        checksum,
        JSON.stringify({ seedHubs: e.url }),
        JSON.stringify({ pages: 1, promptVersion: PROMPT_VERSION }),
      ]);
      await c.query("INSERT INTO page_specs(import_id,page_id,path,specification) VALUES($1,$2,$3,$4)", [imp.rows[0].id, page.id, e.url, JSON.stringify(spec)]);
      console.log("  created", page.id, "with", spec.sections.length, "sections");
    });
  }
} finally {
  await pool().end();
}
