import { blogPosts } from "@/blog-posts";
import { published, publishedPaths, publishedListing } from "@/pages";
import { getDesign, pagePath } from "@/designs";
import { DesignPage, Navigation, Footer } from "@/render";
import { HomePage } from "@/home/HomePage";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { query } from "@/db";
import { structuredData } from "@/structured-data";
import { publicContent } from "@/public-content";
import { StructuredPage } from "@/structured-page";
import { presentationFor } from "@/presentation";
import { homepageContent as resolveHomepageContent } from "@/homepage-content";
import { hubFor } from "@/service-hubs";
import { ServiceHubPage } from "@/service-hub-page";
import { ServiceDirectoryPage } from "@/service-directory-page";
import { directoryMetadata } from "@/service-directory-data";
import { V3Page } from "@/v3-page";
import { newsletterReady } from "@/ses-newsletter";
import { verifiedV3Content } from "@/v3-evidence";
import { withAssetNames } from "@/asset-names";
import { structureRedirects } from "@/site-structure";
import { homeMeta } from "@/home/copy";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug?: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!process.env.DATABASE_URL)
    return {
      title: "Netofficials setup",
      robots: { index: false, follow: false },
    };
  const p = await published(pagePath((await params).slug));
  if (!p) return { robots: { index: false, follow: false } };
  const meta =
    p.path === "/" && p.content.schemaVersion !== 3
      ? homeMeta
      : p.path === "/services" && p.content.schemaVersion !== 3
        ? directoryMetadata
        : p.content;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: p.path },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: p.path,
    },
  };
}
export default async function Page({ params }: Props) {
  const path = pagePath((await params).slug);
  if (!process.env.DATABASE_URL && path !== "/") notFound();
  if (!process.env.DATABASE_URL)
    return (
      <main className="admin">
        <h1>Netofficials application is ready for setup.</h1>
        <p>
          Configure Neon, run migrations and seed drafts. No draft content is
          public.
        </p>
        <a href="/admin">Owner admin</a>
        {process.env.NODE_ENV === "development" &&
          process.env.DESIGN_PREVIEW_MODE === "true" && (
            <p>
              <a href="/design-preview/software-led">Local design preview</a>
            </p>
          )}
      </main>
    );
  const p = await published(path);
  if (!p) {
    if (structureRedirects[path]) permanentRedirect(structureRedirects[path]);
    const [r] = await query<{ destination: string }>(
      "SELECT destination FROM redirects WHERE path=$1",
      [path],
    );
    if (r) permanentRedirect(r.destination);
    notFound();
  }
  if (p.content.schemaVersion === 3) {
    const paths = (
      await query("SELECT path FROM pages WHERE archived_at IS NULL")
    ).map((p) => p.path);
    const vacancies =
      path === "/careers"
        ? await query(
            "SELECT id,slug,title,department,location,employment_type FROM vacancies WHERE status='open' AND verified=true ORDER BY created_at DESC",
          )
        : [];
    const approved = (
      await query("SELECT id FROM facts WHERE approved=true")
    ).map((fact) => fact.id);
    return (
      <V3Page
        content={await withAssetNames(verifiedV3Content(p.content, approved))}
        path={path}
        paths={paths}
        vacancies={vacancies as any}
        newsletterEnabled={path === "/blog" && (await newsletterReady())}
        posts={path === "/blog" ? await blogPosts() : []}
        published={p.first_published_at}
        modified={p.created_at}
      />
    );
  }
  if (path === "/services")
    return (
      <ServiceDirectoryPage
        paths={(await publishedPaths()).map((p) => p.path)}
      />
    );
  if (hubFor(path)) {
    const paths = (await publishedPaths()).map((p) => p.path);
    return (
      <ServiceHubPage
        path={path}
        content={p.content}
        paths={paths}
        listing={await publishedListing()}
      />
    );
  }
  const design = getDesign(p.path === "/" ? "software-led" : p.template),
    paths = (await publishedPaths()).map((p) => p.path);
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const homepageContent =
    p.path === "/" ? resolveHomepageContent(design, p.content) : p.content;
  const visible = publicContent(design, homepageContent, paths);
  const schema = structuredData(
    { ...p, content: visible.content },
    design,
    base,
  );
  const presentation =
    p.path !== "/" && p.content.schemaVersion === 2
      ? presentationFor(p.path)
      : undefined;
  if (p.path !== "/" && p.content.schemaVersion === 2 && !presentation?.ready)
    notFound();
  const listing = await publishedListing();
  const jsonLd = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
      }}
    />
  );
  if (p.path === "/")
    return (
      <>
        <HomePage content={visible.content} paths={paths} listing={listing}>
          {p.content.sources.length > 0 && <Sources ids={p.content.sources} />}
        </HomePage>
        {jsonLd}
      </>
    );
  return (
    <div className={presentation ? "csv-frame" : undefined}>
      {presentation && (
        <link rel="stylesheet" href="/assets/structured-site.css" />
      )}
      <link rel="stylesheet" href="/assets/complete.css" />
      {design.styles.map((s) => (
        <link rel="stylesheet" href={s} key={s} />
      ))}
      <Navigation paths={paths} pages={listing} />
      <main id="main">
        {presentation ? (
          <StructuredPage
            content={visible.content}
            presentation={presentation}
            allowedPaths={paths}
            listing={listing}
          />
        ) : (
          <DesignPage
            design={visible.design}
            content={visible.content}
            allowedPaths={paths}
            listing={listing}
          />
        )}
        {p.content.sources.length > 0 && <Sources ids={p.content.sources} />}
      </main>
      <Footer paths={paths} />
      {jsonLd}
    </div>
  );
}
async function Sources({ ids }: { ids: string[] }) {
  const sources = await query<{ id: string; title: string; url: string }>(
    "SELECT id,title,url FROM sources WHERE approved=true AND id=ANY($1::uuid[])",
    [ids],
  );
  return (
    <section className="wrap section">
      <h2>Sources</h2>
      <ul>
        {sources.map((s) => (
          <li key={s.id}>
            {s.url ? (
              <a href={s.url} rel="noopener noreferrer">
                {s.title}
              </a>
            ) : (
              s.title
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
