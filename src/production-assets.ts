import { imageExif, storeFile } from "./asset-storage";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { query } from "./db";
import { providerCredentials } from "./provider-credentials";
import { iconKeys } from "./page-spec-schema";
import { load } from "cheerio";
import sharp from "sharp";

export const assetRoot = () =>
  path.resolve(process.env.PERSISTENT_ASSET_DIR ?? ".data/assets");
export function validateSprite(svg: string) {
  if (
    Buffer.byteLength(svg) > 150000 ||
    /<!DOCTYPE|<!ENTITY|<script|<foreignObject|<image|<style|<filter|gradient|\bon\w+\s*=|(?:href|src)\s*=|url\(/i.test(
      svg,
    )
  )
    throw new Error("Unsafe SVG sprite");
  const $ = load(svg, { xml: true });
  const allowed = new Set([
    "svg",
    "symbol",
    "g",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
  ]);
  const attrs = new Set([
    "xmlns",
    "id",
    "viewBox",
    "width",
    "height",
    "x",
    "y",
    "x1",
    "x2",
    "y1",
    "y2",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "d",
    "points",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "transform",
  ]);
  $("*").each((_, el) => {
    if (el.type !== "tag" || !allowed.has(el.name))
      throw new Error("Unsupported SVG element");
    for (const [key, value] of Object.entries(el.attribs)) {
      if (!attrs.has(key) || /[<>]|javascript:|data:|url\(/i.test(value))
        throw new Error("Unsafe SVG attribute");
      if (
        ["fill", "stroke"].includes(key) &&
        !["none", "#533afd", "#ffffff", "currentColor"].includes(value)
      )
        throw new Error("Unsupported sprite color");
    }
  });
  const ids = $("symbol")
    .map((_, el) => $(el).attr("id"))
    .get();
  if (
    ids.length !== 20 ||
    new Set(ids).size !== 20 ||
    iconKeys.some((key) => !ids.includes(key))
  )
    throw new Error("Sprite requires the twenty exact icon keys");
  $("symbol").each((_, el) => {
    if ($(el).attr("viewBox") !== "0 0 40 40")
      throw new Error("Invalid icon viewBox");
  });
  return $.xml();
}
export async function imageModels() {
  const response = await fetch("https://openrouter.ai/api/v1/images/models", {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("Image capability discovery unavailable");
  return (await response.json()).data as Record<string, any>[];
}
export async function generateHero(input: {
  runId: string;
  sectionId: string;
  model: string;
  quality?: string;
  prompt: string;
  ratio: string;
  alt: string;
  taskId?: string;
  name?: string;
  caption?: string;
}) {
  const credentials = await providerCredentials("openrouter");
  if (credentials.provider !== "openrouter")
    throw new Error("Image provider unavailable");
  const selected = (await imageModels()).find((m) => m.id === input.model);
  if (!selected) throw new Error("Image model is unavailable");
  const endpointResponse = await fetch(
    "https://openrouter.ai/api/v1/images/models/" + input.model + "/endpoints",
    { signal: AbortSignal.timeout(20000) },
  );
  if (!endpointResponse.ok)
    throw new Error("Image endpoint capability discovery unavailable");
  const endpoints = (await endpointResponse.json()).endpoints as Record<
    string,
    any
  >[];
  const endpoint = endpoints?.find((e) =>
    e.supported_parameters?.aspect_ratio?.values?.includes(input.ratio),
  );
  if (!endpoint)
    throw new Error("No image endpoint supports the required aspect ratio");
  const parameters: Record<string, unknown> = {};
  const supported = endpoint.supported_parameters;
  if (supported.quality?.values?.includes(input.quality ?? "medium")) parameters.quality = input.quality ?? "medium";
  if (supported.output_format?.values?.includes("png"))
    parameters.output_format = "png";
  if (supported.resolution?.values?.includes("1K"))
    parameters.resolution = "1K";
  if (endpoint.provider_tag)
    parameters.provider = {
      order: [endpoint.provider_tag],
      allow_fallbacks: false,
    };
  const ratioCapability = Array.isArray(supported)
    ? supported.includes("aspect_ratio")
      ? {}
      : null
    : supported.aspect_ratio;
  if (
    ratioCapability &&
    (!ratioCapability.values || ratioCapability.values.includes(input.ratio))
  )
    parameters.aspect_ratio = input.ratio;
  // The style system (flat, brand palette, no text or gradients) is part of the
  // prompt built in src/prompts/images.ts.
  const prompt = input.prompt;
  if (input.taskId)
    await query("UPDATE pipeline_tasks SET request_snapshot=$1 WHERE id=$2", [
      JSON.stringify({
        originalPrompt: input.prompt,
        effectiveRequest: { model: input.model, prompt, ...parameters },
        ratio: input.ratio,
        endpointCapabilities: endpoint.supported_parameters,
        pricing: endpoint.pricing,
      }),
      input.taskId,
    ]);
  const response = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + credentials.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: input.model, prompt, ...parameters }),
    signal: AbortSignal.timeout(480000),
  });
  if (!response.ok) throw new Error("Image request failed: " + response.status);
  const result = await response.json();
  if (input.taskId)
    await query("UPDATE pipeline_tasks SET usage=$1 WHERE id=$2", [
      JSON.stringify(result.usage ?? {}),
      input.taskId,
    ]);
  const item = result.data?.[0];
  if (!item?.b64_json || item.media_type !== "image/png")
    throw new Error(
      "Image provider must return a PNG source; remote images are not fetched",
    );
  const bytes = Buffer.from(item.b64_json, "base64");
  if (
    bytes.length > 20000000 ||
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error("Invalid PNG image");
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20);
  if (!width || !height || width > 8192 || height > 8192)
    throw new Error("Invalid image dimensions");
  const [rw, rh] = input.ratio.split(":").map(Number);
  if (rw && rh && Math.abs(width / height - rw / rh) > 0.08)
    throw new Error("Image dimensions do not match the specified ratio");
  const optimized = await sharp(bytes, { limitInputPixels: 8192 * 8192 })
    .withExif(imageExif(input.alt))
    .webp({ quality: 86 })
    .toBuffer();
  const sourceHash = createHash("sha256").update(bytes).digest("hex"),
    sourceFilename = sourceHash + ".png";
  const hash = createHash("sha256").update(optimized).digest("hex"),
    id = randomUUID(),
    filename = hash + ".webp";
  // The PNG master stays on local disk; the served WebP goes to the active store.
  await mkdir(assetRoot(), { recursive: true });
  await writeFile(path.join(assetRoot(), sourceFilename), bytes, {
    flag: "wx",
  }).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "EEXIST") throw e;
  });
  const stored = await storeFile(filename, optimized, "image/webp", { author: "Netofficials" });
  await query(
    "INSERT INTO generated_assets(id,run_id,section_id,hash,filename,mime,width,height,alt,source_prompt,provider,model,source_filename,source_hash,source_mime,seo_name,caption,storage,storage_key) VALUES($1,$2,$3,$4,$5,'image/webp',$6,$7,$8,$9,'openrouter',$10,$11,$12,'image/png',$13,$14,$15,$16)",
    [
      id,
      input.runId,
      input.sectionId,
      hash,
      filename,
      width,
      height,
      input.alt,
      prompt,
      input.model,
      sourceFilename,
      sourceHash,
      input.name ?? null,
      input.caption ?? null,
      stored.storage,
      stored.key,
    ],
  );
  return {
    reference: {
      id,
      hash,
      alt: input.alt,
      width,
      height,
      mime: "image/webp" as const,
      ...(input.name ? { name: input.name } : {}),
      ...(input.caption ? { caption: input.caption } : {}),
    },
    usage: result.usage ?? {},
    reviewRequired: true,
  };
}
export async function readAsset(filename: string) {
  if (!/^[a-f0-9]{64}\.(png|webp|svg)$/.test(filename))
    throw new Error("Invalid asset filename");
  return readFile(path.join(assetRoot(), filename));
}
