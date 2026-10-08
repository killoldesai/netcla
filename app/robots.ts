export const dynamic = "force-dynamic";
export default function robots() {
  const staging = process.env.STAGING !== "false";
  return {
    rules: {
      userAgent: "*",
      allow: staging ? undefined : "/",
      disallow: staging ? "/" : ["/admin/", "/api/", "/design-preview/"],
    },
    sitemap: staging
      ? undefined
      : (process.env.SITE_URL ?? "http://localhost:3000") + "/sitemap.xml",
  };
}
