import { query } from "./db";
import { owner } from "./auth";
import { publicAssetUrl, readStoredFile } from "./asset-storage";

/** Serve an image by id. Unpublished images are visible to the owner only. */
export async function mediaResponse(id: string) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const [asset] = await query(
    "SELECT a.*,EXISTS(SELECT 1 FROM pages p JOIN revisions r ON r.id=p.published_revision_id WHERE r.content @> jsonb_build_object('pageSections',jsonb_build_array(jsonb_build_object('asset',jsonb_build_object('id',a.id::text))))) AS published FROM generated_assets a WHERE a.id=$1",
    [id],
  );
  if (!asset || (!asset.published && !(await owner()))) return new Response(null, { status: 404 });
  if (asset.published) {
    const cdn = await publicAssetUrl(asset);
    if (cdn) return Response.redirect(cdn, 308);
  }
  try {
    const name = (asset.seo_name || "netofficials-illustration") + ".webp";
    return new Response(new Uint8Array(await readStoredFile(asset as { filename: string; storage?: string; storage_key?: string })), {
      headers: {
        "Content-Type": asset.mime,
        "Content-Disposition": `inline; filename="${name}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": asset.published ? "public, max-age=31536000, immutable" : "private, no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
