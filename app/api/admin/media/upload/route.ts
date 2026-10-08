import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { assertOrigin, requireOwner } from "@/auth";
import { query } from "@/db";
import { imageExif, storeFile } from "@/asset-storage";
import { seoFilename } from "@/prompts/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });

/** Owner image upload: re-encoded to WebP (drops metadata and any embedded payload). */
export async function POST(request: Request) {
  let owner;
  try {
    owner = await requireOwner();
    assertOrigin(request);
  } catch {
    return json({ error: "Unauthorized" }, 401);
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
    if (!(file instanceof File)) throw new Error("Choose an image file");
    if (!allowed.has(file.type)) throw new Error("Upload a PNG, JPEG or WebP image");
    if (file.size > MAX_BYTES) throw new Error("Images must be 8 MB or smaller");
    if (alt.length < 10) throw new Error("Describe the image in at least 10 characters of alt text");
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 8192 * 8192 }).rotate();
    const meta = await image.metadata();
    if (!meta.width || !meta.height) throw new Error("Unreadable image");
    const optimized = await image
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .withExif(imageExif(alt))
      .webp({ quality: 86 })
      .toBuffer({ resolveWithObject: true });
    const hash = createHash("sha256").update(optimized.data).digest("hex");
    const stored = await storeFile(hash + ".webp", optimized.data, "image/webp", { author: "Netofficials" });
    const name = seoFilename(String(form.get("name") ?? "") || alt);
    const id = randomUUID();
    await query(
      "INSERT INTO generated_assets(id,hash,filename,mime,width,height,alt,source_prompt,provider,model,review_status,seo_name,storage,storage_key) VALUES($1,$2,$3,'image/webp',$4,$5,$6,'Uploaded by owner','upload','owner','accepted',$7,$8,$9)",
      [id, hash, hash + ".webp", optimized.info.width, optimized.info.height, alt, name, stored.storage, stored.key],
    );
    await query("INSERT INTO audit_events(owner_id,action,entity_id) VALUES($1,'media:upload',$2)", [owner.id, id]);
    return json({
      ok: true,
      asset: { id, hash, alt, width: optimized.info.width, height: optimized.info.height, mime: "image/webp", name },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Upload failed" }, 400);
  }
}
