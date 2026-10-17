// The /services directory in the v2 design (html-prototype/v2/services.html): every published page from
// src/site-structure.ts grouped by pillar, with the page's own published copy. Pages that are not published are not
// linked and do not count. Published section copy is never dropped: child services (services-grid) become the pillar
// lead when they match a pillar, and every other section renders its text. Switched on through
// src/site/v2-ported.ts ("services"). Styles: html-prototype/v2/css/pages/services.css and css/live/services.css.
// The closing CTA band comes from the V3Page shell, so the directory does not render its own cta-banner.
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";
import { TrackedLink } from "./v3-interactions";
import { FAQAccordion, FAQAnswer } from "./v3-sections";
import { sanitizeRichHTML } from "./rich-text";
import { breadcrumbs, pillars, sitePages, type PageType, type PillarId, type SitePage } from "./site-structure";
import { publicDestination } from "./site/footer-data";
import { V2Crumbs, V2Icon, V2_VERSION, v2img } from "./site/v2/ui";
import { HeroScene } from "./site/v2/hero-scenes";
import { spotForPage } from "./site/v2/spots";

export const isServicesDirectoryPath = (path: string) => path === "/services";

/** 3D spot icon per pillar (public/assets/v2/img/ic-*.webp), shown on the overview cards and the pillar headers. */
const TILE_SPOT: Record<PillarId, string> = {
  software: "ic-software",
  mobile: "ic-mobile",
  ai: "ic-ai",
  cloud: "ic-cloud",
  web: "ic-scope",
  marketing: "ic-cost",
  hire: "ic-team",
  industries: "ic-healthcare",
};
const TINTS = ["lavender", "sky", "lime", "peach"];


/** Short names for the chip navigation, as the prototype shows them. */
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

/** Pastel backgrounds for the industry cards, in order. */
const INDUSTRY_TINT = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)", "var(--p-pink)", "var(--p-peri)"];

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

/** Body copy: plain text is one paragraph; rich HTML is sanitised inside a .prose wrapper. */
function Rich({ value, paths, className }: { value: string; paths: string[]; className?: string }) {
  if (!/<[a-z][\s\S]*>/i.test(value)) return <p className={className}>{value}</p>;
  return <div className={"prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(value, false, paths.length ? paths : undefined) }} />;
}

/** One linked page as a directory card: its name, its blurb and an arrow. */
function PageCard({ row }: { row: Row }) {
  return (
    <a className="dcard" href={row.href}>
      <span className="dcard__t">
        <h3>{row.page.label}</h3>
        <span className="dcard__go" aria-hidden="true">
          <V2Icon name="arrow" />
        </span>
      </span>
      {row.page.blurb && <p>{row.page.blurb}</p>}
    </a>
  );
}

/** A card for one numbered item of a section: its name or heading as the title, every other value as text. */
function ItemCard({ item, paths, dest }: { item: Item; paths: string[]; dest: (url: string) => string | undefined }) {
  const keys = Object.keys(item.values);
  const titleKey = TITLE_KEYS.map((re) => keys.find((k) => re.test(k))).find(Boolean);
  const urlKey = keys.find(isLink);
  const href = urlKey ? dest(item.values[urlKey]) : undefined;
  const title = titleKey ? item.values[titleKey] : undefined;
  const bodyKeys = keys.filter((k) => k !== titleKey && !isNoise(k));
  const inner = (
    <>
      {title && <h3>{title}</h3>}
      {bodyKeys.map((k) => (
        <Rich key={k} value={item.values[k]} paths={paths} />
      ))}
    </>
  );
  return href ? (
    <a className="cat rv" href={href}>
      {inner}
    </a>
  ) : (
    <div className="cat rv">{inner}</div>
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
  const heroParts = (hf.h1 || content.title).trim().split(/\s+/);
  const heroStats = itemsOf(hf, Object.keys(hf).filter((k) => /^stat_\d+_/.test(k)));

  // Backgrounds alternate in page order, starting with the overview on the cloud band.
  const order = [
    "overview",
    ...areas.map((a) => a.pillar.id),
    ...(company.length ? ["company"] : []),
    ...(locations.length ? ["locations"] : []),
    ...others.map((s) => s.id),
  ];
  const band = (id: string) => "sec" + (order.indexOf(id) % 2 === 0 ? " sec--cloud" : "");

  const faqItems = faq
    ? Object.keys(faq.fields)
        .filter((k) => /^q\d+$/.test(k) && faq.fields[k] && faq.fields[k.replace("q", "a")])
        .map((k) => ({ q: faq.fields[k], a: <FAQAnswer value={faq.fields[k.replace("q", "a")]} /> }))
    : [];

  const bands = [
    ...areas.map((a) => ({ id: a.pillar.id, label: NAV_LABEL[a.pillar.id] })),
    ...(company.length ? [{ id: "company", label: "Company" }] : []),
    ...(locations.length ? [{ id: "locations", label: "Locations" }] : []),
  ];

  return (
    <>
      <link rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />
      <section id="hero" className="hero sc-hero dir-split" aria-labelledby="svc-h1">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <V2Crumbs trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            {hf.tag_pill && <p className="eyebrow">{hf.tag_pill}</p>}
            <h1 id="svc-h1">
              {heroParts.length > 2 ? (
                <>
                  {heroParts.slice(0, -1).join(" ")} <span className="gword">{heroParts[heroParts.length - 1]}</span>
                </>
              ) : (
                hf.h1 || content.title
              )}
            </h1>
            {hf.subheadline && <p className="hero__sub">{hf.subheadline}</p>}
            <div className="hero__cta sc-hero__cta">
              <TrackedLink href={contact} event="consultation_click" service={content.title} className="btn btn--grad">
                <span>{hf.cta_primary_label || "Discuss your project"}</span> <V2Icon name="arrow" />
              </TrackedLink>
              {hf.cta_secondary_label ? (
                <a className="btn btn--ghost" href={go(hf.cta_secondary_url || "/how-we-work")}>
                  {hf.cta_secondary_label}
                </a>
              ) : (
                areas.length > 0 && (
                  <a className="btn btn--ghost" href="#overview">
                    Browse all areas
                  </a>
                )
              )}
            </div>
            {heroStats.length > 0 && (
              <ul className="dir-stats dir-stats--left">
                {heroStats.map((item) => (
                  <li key={item.n}>
                    <b>{item.values.stat_number}</b>
                    <span>{item.values.stat_label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <HeroScene kind="hub" title="Netofficials services" items={[]} stack={areas.map((a) => a.pillar.label)} />
        </div>
        {bands.length > 0 && (
          <div className="wrap">
            <nav className="svc-nav" aria-label="Service groups">
              <ul className="chips">
                {areas.length > 0 && (
                  <li>
                    <a className="chip" href="#overview">
                      Overview
                    </a>
                  </li>
                )}
                {bands.map((b) => (
                  <li key={b.id}>
                    <a className="chip" href={`#${b.id}`}>
                      {b.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </section>

      {(areas.length > 0 || unmatched.length > 0) && (
        <section className={band("overview")} id="overview" aria-labelledby="ov-h">
          <div className="wrap">
            <div className="sec__head rv">
              <p className="eyebrow">{grid?.fields.section_label || "Overview"}</p>
              <h2 className="big" id="ov-h">
                {grid?.fields.heading || "Service areas"}
              </h2>
            </div>
            {areas.length > 0 && (
            <div className="dir-areas">
              {areas.map(({ pillar, rows }, i) => (
                <a key={pillar.id} className={`dir-area dir-area--${TINTS[i % TINTS.length]} rv`} href={`#${pillar.id}`} style={{ transitionDelay: `${(i % 4) * 0.08}s` }}>
                  <span className="dir-area__top">
                    <img src={v2img(TILE_SPOT[pillar.id])} alt="" loading="lazy" />
                    {rows.length > 0 && <small>{countLabel(rows.length)}</small>}
                  </span>
                  <h3>{pillar.label}</h3>
                  <p>{pillar.blurb}</p>
                  <span className="dir-area__go" aria-hidden="true">
                    <V2Icon name="arrow" />
                  </span>
                </a>
              ))}
            </div>
            )}
            {unmatched.length > 0 && (
              <div className="catgrid catgrid--4" style={{ marginTop: 32 }}>
                {unmatched.map((item) => (
                  <ItemCard key={item.n} item={{ n: item.n, values: Object.fromEntries(Object.entries(item.values).map(([k, v]) => [k.replace(/^svc_/, ""), v])) }} paths={paths} dest={dest} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {areas.map(({ pillar, rows, groups, hub, lead }) =>
        pillar.id === "industries" ? (
          <section key={pillar.id} className="ind" id={pillar.id} data-scroller aria-labelledby={`${pillar.id}-h`}>
            <div className="wrap ind__h">
              <div>
                <h2 id={`${pillar.id}-h`}>{pillar.label}</h2>
                <Rich value={lead} paths={paths} />
              </div>
              {hub && (
                <a className="btn btn--ghost" href={hub}>
                  {`Open the ${pillar.label} hub`}
                </a>
              )}
            </div>
            <div className="irow">
              {rows.map(({ page, href }, i) => (
                <a key={page.path} className="icard" style={{ background: INDUSTRY_TINT[i % INDUSTRY_TINT.length] }} href={href}>
                  <span className="tag">{page.group ?? "Industry"}</span>
                  <h3>{page.label}</h3>
                  {page.blurb && <p>{page.blurb}</p>}
                  <span className="tlink">
                    Explore <V2Icon name="arrow" />
                  </span>
                </a>
              ))}
            </div>
            <div className="wrap ind__nav">
              <button type="button" aria-label="Scroll left" data-scroll="-1">
                <V2Icon name="left" />
              </button>
              <button type="button" aria-label="Scroll right" data-scroll="1">
                <V2Icon name="arrow" />
              </button>
            </div>
          </section>
        ) : (
          <section key={pillar.id} className={band(pillar.id) + " dir-sec"} id={pillar.id} aria-labelledby={`${pillar.id}-h`}>
            <div className="wrap">
              <div className={`dir-pillar dir-pillar--${TINTS[areas.findIndex((a) => a.pillar.id === pillar.id) % TINTS.length]} rv`}>
                <img src={v2img(TILE_SPOT[pillar.id])} alt="" loading="lazy" />
                <div>
                  {rows.length > 0 && <p className="eyebrow">{countLabel(rows.length)}</p>}
                  <h2 className="h2" id={`${pillar.id}-h`}>
                    {pillar.label}
                  </h2>
                  <Rich value={lead} paths={paths} className="lead" />
                </div>
                {hub && (
                  <a className="btn btn--ghost" href={hub}>
                    {`Open the ${pillar.label} hub`} <V2Icon name="arrow" />
                  </a>
                )}
              </div>
              {groups.length > 1 ? (
                <>
                  <div className="seg dir-seg" role="tablist" aria-label={`${pillar.label} services`} data-tabs>
                    {groups.map((g, i) => (
                      <button key={g.name} type="button" role="tab" id={`dt-${pillar.id}-${i}`} aria-controls={`dp-${pillar.id}-${i}`} aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1}>
                        {g.name}
                        <small>{g.rows.length}</small>
                      </button>
                    ))}
                  </div>
                  {groups.map((g, i) => (
                    <div key={g.name} className="dir-panel" role="tabpanel" id={`dp-${pillar.id}-${i}`} aria-labelledby={`dt-${pillar.id}-${i}`} hidden={i !== 0}>
                      <div className="dir-grid">
                        {g.rows.map((row) => (
                          <PageCard key={row.page.path} row={row} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="dir-grid dir-grid--solo">
                  {rows.map((row) => (
                    <PageCard key={row.page.path} row={row} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ),
      )}

      {company.length > 0 && (
        <section className={band("company") + " dir-sec"} id="company" aria-labelledby="co-h">
          <div className="wrap">
            <div className="sec__head sec__head--left rv">
              <p className="eyebrow">{countLabel(company.length)}</p>
              <h2 className="h2" id="co-h">
                Company and resources
              </h2>
            </div>
            <div className="dir-grid">
              {company.map((row) => (
                <PageCard key={row.page.path} row={row} />
              ))}
            </div>
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section className={band("locations") + " dir-sec"} id="locations" aria-labelledby="lc-h">
          <div className="wrap">
            <div className="sec__head sec__head--left rv">
              <p className="eyebrow">
                <img src={v2img("ic-timezone")} alt="" />
                {countLabel(locations.length)}
              </p>
              <h2 className="h2" id="lc-h">
                Software development by location
              </h2>
            </div>
            <ul className="dir-pills rv">
              {locations.map((row) => (
                <li key={row.page.path}>
                  <a className="dpill" href={row.href}>
                    <V2Icon name="pin" />
                    {row.page.label}
                    <V2Icon name="arrow" />
                  </a>
                </li>
              ))}
            </ul>
            {howHref && (
              <p className="svc-note">
                Want to understand the delivery process? <a className="tlink" href={howHref}>See how we work <span aria-hidden="true">↗</span></a>
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
        if (!head && items.length === 0 && loose.length === 0) return null;
        const sectionHead = (
          <div className="sec__head sec__head--left rv">
            {f.section_label && <p className="eyebrow">{f.section_label}</p>}
            {f.heading && (
              <h2 className="h2" id={`${s.id}-h`}>
                {f.heading}
              </h2>
            )}
          </div>
        );
        // Why Netofficials: the argument on the left (first two paragraphs, the rest behind a native expander), the advantages as tick cards on the right.
        if (s.id === "why-netofficials" && items.some((i) => i.values.adv)) {
          const paras = (f.body_paragraph ?? "").match(/<p[\s>][\s\S]*?<\/p>/gi) ?? (f.body_paragraph ? [f.body_paragraph] : []);
          return (
            <section key={s.id} id={s.id} className={band(s.id) + " dir-sec"} aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
              <div className="wrap dir-why">
                <div className="dir-why__copy">
                  {sectionHead}
                  {paras.slice(0, 2).map((pp, i) => (
                    <Rich key={i} value={pp} paths={paths} />
                  ))}
                  {paras.length > 2 && (
                    <details className="dir-why__more">
                      <summary>Read more</summary>
                      {paras.slice(2).map((pp, i) => (
                        <Rich key={i} value={pp} paths={paths} />
                      ))}
                    </details>
                  )}
                </div>
                <div className="dir-why__cards">
                  {items
                    .filter((i) => i.values.adv)
                    .map((item, i) => (
                      <div key={item.n} className="dir-adv rv" style={{ transitionDelay: `${i * 0.08}s` }}>
                        <i aria-hidden="true">
                          <V2Icon name="check" />
                        </i>
                        <Rich value={item.values.adv} paths={paths} />
                      </div>
                    ))}
                </div>
              </div>
            </section>
          );
        }
        // Engagement models: three tinted cards with the name, what it is and who it is for.
        if (s.id === "engagement-models" && items.some((i) => i.values.model_name)) {
          return (
            <section key={s.id} id={s.id} className={band(s.id) + " dir-sec"} aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
              <div className="wrap">
                {sectionHead}
                <div className="dir-models">
                  {items
                    .filter((i) => i.values.model_name)
                    .map((item, i) => (
                      <article key={item.n} className={`dir-model dir-model--${TINTS[i % TINTS.length]} rv`} style={{ transitionDelay: `${i * 0.1}s` }}>
                        <h3>{item.values.model_name}</h3>
                        {item.values.model_body && <Rich value={item.values.model_body} paths={paths} />}
                        {item.values.model_best_for && (
                          <p className="dir-model__for">
                            <b>Best for</b> {item.values.model_best_for}
                          </p>
                        )}
                      </article>
                    ))}
                </div>
              </div>
            </section>
          );
        }
        // Related hubs: colour cards with each hub's spot icon, like the overview.
        if (s.id === "related-hubs" && items.some((i) => i.values.hub_name)) {
          return (
            <section key={s.id} id={s.id} className={band(s.id) + " dir-sec"} aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
              <div className="wrap">
                {sectionHead}
                <div className="dir-areas dir-areas--3">
                  {items
                    .filter((i) => i.values.hub_name)
                    .map((item, i) => {
                      const href = item.values.hub_url ? dest(item.values.hub_url) : undefined;
                      const inner = (
                        <>
                          <span className="dir-area__top">
                            <img src={v2img(spotForPage(item.values.hub_url ?? "", item.values.hub_name, i))} alt="" loading="lazy" />
                          </span>
                          <h3>{item.values.hub_name}</h3>
                          {item.values.hub_body && <p>{item.values.hub_body}</p>}
                          {href && (
                            <span className="dir-area__go" aria-hidden="true">
                              <V2Icon name="arrow" />
                            </span>
                          )}
                        </>
                      );
                      const cls = `dir-area dir-area--${TINTS[i % TINTS.length]} rv`;
                      return href ? (
                        <a key={item.n} className={cls} href={href}>
                          {inner}
                        </a>
                      ) : (
                        <div key={item.n} className={cls}>
                          {inner}
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          );
        }
        return (
          <section key={s.id} id={s.id} className={band(s.id)} aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              {head && (
                <div className="sec__head sec__head--left">
                  {f.section_label && <p className="eyebrow">{f.section_label}</p>}
                  {f.heading && (
                    <h2 className="h2" id={`${s.id}-h`}>
                      {f.heading}
                    </h2>
                  )}
                  {leadKey && <Rich value={f[leadKey]} paths={paths} className="lead" />}
                </div>
              )}
              {items.length > 0 && (
                <div className="catgrid catgrid--4">
                  {items.map((item) => (
                    <ItemCard key={item.n} item={item} paths={paths} dest={dest} />
                  ))}
                </div>
              )}
              {loose.map((k) => (
                <div key={k} className="rv">
                  <Rich value={f[k]} paths={paths} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {faqItems.length > 0 && (
        <section id="faq" className="sec" aria-labelledby={faq?.fields.heading ? "faq-h" : undefined}>
          {faqItems.length >= 6 ? (
            <div className="wrap sc-faq">
              <div className="sc-faq__head rv">
                {faq?.fields.section_label && <span className="eyebrow">{faq.fields.section_label}</span>}
                {faq?.fields.heading && (
                  <h2 className="h2" id="faq-h">
                    {faq.fields.heading}
                  </h2>
                )}
              </div>
              <div className="sc-faq__cols rv">
                <FAQAccordion name="services-faq-a" items={faqItems.slice(0, Math.ceil(faqItems.length / 2))} />
                <FAQAccordion name="services-faq-b" items={faqItems.slice(Math.ceil(faqItems.length / 2))} />
              </div>
            </div>
          ) : (
            <div className="wrap faq">
              <div className="faq__aside rv">
                {faq?.fields.section_label && <span className="eyebrow">{faq.fields.section_label}</span>}
                {faq?.fields.heading && (
                  <h2 className="h2" id="faq-h">
                    {faq.fields.heading}
                  </h2>
                )}
              </div>
              <div className="rv">
                <FAQAccordion name="services-faq" items={faqItems} />
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
