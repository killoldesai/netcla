import { publicStudies, type CaseStudyContent } from "./case-studies";
import { industries as industryList } from "./service-directory-data";
import { servicePathByName } from "./case-study-catalog";
import { sitePage, sitePages } from "./site-structure";
import type { BlogPost } from "./blog-types";

// Links between case studies and the rest of the site. Everything is computed from the saved studies and the site
// structure when a page is rendered or generated, so a new study or a newly published page is picked up with no editing.

const servicePath = servicePathByName;
const industryPath: Record<string, string> = Object.fromEntries(industryList.map((i) => [i.name, i.path]));
const locationAliases: Record<string, string[]> = { "United Kingdom": ["uk", "united kingdom"], USA: ["usa", "united states"], India: ["india"] };

type Study = Awaited<ReturnType<typeof publicStudies>>[number];
export type StudyCard = Study;

/** Site pages a study is about: its services, industry and the location pages that match where the client is. */
export function studyPaths(c: CaseStudyContent): string[] {
  const out: string[] = [];
  for (const s of c.services) if (servicePath[s]) out.push(servicePath[s]);
  if (c.client.industry && industryPath[c.client.industry]) out.push(industryPath[c.client.industry]);
  const location = (c.client.location ?? "").toLowerCase();
  if (location)
    for (const p of sitePages)
      if (p.type === "location" && (locationAliases[p.label] ?? [p.label.toLowerCase()]).some((a) => new RegExp(`(^|[^a-z])${a}([^a-z]|$)`).test(location))) out.push(p.path);
  return [...new Set(out)];
}

const pillarOf = (path: string) => sitePage(path)?.pillar;

/** Published studies that are about this page: same service, industry or place; hubs also take any study in their pillar. */
export async function relatedStudiesFor(path: string, limit = 3, exclude?: string): Promise<Study[]> {
  const page = sitePage(path);
  const studies = await publicStudies();
  return studies
    .filter((s) => s.slug !== exclude)
    .map((s) => {
      const mine = studyPaths(s.content);
      const direct = mine.includes(path);
      const viaPillar = page?.type === "pillar" && !!page.pillar && mine.some((p) => pillarOf(p) === page.pillar);
      return { s, score: (direct ? 3 : 0) + (viaPillar ? 1 : 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

/** Other studies that share services, industry or location with this one, best match first. */
export async function similarStudies(content: CaseStudyContent, slug: string, limit = 3): Promise<Study[]> {
  const mine = new Set(studyPaths(content));
  const studies = await publicStudies();
  return studies
    .filter((s) => s.slug !== slug)
    .map((s) => ({ s, score: studyPaths(s.content).filter((p) => mine.has(p)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

const stop = new Set(["the", "and", "for", "how", "what", "your", "with", "vs", "guide", "checklist", "cost", "software", "development", "services"]);
const words = (t: string) => new Set(t.toLowerCase().match(/[a-z0-9.+#]{3,}/g)?.filter((w) => !stop.has(w)) ?? []);

/** Guides whose title, tag or description share words with the study's services, industry and keyword. */
export function guidesFor(content: CaseStudyContent, posts: BlogPost[], limit = 3): BlogPost[] {
  const mine = words([...content.services, content.client.industry, content.primaryKeyword, ...content.secondaryKeywords].join(" "));
  return posts
    .map((p) => ({ p, score: [...words(`${p.title} ${p.tag} ${p.description}`)].filter((w) => mine.has(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export type RelatedLinks = {
  services: { path: string; text: string; blurb?: string }[];
  industry?: { path: string; text: string };
  location?: { path: string; text: string };
};

/** Service, industry and location pages for a study, kept to pages that are actually live. */
export function relatedLinks(content: CaseStudyContent, live: Set<string>): RelatedLinks {
  const services = content.services
    .map((name) => ({ path: servicePath[name], text: name, blurb: servicePath[name] ? sitePage(servicePath[name])?.blurb : undefined }))
    .filter((s) => s.path && live.has(s.path));
  const ind = content.client.industry ? industryPath[content.client.industry] : undefined;
  const loc = studyPaths(content).find((p) => sitePage(p)?.type === "location");
  return {
    services,
    industry: ind && live.has(ind) ? { path: ind, text: content.client.industry } : undefined,
    location: loc && live.has(loc) ? { path: loc, text: sitePage(loc)!.label } : undefined,
  };
}

/** Case studies the page generator may link to from `specPath`, shaped like its other link options. */
export async function caseStudyLinkOptions(specPath: string) {
  const studies = await relatedStudiesFor(specPath, 3);
  return studies.map((s) => ({
    path: `/case-studies/${s.slug}`,
    label: s.content.headline || s.title,
    blurb: s.content.summary.slice(0, 140),
  }));
}

/** Paths of every published case study plus the index, for link validation and navigation. */
export async function caseStudyPaths() {
  const studies = await publicStudies();
  return studies.length ? ["/case-studies", ...studies.map((s) => `/case-studies/${s.slug}`)] : [];
}
