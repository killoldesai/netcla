import { query } from "./db";
import type { Content } from "./content";

/**
 * Fills each image's keyword file name and caption from its generated_assets
 * row. Revisions are immutable, so older revisions (written before names were
 * stored on the reference) get their SEO name here at render time.
 */
export async function withAssetNames(content: Content): Promise<Content> {
  const sections = ((content as any).pageSections ?? []) as { asset?: { id: string; name?: string; caption?: string } }[];
  const ids = [...new Set(sections.map((s) => s.asset?.id).filter((id): id is string => !!id))];
  if (!ids.length) return content;
  const rows = await query<{ id: string; seo_name: string | null; caption: string | null }>(
    "SELECT id::text id, seo_name, caption FROM generated_assets WHERE id = ANY($1::uuid[])",
    [ids],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  return {
    ...content,
    pageSections: sections.map((s) => {
      const row = s.asset && byId.get(s.asset.id);
      if (!s.asset || !row) return s;
      return {
        ...s,
        asset: {
          ...s.asset,
          ...(row.seo_name ? { name: row.seo_name } : {}),
          ...(!s.asset.caption && row.caption ? { caption: row.caption } : {}),
        },
      };
    }),
  } as Content;
}
