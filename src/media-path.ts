/** Keyword URL for an image reference: /media/<id>/<seo-name>.webp (client-safe). */
export function mediaPath(asset: { id: string; name?: string; src?: string }) {
  // Built-in pages (e.g. the default 404) point at a static file instead of a generated asset.
  if (asset.src) return asset.src;
  return asset.name ? `/media/${asset.id}/${asset.name}.webp` : `/media/${asset.id}`;
}
