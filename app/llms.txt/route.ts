import { publishedPaths } from "@/pages";
import { pillars, sitePage, sitePages } from "@/site-structure";

export const dynamic = "force-dynamic";

// llms.txt (llmstxt.org): a plain map of the site for AI assistants and crawlers.
export async function GET() {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const live = process.env.DATABASE_URL ? new Set((await publishedPaths()).map((p) => p.path)) : new Set<string>();
  const line = (path: string) => {
    const page = sitePage(path);
    return page ? `- [${page.label}](${base}${path}): ${page.blurb}` : `- [${path}](${base}${path})`;
  };
  const out = [
    "# Netofficials",
    "",
    "> Netofficials is an India-based software development company building custom software, mobile apps, AI and machine learning systems, cloud infrastructure and websites for businesses in the US, UK, Australia and beyond. Clients can also hire dedicated developers.",
    "",
  ];
  for (const pillar of pillars) {
    const pages = [pillar.hub, ...sitePages.filter((p) => p.pillar === pillar.id && p.type !== "pillar").map((p) => p.path)].filter((p) => live.has(p));
    if (!pages.length) continue;
    out.push(`## ${pillar.label}`, "", ...pages.map(line), "");
  }
  const guides = [...live].filter((p) => p.startsWith("/blog/")).sort();
  if (guides.length) out.push("## Guides", "", ...guides.map(line), "");
  const company = ["/about", "/how-we-work", "/engagement-models", "/why-choose-netofficials", "/faq", "/contact"].filter((p) => live.has(p));
  if (company.length) out.push("## Company", "", ...company.map(line), "");
  return new Response(out.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
