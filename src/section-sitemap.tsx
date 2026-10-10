import { SiteIcon, legacyIcon } from "./icon-set";
import { pillars, pillarGroups, sitePage, sitePages } from "./site-structure";

type Listing = { path: string; title?: string | null };
type Group = { heading?: string; links: { path: string; label: string }[] };
type Block = { id: string; title: string; icon?: string; blurb?: string; hub?: { path: string; label: string }; groups: Group[] };

const HIDDEN = new Set(["/", "/404", "/thank-you"]);

/** Section-wise sitemap built from what is published right now: pillars from the site structure, then company pages and guides. */
export function sitemapBlocks(listing: Listing[]): Block[] {
  const live = new Map(listing.filter((l) => !HIDDEN.has(l.path)).map((l) => [l.path, l]));
  const used = new Set<string>();
  const link = (path: string) => {
    used.add(path);
    return { path, label: sitePage(path)?.label ?? live.get(path)?.title?.replace(/\s*\|.*$/, "") ?? path };
  };
  const blocks: Block[] = [];
  for (const pillar of pillars) {
    const groups = pillarGroups(pillar.id)
      .map((g) => ({ heading: g.group, links: g.pages.filter((p) => live.has(p.path)).map((p) => link(p.path)) }))
      .filter((g) => g.links.length);
    const hub = live.has(pillar.hub) ? link(pillar.hub) : undefined;
    if (hub) hub.label = pillar.label;
    if (hub || groups.length) blocks.push({ id: pillar.id, title: pillar.label, icon: pillar.icon, blurb: pillar.blurb, hub, groups });
  }
  const company = sitePages.filter((p) => !p.pillar && live.has(p.path) && !used.has(p.path) && !p.path.startsWith("/blog/"));
  if (company.length) blocks.push({ id: "company", title: "Company", icon: "building", blurb: "About us, how we work and contact", groups: [{ links: company.map((p) => link(p.path)) }] });
  const guides = [...live.keys()].filter((p) => p.startsWith("/blog/") && !used.has(p));
  if (guides.length) blocks.push({ id: "guides", title: "Guides", icon: "spark", blurb: "Practical reading on software, AI and cloud", groups: [{ links: guides.map(link) }] });
  const rest = [...live.keys()].filter((p) => !used.has(p));
  if (rest.length) blocks.push({ id: "more", title: "More", groups: [{ links: rest.map(link) }] });
  return blocks;
}

// Section header row per pillar, then one compact box per topic group holding its links.
export function SectionSitemap({ listing }: { listing: Listing[] }) {
  const blocks = sitemapBlocks(listing);
  if (!blocks.length) return null;
  return (
    <section
      id="sitemap"
      className="v3-section v3-ServiceDirectory v3-section--sitemap"
      style={{ backgroundColor: "#f1f4f7", color: "#182138" }}
      aria-labelledby="sitemap-heading"
    >
      <div className="v3-wrap" style={{ maxWidth: 1320 }}>
        <p className="v3-eyebrow">Sitemap</p>
        <h2 id="sitemap-heading">Every live page, grouped by section</h2>
        {blocks.map((b) => (
          <div key={b.id} className="v3-sm-block">
            <header className="v3-sm-head">
              {b.icon && (
                <span className="v3-icon-tile">
                  <SiteIcon name={legacyIcon[b.icon] ?? b.icon} className="v3-icon" />
                </span>
              )}
              <div>
                <h3>{b.title}</h3>
                {b.blurb && <p>{b.blurb}</p>}
              </div>
              {b.hub && (
                <a href={b.hub.path} className="v3-link">
                  Explore {b.title} <span aria-hidden="true">↗</span>
                </a>
              )}
            </header>
            <div className="v3-sm-grid">
              {b.groups.map((g) => (
                <nav key={g.heading ?? "all"} className={"v3-sm-box" + (g.links.length > 7 ? " v3-sm-box--wide" : "")} aria-label={`${b.title}${g.heading ? " – " + g.heading : ""}`}>
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
