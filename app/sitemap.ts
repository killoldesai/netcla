import { publishedPaths } from "@/pages";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  if (!process.env.DATABASE_URL || process.env.STAGING !== "false") return [];
  return (await publishedPaths()).map((p) => ({
    url: (process.env.SITE_URL ?? "http://localhost:3000") + p.path,
    lastModified: p.updated_at,
  }));
}
