import { getDesign, screenDesigns } from "@/designs";
import { DesignPage, Navigation, Footer } from "@/render";
import { HomePage } from "@/home/HomePage";
import { notFound } from "next/navigation";
import { hubFor, serviceHubs } from "@/service-hubs";
import { ServiceHubPage } from "@/service-hub-page";
import { ServiceDirectoryPage } from "@/service-directory-page";
import { directoryMetadata } from "@/service-directory-data";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { ...((await params).id === "services" ? directoryMetadata : {}), robots: { index: false, follow: false } };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.DESIGN_PREVIEW_MODE !== "true"
  )
    notFound();
  const id = (await params).id;
  const linkMap = Object.fromEntries([
    ["/services", "/design-preview/services"],
    ...screenDesigns.map((x) => [x.path, "/design-preview/" + x.id]),
    ...serviceHubs.map((x) => [x.path, "/design-preview" + x.path]),
  ]);
  if (id === "services")
    return <ServiceDirectoryPage preview linkMap={linkMap} />;
  const requestedHub = hubFor("/" + id);
  if (requestedHub)
    return (
      <ServiceHubPage path={requestedHub.path} preview linkMap={linkMap} />
    );
  let d;
  try {
    d = getDesign(id);
  } catch {
    notFound();
  }
  const content = {
    title: d.title,
    description: "Local design review",
    texts: d.texts,
    hiddenSections: [],
    sources: [],
    claims: [],
    unresolved: [],
  };
  if (d.id === "software-led")
    return <HomePage content={content} preview linkMap={linkMap} />;
  if (hubFor(d.path))
    return <ServiceHubPage path={d.path} preview linkMap={linkMap} />;
  return (
    <>
      {d.styles.map((s) => (
        <link rel="stylesheet" href={s} key={s} />
      ))}
      <Navigation paths={[]} preview linkMap={linkMap} />
      <main id="main">
        <DesignPage design={d} content={content} preview linkMap={linkMap} />
      </main>
      <Footer paths={[]} preview linkMap={linkMap} />
    </>
  );
}
