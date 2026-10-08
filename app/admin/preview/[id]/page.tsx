import { requireOwner } from "@/auth";
import { preview } from "@/pages";
import { getDesign } from "@/designs";
import { DesignPage, Navigation, Footer } from "@/render";
import { query } from "@/db";
import { notFound, redirect } from "next/navigation";
import { PlannedContent } from "@/planned-content";
import { StructuredPage } from "@/structured-page";
import { presentationFor } from "@/presentation";
import { hubFor } from "@/service-hubs";
import { ServiceHubPage } from "@/service-hub-page";
import { ServiceDirectoryPage } from "@/service-directory-page";
import { V3Page } from "@/v3-page";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Page preview",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ revision?: string }>;
}) {
  try {
    await requireOwner();
  } catch {
    notFound();
  }
  const pageId = (await params).id,
    revision = (await searchParams).revision;
  if (
    !/^[0-9a-f-]{36}$/i.test(pageId) ||
    (revision && !/^[0-9a-f-]{36}$/i.test(revision))
  )
    notFound();
  const p = await preview(pageId, revision);
  if (!p) notFound();
  if (p.path === "/" && p.content.schemaVersion !== 3)
    redirect("/admin/site" + (revision ? "?revision=" + revision : ""));
  const design = getDesign(p.template);
  const presentation =
    p.content.schemaVersion === 2 ? presentationFor(p.path) : undefined;
  const entries = await query(
    "SELECT id,path,title,kind FROM pages WHERE archived_at IS NULL",
  );
  const linkMap = Object.fromEntries(
    entries.map((x) => [x.path, "/admin/preview/" + x.id]),
  );
  linkMap["/"] = "/admin/site";
  linkMap["/design-library"] = "/admin/designs";
  linkMap["/form-states"] = "/admin/form-states";
  if (p.content.schemaVersion === 3) return <V3Page content={p.content} path={p.path} paths={entries.map(e => e.path)} preview linkMap={linkMap}/>;
  if (p.path === "/services")
    return (
      <>
        <div className="preview-banner">
          Private revision preview · forms do not send data ·{" "}
          <a href="/admin">Return to admin</a>
        </div>
        <ServiceDirectoryPage preview linkMap={linkMap} />
      </>
    );
  if (hubFor(p.path))
    return (
      <>
        <div className="preview-banner">
          Private revision preview · forms do not send data ·{" "}
          <a href="/admin">Return to admin</a>
        </div>
        <ServiceHubPage
          path={p.path}
          content={p.content}
          preview
          linkMap={linkMap}
          listing={entries.map((e) => ({
            path: e.path,
            title: e.title,
            kind: e.kind,
          }))}
        />
      </>
    );
  return (
    <div className={presentation ? "csv-frame" : undefined}>
      {design.styles.map((s) => (
        <link rel="stylesheet" href={s} key={s} />
      ))}
      {presentation && (
        <link rel="stylesheet" href="/assets/structured-site.css" />
      )}
      {p.content.schemaVersion === 2 && !presentation && (
        <link rel="stylesheet" href="/assets/plan-preview.css" />
      )}
      <div className="preview-banner">
        Private revision preview · forms do not send data ·{" "}
        <a href="/admin">Return to admin</a>
      </div>
      <Navigation
        paths={[]}
        preview
        linkMap={linkMap}
        pages={entries.map((e) => ({ path: e.path, title: e.title }))}
      />
      <main id="main">
        {presentation ? (
          <StructuredPage
            content={p.content}
            presentation={presentation}
            preview
            linkMap={linkMap}
            listing={entries.map((e) => ({
              path: e.path,
              title: e.title,
              kind: e.kind,
            }))}
          />
        ) : p.content.schemaVersion === 2 ? (
          <PlannedContent content={p.content} />
        ) : (
          <DesignPage
            design={design}
            content={p.content}
            preview
            linkMap={linkMap}
          />
        )}
      </main>
      <Footer paths={[]} preview linkMap={linkMap} />
    </div>
  );
}
