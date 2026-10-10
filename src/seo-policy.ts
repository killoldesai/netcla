import { mediaPath } from "./media-path";

/** Published pages that exist for visitors, not for search: kept out of the sitemap and served with noindex. */
const utilityPaths = new Set(["/404", "/thank-you"]);

export const isIndexable = (path: string) => !utilityPaths.has(path);

/** Fallback share image (1200x630) for pages whose own hero is missing or is not a raster image. */
export const defaultShareImage = { url: "/assets/og-default.png", width: 1200, height: 630, alt: "Netofficials" };

type Asset = { id: string; name?: string; src?: string; alt?: string; width?: number; height?: number };

/** The page's first section image as an Open Graph image, else the default share image. */
export function shareImage(content: { pageSections?: { asset?: Asset; omitted?: boolean }[] }) {
  const asset = content.pageSections?.find((s) => !s.omitted && s.asset && !s.asset.src)?.asset;
  if (!asset) return defaultShareImage;
  return {
    url: mediaPath(asset),
    ...(asset.width && asset.height ? { width: asset.width, height: asset.height } : {}),
    alt: asset.alt || defaultShareImage.alt,
  };
}
