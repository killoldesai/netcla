import { published, publishedListing } from "@/pages";
import { query } from "@/db";
import { V3Page } from "@/v3-page";
import { verifiedV3Content } from "@/v3-evidence";
import { withAssetNames } from "@/asset-names";
import { SectionSitemap } from "@/section-sitemap";

const layout = (recommended_component: string, background: string) => ({
  max_width: "1320px",
  background,
  mobile_stack: "Stack content in reading order; component owns responsive layout.",
  spacing_above: 0,
  recommended_component,
});

// Built-in 404, made of the same sections every page uses. Shown until a /404 page
// is published from the admin.
const fallbackContent = {
  schemaVersion: 3,
  title: "Page not found | Netofficials",
  description: "The page you requested is unavailable.",
  texts: {},
  claims: [],
  sources: [],
  unresolved: [],
  pageBlueprint: {
    hero: layout("HeroSplit", "#ffffff"),
    "cta-banner": layout("DarkCtaBand", "#061b31"),
  },
  pageSections: [
    {
      id: "hero",
      order: 1,
      omitted: false,
      evidenceIds: [],
      asset: {
        id: "not-found",
        src: "/assets/not-found-illustration.svg",
        alt: "",
        width: 560,
        height: 420,
      },
      fields: {
        tag_pill: "Error 404",
        h1: "This page took a different route",
        subheadline:
          "The link may be out of date, or the page has moved. Every live page is listed below by section, or tell us what you were looking for and we will point you to it.",
        cta_primary_label: "Tell us what you need",
        cta_secondary_label: "Back to the homepage",
        cta_secondary_url: "/",
      },
    },
    {
      id: "cta-banner",
      order: 2,
      omitted: false,
      evidenceIds: [],
      fields: {
        heading: "Still can't find it?",
        subheadline:
          "Describe the service or page you were after and a Netofficials team member will reply with the right link, or the questions needed to scope your project.",
        cta_primary_label: "Contact us",
        cta_primary_url: "/contact",
        cta_secondary_label: "Browse all services",
        cta_secondary_url: "/services",
      },
    },
  ],
} as unknown as Parameters<typeof V3Page>[0]["content"];

async function load() {
  if (!process.env.DATABASE_URL) return { listing: [], page: null };
  try {
    const [listing, page] = await Promise.all([publishedListing(), published("/404")]);
    return { listing, page };
  } catch {
    return { listing: [], page: null };
  }
}

// The 404 copy is the published /404 page from the admin, else the built-in sections above.
// The sitemap always reflects what is published now and sits before the closing CTA band.
export default async function NotFound() {
  const { listing, page } = await load();
  const paths = listing.length ? listing.map((l) => l.path) : ["/"];
  const sitemap = <SectionSitemap listing={listing} />;
  if (page?.content.schemaVersion === 3) {
    const approved = (await query("SELECT id FROM facts WHERE approved=true")).map((f) => f.id);
    return (
      <V3Page
        content={await withAssetNames(verifiedV3Content(page.content, approved))}
        path="/404"
        paths={paths}
        afterContent={sitemap}
        published={page.first_published_at}
        modified={page.created_at}
      />
    );
  }
  return <V3Page content={fallbackContent} path="/404" paths={paths} afterContent={sitemap} />;
}
