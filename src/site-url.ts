/**
 * The public origin without a trailing slash, so joining it with a path ("/about") can never produce "//about",
 * whatever the SITE_URL environment value looks like ("https://example.com" or "https://example.com/").
 */
export function siteUrl(fallback = "http://localhost:3000"): string {
  return (process.env.SITE_URL?.trim() || fallback).replace(/\/+$/, "");
}

/** Absolute URL for a site path. The home page is the origin plus a single slash; every other path has none at the end. */
export function absoluteUrl(path: string): string {
  const clean = "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
  return siteUrl() + clean;
}
