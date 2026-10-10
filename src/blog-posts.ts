import { query } from "./db";
import type { BlogPost } from "./blog-types";

/**
 * Guides for the /blog index. The public site lists published guides only; the owner's preview also lists drafts
 * (the latest draft where one exists) so the index can be reviewed with real content before anything is live.
 */
export async function blogPosts({ drafts = false }: { drafts?: boolean } = {}): Promise<BlogPost[]> {
  const rows = await query<any>(
    `SELECT p.path, p.first_published_at, p.updated_at, v.content
     FROM pages p JOIN revisions v ON v.id = ${drafts ? "COALESCE(p.draft_revision_id, p.published_revision_id)" : "p.published_revision_id"}
     WHERE p.path LIKE '/blog/%' AND p.archived_at IS NULL
     ORDER BY COALESCE(p.first_published_at, p.updated_at) DESC, p.path`,
  );
  const words = (v: string) => v.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return rows
    .filter((r) => r.content?.schemaVersion === 3)
    .map((r) => {
      const sections: any[] = r.content.pageSections ?? [];
      const hero = sections.find((s) => s.id === "hero");
      const body = sections.filter((s) => s.id === "key-takeaways" || /^editorial-\d+$/.test(s.id));
      const total = body.reduce((n, s) => n + Object.values<any>(s.fields).reduce((m, v) => m + (typeof v === "string" ? words(v) : 0), 0), 0);
      const date = r.first_published_at ?? r.updated_at;
      return {
        path: r.path as string,
        title: String(hero?.fields?.h1 || r.content.title || ""),
        tag: String(hero?.fields?.tag_pill || ""),
        description: String(r.content.seo?.metaDescription || r.content.description || ""),
        readMinutes: Math.max(1, Math.round(total / 230)),
        date: date ? new Date(date).toISOString() : undefined,
        image: hero?.asset ? { id: hero.asset.id, alt: hero.asset.alt, width: hero.asset.width, height: hero.asset.height } : undefined,
      };
    })
    .filter((p) => p.title);
}
