// The /services directory in the redesign (html-prototype/services.html): every published page from
// src/site-structure.ts grouped by pillar, with the page's own published copy. Pages that are not
// published are not linked and do not count. Published section copy is never dropped: child services
// (services-grid) become the pillar lead when they match a pillar, and every other section renders its
// text. Switched on through src/site/ported.ts ("services"). Styles: public/assets/nx/pages/services.css.
import type { CSSProperties } from "react";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";
import { TrackedLink } from "./v3-interactions";
import { sanitizeRichHTML } from "./rich-text";
import { breadcrumbs, pillars, sitePages, type PageType, type PillarId, type SitePage } from "./site-structure";
import { publicDestination } from "./site/footer-data";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon, ProductIcon } from "./site/ui";
import { ServicesArt } from "./site/art/services-art";

export const isServicesDirectoryPath = (path: string) => path === "/services";

/** Product icon per pillar tile (the approved icon set in public/assets/nx/icons.svg). */
const TILE_ICON: Record<PillarId, string> = {
  software: "code-brackets",
  mobile: "mobile-device",
  ai: "brain-circuit",
  cloud: "cloud-upload",
  web: "layers-stack",
  marketing: "chart-bar",
  hire: "users-group",
  industries: "settings-gear",
};

/** Short names for the sticky sub-nav, as the prototype shows them. */
const NAV_LABEL: Record<PillarId, string> = {
  software: "Software",
  mobile: "Mobile",
  ai: "AI",
  cloud: "Cloud",
  web: "Web",
  marketing: "Marketing",
  hire: "Hire",
  industries: "Industries",
};

/** Page types listed under company and resources (no pillar, not locations, not this directory or the home page). */
const COMPANY_TYPES: PageType[] = ["company", "contact", "work", "guide"];

/** Sections with their own layout here; every other section is rendered generically. */
const OWN_SECTIONS = ["hero", "services-grid", "faq", "cta-banner"];
const HEAD_KEYS = ["section_label", "heading"];
const LEAD_KEYS = ["subheadline", "intro", "body_paragraph", "lead"];
/** prefix_N or prefix_N_key (N is the item number). */
const NUMBERED = /^(.+?)_(\d+)(?:_(.+))?$/;
const isLink = (key: string) => /(^|_)url$/.test(key);
const isNoise = (key: string) => isLink(key) || /(^|_)icon_key$/.test(key);
/** Title candidates for a numbered item, in order of preference. */
const TITLE_KEYS = [/(^|_)name$/, /(^|_)heading$/, /(^|_)title$/, /(^|_)number$/, /(^|_)label$/];

/** Stagger for card N in a row of three, as the prototype does. */
const delay = (i: number) => ({ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }) as CSSProperties;

const countLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

type Row = { page: SitePage; href: string };
type Group = { name: string; rows: Row[] };
type Item = { n: number; values: Record<string, string> };

/** Numbered items of a field set: one item per N, values keyed by prefix and sub-key (svc_title, quote, ...). */
function itemsOf(fields: Record<string, string>, keys: string[]): Item[] {
  const byN = new Map<number, Record<string, string>>();
  for (const k of keys) {
    const m = NUMBERED.exec(k);
    const value = (fields[k] ?? "").trim();
    if (!m || !value) continue;
    const n = Number(m[2]);
    const key = m[3] ? `${m[1]}_${m[3]}` : m[1];
    const item = byN.get(n) ?? {};
    item[key] = value;
    byN.set(n, item);
  }
  return [...byN.entries()].sort(([a], [b]) => a - b).map(([n, values]) => ({ n, values }));
}

/** Rows grouped by menu group, in declaration order (pages without a group go under "More"). */
function groupRows(rows: Row[]): Group[] {
  const groups: Group[] = [];
  for (const row of rows) {
    const name = row.page.group ?? "More";
    let group = groups.find((g) => g.name === name);
    if (!group) groups.push((group = { name, rows: [] }));
    group.rows.push(row);
  }
  return groups;
}

type Props = {
  content: Content;
  path: string;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
};

function Rich({ value, paths, className }: { value: string; paths: string[]; className?: string }) {
  if (!/<[a-z][\s\S]*>/i.test(value)) return <p className={className}>{value}</p>;
  return <div className={"nx-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(value, false, paths.length ? paths : undefined) }} />;
}

/** A card of links: one menu group (or the company and locations lists). */
function Card({ title, rows, i }: { title: string; rows: Row[]; i: number }) {
  return (
    <article className="dir-card nx-reveal" style={delay(i)}>
      <h3 className="dir-card__title">{title}</h3>
      <ul className="dir-list">
        {rows.map(({ page, href }) => (
          <li key={page.path}>
            <a className="dir-link" href={href}>
              <span className="dir-link__main">
                <span className="dir-link__name">{page.label}</span>
                <span className="dir-link__text">{page.blurb}</span>
              </span>
              <Icon name="arrow-right" size={18} className="nx-icon" />
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** A card for one numbered item of a section: its name or heading as the title, every other value as text. */
function ItemCard({ item, paths, dest, i }: { item: Item; paths: string[]; dest: (url: string) => string | undefined; i: number }) {
  const keys = Object.keys(item.values);
  const titleKey = TITLE_KEYS.map((re) => keys.find((k) => re.test(k))).find(Boolean);
  const urlKey = keys.find(isLink);
  const href = urlKey ? dest(item.values[urlKey]) : undefined;
  const title = titleKey ? item.values[titleKey] : undefined;
  const bodyKeys = keys.filter((k) => k !== titleKey && !isNoise(k));
  return (
    <article className="dir-card nx-reveal" style={delay(i)}>
      {title && <h3 className="dir-card__title">{href ? <a href={href}>{title}</a> : title}</h3>}
      {bodyKeys.map((k) => (
        <Rich key={k} value={item.values[k]} paths={paths} className="dir-card__text" />
      ))}
    </article>
  );
}

export function ServicesDirectorySections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const dest = (url: string) => publicDestination(url, { paths, preview, linkMap });
  const sections = content.pageSections ?? [];
  const by = (id: string): PageSection | undefined => sections.find((s) => s.id === id && !s.omitted);
  const hero = by("hero");
  const hf = hero?.fields ?? {};
  const grid = by("services-grid");
  const faq = by("faq");
  const cta = by("cta-banner");
  const contact = go("/contact") + "?service=" + encodeURIComponent(content.title);
  const trail = breadcrumbs(path, hf.h1 || content.title);

  // Published links only: a page is linked when its path is published (or mapped in a preview).
  const rowsFor = (pages: SitePage[]): Row[] =>
    pages.flatMap((page) => {
      const href = dest(page.path);
      return href ? [{ page, href }] : [];
    });

  // Child services of the page: each one that names a pillar (by its hub link or its label) becomes that
  // pillar's lead; the rest are listed in the services-grid section.
  const svcItems = grid ? itemsOf(grid.fields, Object.keys(grid.fields).filter((k) => k.startsWith("svc_"))) : [];
  const leadFor = new Map<PillarId, string>();
  const matched = new Set<number>();
  for (const item of svcItems) {
    const url = item.values.svc_url;
    const title = item.values.svc_title?.toLowerCase();
    const pillar = pillars.find((p) => !leadFor.has(p.id) && ((url && p.hub === url) || (title && title === p.label.toLowerCase())));
    if (pillar && item.values.svc_body) {
      leadFor.set(pillar.id, item.values.svc_body);
      matched.add(item.n);
    }
  }
  const unmatched = svcItems.filter((item) => !matched.has(item.n));

  const areas = pillars.flatMap((p) => {
    const rows = rowsFor(sitePages.filter((page) => page.pillar === p.id && page.type !== "pillar"));
    const lead = leadFor.get(p.id);
    if (!rows.length && lead === undefined) return [];
    return [{ pillar: p, rows, groups: groupRows(rows), hub: dest(p.hub), lead: lead ?? p.blurb }];
  });
  const company = rowsFor(sitePages.filter((page) => !page.pillar && COMPANY_TYPES.includes(page.type)));
  const locations = rowsFor(sitePages.filter((page) => page.type === "location"));
  const howHref = dest("/how-we-work");
  const others = sections.filter((s) => !s.omitted && !OWN_SECTIONS.includes(s.id));
  const heroStats = itemsOf(hf, Object.keys(hf).filter((k) => /^stat_\d+_/.test(k)));

  // Backgrounds alternate in page order. The overview counts as the first band (plain).
  const order = [
    "overview",
    ...areas.map((a) => a.pillar.id),
    ...(company.length ? ["company"] : []),
    ...(locations.length ? ["locations"] : []),
    ...others.map((s) => s.id),
  ];
  const band = (id: string) => ((order.indexOf(id) + 1) % 2 === 1 ? " section--white" : "");

  const faqItems = faq
    ? Object.keys(faq.fields)
        .filter((k) => /^q\d+$/.test(k) && faq.fields[k] && faq.fields[k.replace("q", "a")])
        .map((k) => ({ q: faq.fields[k], a: <Rich value={faq.fields[k.replace("q", "a")]} paths={paths} /> }))
    : [];

  const bands = [
    ...areas.map((a) => ({ id: a.pillar.id, label: NAV_LABEL[a.pillar.id] })),
    ...(company.length ? [{ id: "company", label: "Company" }] : []),
    ...(locations.length ? [{ id: "locations", label: "Locations" }] : []),
  ];

  return (
    <>
      <section id="hero" className="page-hero dir-hero">
        <div className="container">
          <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
          <div className="hero__grid">
            <div>
              {hf.tag_pill && <span className="tag-pill">{hf.tag_pill}</span>}
              <h1>{hf.h1 || content.title}</h1>
              {hf.subheadline && <p className="lead">{hf.subheadline}</p>}
              <div className="hero__actions">
                <TrackedLink href={contact} event="consultation_click" service={content.title} className="nx-btn nx-btn--primary nx-btn--lg">
                  <span>{hf.cta_primary_label || "Discuss your project"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {hf.cta_secondary_label ? (
                  <ArrowLink href={go(hf.cta_secondary_url || "/how-we-work")}>{hf.cta_secondary_label}</ArrowLink>
                ) : (
                  areas.length > 0 && <ArrowLink href="#overview">Browse all areas</ArrowLink>
                )}
              </div>
              {heroStats.length > 0 && (
                <ul className="dir-stats">
                  {heroStats.map((item) => (
                    <li key={item.n}>
                      <span className="dir-stats__value">{item.values.stat_number}</span>
                      <span className="dir-stats__label">{item.values.stat_label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <HeroArt asset={hero?.asset} fallback={<ServicesArt />} priority />
          </div>
        </div>
      </section>

      {(bands.length > 0 || areas.length > 0) && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {areas.length > 0 && (
                <li>
                  <a href="#overview">Overview</a>
                </li>
              )}
              {bands.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`}>{b.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {grid && (grid.fields.section_label || grid.fields.heading || unmatched.length > 0) && (
        <section id="services-grid" className="section section--white">
          <div className="container">
            {(grid.fields.section_label || grid.fields.heading) && (
              <div className="section-head nx-reveal">
                <div>
                  {grid.fields.section_label && <span className="eyebrow">{grid.fields.section_label}</span>}
                  {grid.fields.heading && <h2 className="h-section">{grid.fields.heading}</h2>}
                </div>
              </div>
            )}
            {unmatched.length > 0 && (
              <div className="dir-groups">
                {unmatched.map((item, i) => (
                  <ItemCard key={item.n} item={{ n: item.n, values: Object.fromEntries(Object.entries(item.values).map(([k, v]) => [k.replace(/^svc_/, ""), v])) }} paths={paths} dest={dest} i={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {areas.length > 0 && (
        <section className="section" id="overview">
          <div className="container">
            <div className="section-head nx-reveal">
              <div>
                <span className="eyebrow">Overview</span>
                <h2 className="h-section">Service areas</h2>
              </div>
            </div>
            <div className="dir-tiles">
              {areas.map(({ pillar, rows }, i) => (
                <a key={pillar.id} className="dir-tile nx-reveal" style={delay(i)} href={`#${pillar.id}`}>
                  <span className="dir-tile__icon" aria-hidden="true">
                    <ProductIcon name={TILE_ICON[pillar.id]} size={26} />
                  </span>
                  {rows.length > 0 && <span className="dir-tile__count">{countLabel(rows.length)}</span>}
                  <span className="dir-tile__title">{pillar.label}</span>
                  <span className="dir-tile__text">{pillar.blurb}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {areas.map(({ pillar, rows, groups, hub, lead }) => (
        <section key={pillar.id} className={"section" + band(pillar.id)} id={pillar.id}>
          <div className="container">
            <div className="section-head nx-reveal">
              <div>
                {rows.length > 0 && <span className="eyebrow">{countLabel(rows.length)}</span>}
                <h2 className="h-section">{pillar.label}</h2>
              </div>
              <div className="dir-head">
                <Rich value={lead} paths={paths} className="lead" />
                {hub && <ArrowLink href={hub}>{`Open the ${pillar.label} hub`}</ArrowLink>}
              </div>
            </div>
            <div className="dir-groups">
              {groups.map((g, i) => (
                <Card key={g.name} title={g.name} rows={g.rows} i={i} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {company.length > 0 && (
        <section className={"section" + band("company")} id="company">
          <div className="container">
            <div className="section-head nx-reveal">
              <div>
                <span className="eyebrow">{countLabel(company.length)}</span>
                <h2 className="h-section">Company and resources</h2>
              </div>
            </div>
            <div className="dir-groups">
              <Card title="Company" rows={company} i={0} />
            </div>
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section className={"section" + band("locations")} id="locations">
          <div className="container">
            <div className="section-head nx-reveal">
              <div>
                <span className="eyebrow">{countLabel(locations.length)}</span>
                <h2 className="h-section">Software development by location</h2>
              </div>
            </div>
            <div className="dir-groups">
              <Card title="Locations" rows={locations} i={0} />
            </div>
            {howHref && (
              <p className="dir-note nx-reveal">
                Want to understand the delivery process? <a href={howHref}>See how we work <span aria-hidden="true">↗</span></a>
              </p>
            )}
          </div>
        </section>
      )}

      {others.map((s) => {
        const f = s.fields;
        const keys = Object.keys(f);
        const items = itemsOf(f, keys);
        const numbered = new Set(keys.filter((k) => NUMBERED.test(k)));
        const leadKey = LEAD_KEYS.find((k) => f[k]?.trim());
        const loose = keys.filter((k) => !numbered.has(k) && !HEAD_KEYS.includes(k) && k !== leadKey && !isNoise(k) && f[k]?.trim());
        const head = f.section_label || f.heading || leadKey;
        return (
          <section key={s.id} id={s.id} className={"section" + band(s.id)}>
            <div className="container">
              {head && (
                <div className="section-head nx-reveal">
                  <div>
                    {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                    {f.heading && <h2 className="h-section">{f.heading}</h2>}
                  </div>
                  {leadKey && <Rich value={f[leadKey]} paths={paths} className="lead" />}
                </div>
              )}
              {items.length > 0 && (
                <div className="dir-groups">
                  {items.map((item, i) => (
                    <ItemCard key={item.n} item={item} paths={paths} dest={dest} i={i} />
                  ))}
                </div>
              )}
              {loose.map((k) => (
                <div key={k} className="dir-loose nx-reveal">
                  <Rich value={f[k]} paths={paths} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {faqItems.length > 0 && (
        <section id="faq" className="section">
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              {faq?.fields.section_label && <span className="eyebrow">{faq.fields.section_label}</span>}
              {faq?.fields.heading && <h2 className="h-section">{faq.fields.heading}</h2>}
            </div>
            <div className="nx-reveal">
              <FaqList items={faqItems} name="services-faq" />
            </div>
          </div>
        </section>
      )}

      {cta && (cta.fields.heading || cta.fields.subheadline) && (
        <section id="cta-banner" className="section">
          <div className="container">
            <div className="nx-cta nx-cta--indigo dir-cta nx-reveal">
              <div>
                {cta.fields.heading && <h2 className="nx-cta__title">{cta.fields.heading}</h2>}
                {cta.fields.subheadline && <p className="nx-cta__desc">{cta.fields.subheadline}</p>}
              </div>
              <div className="dir-cta__actions">
                <TrackedLink href={contact} event="consultation_click" service={content.title} className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{cta.fields.cta_primary_label || "Discuss your project"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {cta.fields.cta_secondary_label && <ArrowLink href={go(cta.fields.cta_secondary_url || "/how-we-work")}>{cta.fields.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
