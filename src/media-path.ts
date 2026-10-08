/** Keyword URL for an image reference: /media/<id>/<seo-name>.webp (client-safe). */
export function mediaPath(asset: { id: string; name?: string }) {
  return asset.name ? `/media/${asset.id}/${asset.name}.webp` : `/media/${asset.id}`;
}
