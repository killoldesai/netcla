import { requireOwner } from "@/auth";
import { query } from "@/db";
import { getDesign } from "@/designs";
import { HomePage } from "@/home/HomePage";
import { notFound } from "next/navigation";
import { preview } from "@/pages";
import { homepageContent } from "@/homepage-content";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Homepage · private site preview",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ revision?: string }>;
}) {
  try {
    await requireOwner();
  } catch {
    notFound();
  }
  const design = getDesign("software-led");
  const revision = (await searchParams).revision;
  if (revision && !/^[0-9a-f-]{36}$/i.test(revision)) notFound();
  const pages = await query<{ id: string; path: string; title: string }>(
    "SELECT id,path,title FROM pages WHERE archived_at IS NULL ORDER BY path",
  );
  const linkMap = Object.fromEntries(
    pages.map((p) => [p.path, "/admin/preview/" + p.id]),
  );
  linkMap["/"] = "/admin/site";
  const home = pages.find((p) => p.path === "/");
  const saved = home ? await preview(home.id, revision) : null;
  if (revision && !saved) notFound();
  return (
    <>
      <div className="preview-banner">
        Private connected site preview · saved homepage content ·{" "}
        <a href="/admin">Return to admin</a>
      </div>
      <HomePage
        content={
          saved
            ? homepageContent(design, saved.content)
            : {
                title: design.title,
                description: "Connected homepage preview",
                texts: design.texts,
                hiddenSections: [],
                sources: [],
                claims: [],
                unresolved: [],
              }
        }
        preview
        linkMap={linkMap}
      />
    </>
  );
}
