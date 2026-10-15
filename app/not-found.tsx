import { published, publishedListing } from "@/pages";
import { query } from "@/db";
import { V3Page } from "@/v3-page";
import { verifiedV3Content } from "@/v3-evidence";
import { withAssetNames } from "@/asset-names";
import { SectionSitemap } from "@/section-sitemap";
import { pillars } from "@/site-structure";
import { NxShell } from "@/site/shell";
import { ArrowLink, Button, HeroArt, ProductIcon } from "@/site/ui";
import { NxSitemap } from "@/site/sitemap";
import { NotFoundArt } from "@/site/art/not-found-art";

// The built-in 404 is redesigned from html-prototype/404.html (styles: public/assets/nx/pages/not-found.css).
// A published /404 page from the admin still renders through V3Page, unchanged.

/** Hub cards on the built-in 404, with the prototype's product icon for each pillar. */
const popularHubs: Record<string, string> = {
  software: "code-brackets",
  mobile: "mobile-device",
  ai: "brain-circuit",
  cloud: "aws-cloud",
  hire: "users-group",
  industries: "layers-stack",
};

async function load() {
  if (!process.env.DATABASE_URL) return { listing: [], page: null };
  try {
    const [listing, page] = await Promise.all([publishedListing(), published("/404")]);
    return { listing, page };
  } catch {
    return { listing: [], page: null };
  }
}

// The 404 copy is the published /404 page from the admin, else the built-in page below.
// The sitemap always reflects what is published now.
export default async function NotFound() {
  const { listing, page } = await load();
  const paths = listing.length ? listing.map((l) => l.path) : ["/"];
  if (page?.content.schemaVersion === 3) {
    const approved = (await query("SELECT id FROM facts WHERE approved=true")).map((f) => f.id);
    return (
      <V3Page
        content={await withAssetNames(verifiedV3Content(page.content, approved))}
        path="/404"
        paths={paths}
        afterContent={<SectionSitemap listing={listing} />}
        published={page.first_published_at}
        modified={page.created_at}
      />
    );
  }
  const hubs = pillars.filter((p) => popularHubs[p.id]);
  return (
    <NxShell page="not-found" paths={paths}>
      <section className="page-hero nf-hero">
        <div className="container">
          <div className="hero__grid">
            <div>
              <span className="tag-pill">Error 404</span>
              <h1>This page took a different route</h1>
              <p className="lead">
                The link may be out of date, or the page has moved. Every live page is listed below by section, or tell us what you were looking for and we will point you to it.
              </p>
              <div className="hero__actions">
                <Button href="/" size="lg">Back to the homepage</Button>
                <ArrowLink href="/contact">Tell us what you need</ArrowLink>
              </div>
            </div>
            <HeroArt fallback={<NotFoundArt />} priority />
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="popular-title">
        <div className="container">
          <div className="section-head nx-reveal">
            <div>
              <h2 className="h-section" id="popular-title">Popular pages</h2>
            </div>
          </div>
          <div className="sk-cards nf-cards nx-reveal">
            {hubs.map((hub) => (
              <a key={hub.id} className="sk-card nf-card" href={hub.hub}>
                <span className="sk-card__icon" aria-hidden="true">
                  <ProductIcon name={popularHubs[hub.id]} size={26} />
                </span>
                <span className="sk-card__title">{hub.label}</span>
                <span className="sk-card__text">{hub.blurb}</span>
              </a>
            ))}
          </div>
          <div className="nf-links">
            <ArrowLink href="/services">Services</ArrowLink>
            <ArrowLink href="/blog">Guides</ArrowLink>
          </div>
        </div>
      </section>

      <NxSitemap listing={listing} />

      <section className="section band" aria-labelledby="nf-cta-title">
        <div className="container">
          <div className="footer__cta">
            <div>
              <h2 id="nf-cta-title">
                Still can&apos;t find it? <span>Tell us what you need built.</span>
              </h2>
              <p>
                Describe the service or page you were after and a Netofficials team member will reply with the right link, or the questions needed to scope your project.
              </p>
            </div>
            <div className="footer__cta-actions">
              <Button href="/contact" variant="lime" size="lg">Contact us</Button>
              <Button href="/services" variant="secondary" size="lg">Browse all services</Button>
            </div>
          </div>
        </div>
      </section>
    </NxShell>
  );
}
