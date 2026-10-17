import { published, publishedListing } from "@/pages";
import { query } from "@/db";
import { V3Page } from "@/v3-page";
import { verifiedV3Content } from "@/v3-evidence";
import { withAssetNames } from "@/asset-names";
import { SectionSitemap, sitemapBlocks } from "@/section-sitemap";
import { pillars } from "@/site-structure";
import { V2Shell } from "@/site/v2/shell";
import { V2Icon, V2Img, v2img } from "@/site/v2/ui";

// The built-in 404 uses the v2 design (html-prototype/v2/404.html, styles: public/assets/v2/pages/404.css).
// A published /404 page from the admin still renders through V3Page, unchanged.

/** Hub cards on the built-in 404: the shipped spot icon for each pillar (line icon when there is none). */
const popularHubs: Record<string, string> = {
  software: "ic-software",
  mobile: "ic-mobile",
  ai: "ic-ai",
  cloud: "ic-devops",
  hire: "ic-team",
  industries: "",
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

/** Section-wise sitemap in the v2 markup. Same blocks as SectionSitemap, built from the published listing. */
function V2Sitemap({ listing }: { listing: { path: string; title?: string | null }[] }) {
  const blocks = sitemapBlocks(listing);
  if (!blocks.length) return null;
  return (
    <section id="sitemap" className="sec sec--cloud nf-sitemap" aria-labelledby="sitemap-heading">
      <div className="wrap">
        <div className="sec__head rv">
          <p className="eyebrow">Sitemap</p>
          <h2 className="h2" id="sitemap-heading">Every live page, grouped by section</h2>
        </div>
        {blocks.map((b) => (
          <div key={b.id} className="nf-sm rv">
            <div className="nf-sm__head">
              <div>
                <h3 className="h3">{b.title}</h3>
                {b.blurb && <p className="muted">{b.blurb}</p>}
              </div>
              {b.hub && (
                <a className="tlink" href={b.hub.path}>
                  <span>Explore {b.title}</span>
                  <V2Icon name="arrow" />
                </a>
              )}
            </div>
            <div className="nf-sm__grid">
              {b.groups.map((g) => (
                <nav key={g.heading ?? "all"} className="nf-sm__box" aria-label={`${b.title}${g.heading ? " - " + g.heading : ""}`}>
                  <h4>{g.heading ?? b.title}</h4>
                  <ul>
                    {g.links.map((l) => (
                      <li key={l.path}>
                        <a href={l.path}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
  const hubs = pillars.filter((p) => p.id in popularHubs);
  return (
    <V2Shell page="404" paths={paths} cta={false}>
      <section className="hero--404" aria-labelledby="nf-h">
        <div className="wrap">
          <span className="ghost" aria-hidden="true">404</span>
          <V2Img name="scene-404" alt="Illustrated character holding a map upside down" width={220} height={220} priority />
          <p className="eyebrow">Error 404</p>
          <h1 id="nf-h">This page took a different route</h1>
          <p className="lead">
            The link may be out of date, or the page has moved. Every live page is listed below by section, or tell us what you were looking for and we will point you to it.
          </p>
          <div className="hero__acts">
            <a className="btn btn--grad" href="/">
              Back to the homepage <V2Icon name="arrow" />
            </a>
            <a className="tlink" href="/contact">
              <span>Tell us what you need</span>
              <V2Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="sec nf-popular" aria-labelledby="popular-title">
        <div className="wrap">
          <div className="sec__head rv">
            <h2 className="h2" id="popular-title">Popular pages</h2>
          </div>
          <div className="catgrid">
            {hubs.map((hub) => (
              <a key={hub.id} className="cat rv" href={hub.hub}>
                {popularHubs[hub.id] ? (
                  <img className="spot" src={v2img(popularHubs[hub.id])} alt="" width={64} height={64} loading="lazy" decoding="async" />
                ) : (
                  <span className="nf-ico" aria-hidden="true">
                    <V2Icon name="layers" />
                  </span>
                )}
                <h3>{hub.label}</h3>
                {hub.blurb && <p>{hub.blurb}</p>}
                <span className="more" aria-hidden="true">
                  <V2Icon name="arrow" />
                </span>
              </a>
            ))}
          </div>
          <div className="nf-links rv">
            <a className="btn btn--ghost" href="/services">
              Services <V2Icon name="arrow" />
            </a>
            <a className="btn btn--ghost" href="/blog">
              Guides <V2Icon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <V2Sitemap listing={listing} />

      <section className="cta-band" aria-labelledby="nf-cta-title">
        <div className="wrap">
          <div className="cta-band__in rv">
            <div>
              <h2 id="nf-cta-title">
                Still can&apos;t find it? <span>Tell us what you need built.</span>
              </h2>
              <p>
                Describe the service or page you were after and a Netofficials team member will reply with the right link, or the questions needed to scope your project.
              </p>
            </div>
            <div className="cta-band__acts">
              <a className="btn btn--white" href="/contact">
                Contact us <V2Icon name="arrow" />
              </a>
              <a className="btn btn--ghost-w" href="/services">Browse all services</a>
            </div>
          </div>
        </div>
      </section>
    </V2Shell>
  );
}
