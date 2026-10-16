import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { owner } from "@/auth";
import { query } from "@/db";
import { finalizeMeta, publicStudy } from "@/case-studies";
import { CaseStudyView } from "@/case-study-page";
import { blogPosts } from "@/blog-posts";
import { caseStudyPaths, guidesFor, relatedLinks, similarStudies } from "@/case-study-related";
import { mediaPath } from "@/media-path";
import { defaultShareImage } from "@/seo-policy";
import { absoluteUrl } from "@/site-url";

// Public case study. Published studies are visible to everyone; the owner can also preview drafts.
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

const load = async (slug: string) => publicStudy(slug, !!(await owner()));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!process.env.DATABASE_URL) return { robots: { index: false, follow: false } };
  const found = await load((await params).slug);
  if (!found) return { robots: { index: false, follow: false } };
  const { study, content: c, images } = found;
  // The cover image is the share image (og:image and twitter:image) as an absolute URL; studies without one use the site default.
  const cover = images.find((i: any) => i.slot === "cover") ?? images[0];
  const image = cover
    ? { url: absoluteUrl(mediaPath({ id: cover.asset_id, name: cover.seo_name ?? undefined })), width: cover.width, height: cover.height, alt: cover.alt || cover.asset_alt }
    : { ...defaultShareImage, url: absoluteUrl(defaultShareImage.url) };
  // Older or hand-written studies without a keyword-bearing title or description are repaired at render time.
  const meta = finalizeMeta(c, study.title);
  const title = meta.metaTitle;
  const description = meta.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: "/case-studies/" + study.slug },
    ...(study.status === "published" ? {} : { robots: { index: false, follow: false } }),
    openGraph: { title, description, url: "/case-studies/" + study.slug, siteName: "Netofficials", type: "article", ...(study.published_at ? { publishedTime: new Date(study.published_at).toISOString() } : {}), images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function Page({ params }: Props) {
  if (!process.env.DATABASE_URL) notFound();
  const found = await load((await params).slug);
  if (!found) notFound();
  const pagePaths = (await query("SELECT path FROM pages WHERE published_revision_id IS NOT NULL")).map((p) => p.path as string);
  const paths = [...pagePaths, ...(await caseStudyPaths())];
  const [studies, posts] = await Promise.all([similarStudies(found.content, found.study.slug), blogPosts().catch(() => [])]);
  const related = { links: relatedLinks(found.content, new Set(pagePaths)), studies, guides: guidesFor(found.content, posts) };
  return <CaseStudyView title={found.study.title} content={found.content} images={found.images as any} paths={paths} preview={found.study.status !== "published"} related={related} />;
}
