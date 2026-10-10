import { absoluteUrl } from "@/site-url";
import { publishedPaths } from "@/pages";
import { isIndexable } from "@/seo-policy";
import { company } from "@/company";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  if (!process.env.DATABASE_URL || process.env.STAGING !== "false") return [];
  const pages = (await publishedPaths()).filter((p) => isIndexable(p.path)).map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.updated_at,
  }));
  return [...pages, { url: absoluteUrl(company.founder.path) }];
}
