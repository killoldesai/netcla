import { absoluteUrl } from "@/site-url";
import { publishedPaths } from "@/pages";
import { isIndexable } from "@/seo-policy";
import { company } from "@/company";
import { publicStudies } from "@/case-studies";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  if (!process.env.DATABASE_URL || process.env.STAGING !== "false") return [];
  const pages = (await publishedPaths()).filter((p) => isIndexable(p.path)).map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.updated_at,
  }));
  const studies = await publicStudies();
  const caseStudies = studies.length ? [{ url: absoluteUrl("/case-studies") }, ...studies.map((c) => ({ url: absoluteUrl("/case-studies/" + c.slug), lastModified: c.publishedAt ?? undefined }))] : [];
  return [...pages, ...caseStudies, { url: absoluteUrl(company.founder.path) }];
}
