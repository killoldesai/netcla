// Section-wise sitemap for the redesigned built-in 404 (NxShell page "not-found"). Same blocks as SectionSitemap
// (sitemapBlocks in src/section-sitemap.tsx), in the redesign markup from public/assets/nx/pages/not-found.css.
import { SiteIcon, legacyIcon } from "../icon-set";
import { sitemapBlocks } from "../section-sitemap";
import { Icon } from "./ui";

type Listing = { path: string; title?: string | null };

export function NxSitemap({ listing }: { listing: Listing[] }) {
  const blocks = sitemapBlocks(listing);
  if (!blocks.length) return null;
  return (
    <section id="sitemap" className="section nx-sitemap" aria-labelledby="sitemap-heading">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Sitemap</span>
            <h2 className="h-section" id="sitemap-heading">
              Every live page, grouped by section
            </h2>
          </div>
        </div>
        {blocks.map((b) => (
          <div key={b.id} className="nx-sm-block">
            <header className="nx-sm-head">
              {b.icon && (
                <span className="nx-sm-tile">
                  <SiteIcon name={legacyIcon[b.icon] ?? b.icon} className="nx-icon" />
                </span>
              )}
              <div>
                <h3>{b.title}</h3>
                {b.blurb && <p>{b.blurb}</p>}
              </div>
              {b.hub && (
                <a href={b.hub.path} className="nx-arrowlink">
                  <span>Explore {b.title}</span>
                  <Icon name="arrow-right" size={18} />
                </a>
              )}
            </header>
            <div className="nx-sm-grid">
              {b.groups.map((g) => (
                <nav
                  key={g.heading ?? "all"}
                  className={"nx-sm-box" + (g.links.length > 7 ? " nx-sm-box--wide" : "")}
                  aria-label={`${b.title}${g.heading ? " - " + g.heading : ""}`}
                >
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
