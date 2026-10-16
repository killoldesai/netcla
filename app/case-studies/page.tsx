import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/db";
import { publicStudies } from "@/case-studies";
import { CaseStudyIndex } from "@/case-study-page";
import { caseStudyPaths } from "@/case-study-related";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case Studies | Netofficials",
  description: "How software projects were scoped and delivered: the problem, what Netofficials built and what changed for the business.",
  alternates: { canonical: "/case-studies" },
};

export default async function Page() {
  if (!process.env.DATABASE_URL) notFound();
  const [studies, pagePaths, extra] = await Promise.all([
    publicStudies(),
    query("SELECT path FROM pages WHERE published_revision_id IS NOT NULL").then((r) => r.map((p) => p.path as string)),
    caseStudyPaths(),
  ]);
  const paths = [...pagePaths, ...extra];
  return <CaseStudyIndex studies={studies} paths={paths} />;
}
