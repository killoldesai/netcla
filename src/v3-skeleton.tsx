import type { CSSProperties, ReactNode } from "react";
import { iconFor, legacyIcon } from "./icon-set";
import { company, founderPage } from "./company";
import { TechIcon } from "./brand-icon";
import { sanitizeRichHTML } from "./rich-text";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillarFor, sitePages } from "./site-structure";
import { mediaPath } from "./media-path";
import { familyOf } from "./prompts/templates";
import { iconKeys } from "./page-spec-schema";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon, ProductIcon } from "./site/ui";
import { GuideArt } from "./site/art/guide-art";
import { HireArt } from "./site/art/hire-art";
import { IndustriesHubArt } from "./site/art/industries-hub-art";
import { IndustryArt } from "./site/art/industry-art";
import { LocationArt } from "./site/art/location-art";
import { PillarArt } from "./site/art/pillar-art";
import { ServiceArt } from "./site/art/service-art";
import { TechnologyArt } from "./site/art/technology-art";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Frontend for the canonical page skeleton (see familySections in prompts/templates.ts).
// Every commercial family (hub, service, technology, hire, industry, location) and every guide renders
// through these components, so the pages look and read alike. Markup follows html-prototype/service.html
// and its family variants; styles live in public/assets/nx/site.css and pages/skeleton.css (guides: pages/guide.css).

/** True for pages generated from the skeleton; older drafts keep the legacy renderer until regenerated. */
export function isSkeletonContent(content: Content, path: string) {
  const family = familyOf(path);
  if (family === "guide") return !!content.pageSections?.some((s) => s.id === "key-takeaways" && !s.omitted);
  return family !== "other" && !!content.pageSections?.some((s) => s.id === "cost-factors" && !s.omitted);
}

const isChapter = (id: string) => /^editorial-\d+$/.test(id);
/** Guide sections that sit inside the article block (takeaways, chapters, FAQ and related services). */
const inArticle = (id: string) => id === "key-takeaways" || isChapter(id) || id === "faq" || id === "related-services";

type Props = {
  content: Content;
  path: string;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  published?: string | Date | null;
  modified?: string | Date | null;
};

const shortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DAY = 86_400_000;

// Sections on the dark band (paper and white alternate around them).
const DARK = new Set(["process", "engagement-models"]);
const NAV_LABELS: Record<string, string> = {
  "service-overview": "Overview",
  "services-grid": "Services",
  "what-we-deliver": "What we deliver",
  process: "Process",
  "why-netofficials": "Why us",
  "technology-stack": "Technology",
  "engagement-models": "Engagement",
  "compliance-data": "Compliance",
  "cost-factors": "Cost & timeline",
  faq: "FAQ",
};

/** Product icon for a card: the generated icon_key when it is an approved key, otherwise a key picked from the text. */
const productForLegacy: Record<string, string> = {};
for (const [product, legacy] of Object.entries(legacyIcon)) if (!(legacy in productForLegacy)) productForLegacy[legacy] = product;
const spreadIcons = ["layers-stack", "chart-bar", "settings-gear", "users-group", "shield-check", "rocket-launch"];
function productIcon(key: string | undefined, text: string, index?: number) {
  if (key && (iconKeys as readonly string[]).includes(key)) return key;
  const mapped = productForLegacy[iconFor(text)];
  if (mapped && mapped !== "layers-stack") return mapped;
  return index === undefined ? "layers-stack" : spreadIcons[index % spreadIcons.length];
}

/** Rows of a numbered field family: prefix_1_a, prefix_1_b ... */
function numbered(fields: Record<string, string>, prefix: string, keys: string[], max = 8) {
  const rows: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) rows.push(row);
  }
  return rows;
}

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const words = (value: string) => value.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Staggered reveal delay for card N in a row of three, as the prototype does. */
const delay = (i: number) => ({ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }) as CSSProperties;

/** "Healthcare Mobile App Development" links to the healthcare industry page when it is live. */
function industryPage(name: string, paths: string[]) {
  const lower = name.toLowerCase();
  return sitePages.find((p) => p.type === "industry" && paths.includes(p.path) && lower.includes(p.label.toLowerCase().split(/[ &/]/)[0]))?.path;
}

function Rich({ value, paths, className }: { value: string; paths: string[]; className?: string }) {
  if (!value) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"nx-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header: eyebrow (section_label) and h2 (heading), each only when the content has it. */
function Head({ f, lead, className = "" }: { f: Record<string, string>; lead?: ReactNode; className?: string }) {
  if (!f.section_label && !f.heading && !lead) return null;
  return (
    <div className={`section-head nx-reveal ${className}`.trim()}>
      <div>
        {f.section_label && <span className="eyebrow">{f.section_label}</span>}
        {f.heading && <h2 className="h-section">{f.heading}</h2>}
      </div>
      {lead}
    </div>
  );
}

/** Heading block for the sticky side of a split section: eyebrow, h2 and optional lead. */
function SplitHead({ f, lead }: { f: Record<string, string>; lead?: ReactNode }) {
  return (
    <header className="sk-splithead">
      {f.section_label && <span className="eyebrow">{f.section_label}</span>}
      {f.heading && <h2 className="h-section">{f.heading}</h2>}
      {lead}
    </header>
  );
}

/** Guide chapter header (FAQ and related services inside the article): kicker and h2 only. */
function GuideHead({ f }: { f: Record<string, string> }) {
  return (
    <>
      {f.section_label && (
        <div className="guide-kicker">
          <span className="eyebrow">{f.section_label}</span>
        </div>
      )}
      {f.heading && <h2>{f.heading}</h2>}
    </>
  );
}

/** Primary CTA: the prototype's nx-btn with the existing TrackedLink analytics. */
function Cta({ href, service, label, variant = "primary", size }: { href: string; service: string; label: string; variant?: "primary" | "lime"; size?: "lg" }) {
  return (
    <TrackedLink href={href} event="consultation_click" service={service} className={`nx-btn nx-btn--${variant}${size ? ` nx-btn--${size}` : ""}`}>
      <span>{label}</span>
      <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
    </TrackedLink>
  );
}

/** Fallback illustration per page family (the section's own image replaces it when the page has one). */
function fallbackArt(path: string, family: ReturnType<typeof familyOf>) {
  if (path === "/industries") return <IndustriesHubArt />;
  switch (family) {
    case "hub":
      return <PillarArt />;
    case "technology":
      return <TechnologyArt />;
    case "hire":
      return <HireArt />;
    case "industry":
      return <IndustryArt />;
    case "location":
      return <LocationArt />;
    case "guide":
      return <GuideArt />;
    default:
      return <ServiceArt />;
  }
}

export function SkeletonSections({ content, path, paths, preview = false, linkMap = {}, published, modified }: Props) {
  const destination = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const sections = (content.pageSections ?? []).filter((s) => !s.omitted);
  const pillar = pillarFor(path);
  const service = pillar?.service ?? "Help defining the scope";
  const contact = destination("/contact") + "?service=" + encodeURIComponent(service);
  const trail = breadcrumbs(path, sections.find((s) => s.id === "hero")?.fields.h1 || content.title);
  const facts = (content.seo?.keyFacts ?? []).filter(Boolean).slice(0, 6);
  const family = familyOf(path);
  const guide = family === "guide";
  const hub = family === "hub";
  const sectors = pillar?.id === "industries";

  // Background rhythm: hero paper, dark band for process and engagement, paper and white alternating between.
  const tone = new Map<string, string>();
  let flip = true;
  for (const s of sections) {
    if (s.id === "hero" || inArticle(s.id)) continue;
    if (DARK.has(s.id)) tone.set(s.id, "band");
    else {
      tone.set(s.id, flip ? "paper" : "white");
      flip = !flip;
    }
  }
  const nav = guide ? [] : sections.filter((s) => NAV_LABELS[s.id]).slice(0, 7);
  const takeaways = sections.find((s) => s.id === "key-takeaways");
  const chapters = sections.filter((s) => isChapter(s.id));
  const readMinutes = Math.max(1, Math.round([takeaways, ...chapters].reduce((n, s) => n + (s ? Object.values(s.fields).reduce((m, v) => m + words(v), 0) : 0), 0) / 230));
  const initials = company.founder.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function Hero({ s }: { s: PageSection }) {
    const f = s.fields;
    const pillarLabel = f.tag_pill || pillar?.label;
    const cls = "page-hero" + (hub ? " hub-hero" : "") + (guide ? " guide-hero" : "");
    return (
      <section id={s.id} className={cls}>
        <div className="container">
          <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : destination(c.path) }))} />
          <div className="hero__grid">
            <div>
              {pillarLabel && <span className="tag-pill">{pillarLabel}</span>}
              <h1>{f.h1 || content.title}</h1>
              {f.subheadline && <p className="lead">{f.subheadline}</p>}
              {guide && (
                <p className="guide-meta">
                  <span className="guide-byline">
                    <span className="guide-avatar" aria-hidden="true">{initials}</span>
                    <span>
                      By{" "}
                      <a href={founderPage} rel="author">
                        {company.founder.name}
                      </a>
                    </span>
                  </span>
                  <span>{readMinutes} min read</span>
                  {published && <span><time dateTime={new Date(published).toISOString()}>Published {shortDate(published)}</time></span>}
                  {modified && published && new Date(modified).getTime() - new Date(published).getTime() > DAY && (
                    <span><time dateTime={new Date(modified).toISOString()}>Updated {shortDate(modified)}</time></span>
                  )}
                </p>
              )}
              <div className="hero__actions">
                <Cta href={contact} service={service} label={f.cta_primary_label || "Get a scoped estimate"} size="lg" />
                {f.cta_secondary_label && <ArrowLink href={destination(f.cta_secondary_url || "/how-we-work")}>{f.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
            <HeroArt asset={s.asset} fallback={fallbackArt(path, family)} priority />
          </div>
        </div>
      </section>
    );
  }

  function SubNav() {
    return (
      <nav className="subnav" aria-label="On this page" data-subnav>
        <div className="container">
          <ul className="subnav__list">
            {nav.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{NAV_LABELS[s.id]}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  function Overview({ s }: { s: PageSection }) {
    const f = s.fields;
    const body = f.body_paragraph ?? "";
    const first = body.match(/^\s*<p>([\s\S]*?)<\/p>/i);
    const rest = first ? body.slice(first[0].length) : "";
    const outcomes = Object.entries(f).filter(([k, v]) => v && /^outcome_\d+$/.test(k)).map(([, v]) => v);
    return (
      <div className="container overview">
        <header className="overview__head nx-reveal">
          {f.section_label && <span className="eyebrow">{f.section_label}</span>}
          {f.heading && <h2 className="h-section">{f.heading}</h2>}
        </header>
        {first && (
          <div className="quick overview__quick nx-reveal">
            <p className="quick__label">Quick answer</p>
            <Rich value={`<p>${first[1]}</p>`} paths={paths} className="lead" />
          </div>
        )}
        <div className="overview__main nx-reveal">
          <Rich value={first ? rest : body} paths={paths} className="overview__body" />
        </div>
        {(facts.length > 0 || s.asset) && (
          <div className="overview__side">
            {facts.length > 0 && (
              <aside className="facts nx-reveal" aria-labelledby={`${s.id}-facts`}>
                <p className="facts__title" id={`${s.id}-facts`}>At a glance</p>
                <ul className="facts__list">
                  {facts.map((fact) => (
                    <li key={fact}>
                      <Icon name="check" size={20} />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <TrackedLink href={contact} event="consultation_click" service={service} className="nx-arrowlink">
                  <span>Get a scoped estimate</span>
                  <Icon name="arrow-right" size={18} />
                </TrackedLink>
              </aside>
            )}
            <HeroArt asset={s.asset} />
          </div>
        )}
        {outcomes.length > 0 && (
          <ul className="overview__outcomes nx-reveal">
            {outcomes.map((o) => (
              <li key={o}>
                <Icon name="check" size={20} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function Body({ s }: { s: PageSection }) {
    const f = s.fields;
    switch (s.id) {
      case "service-overview":
        return <Overview s={s} />;
      case "services-grid": {
        const rows = numbered(f, "svc", ["title", "body", "url", "icon_key"], 12);
        const label = `Open a ${pillar?.id === "hire" ? "role" : pillar?.id === "industries" ? "sector" : "service"} to see what it covers, when to choose it and where to read more.`;
        return (
          <div className="container">
            <Head f={f} lead={<p className="lead">{label}</p>} />
            {sectors ? (
              <div className="ind-grid nx-reveal">
                {rows.map((r) => {
                  const inner = (
                    <>
                      <div className="ind__main">
                        <span className="ind__icon" aria-hidden="true">
                          <ProductIcon name={productIcon(r.icon_key, r.title)} size={26} />
                        </span>
                        <div>
                          <strong>{r.title}</strong>
                          <span>{r.body}</span>
                        </div>
                      </div>
                      {r.url && <Icon name="arrow-right" size={18} />}
                    </>
                  );
                  return r.url ? (
                    <a className="ind" key={r.title} href={destination(r.url)}>
                      {inner}
                    </a>
                  ) : (
                    <div className="ind" key={r.title}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={"hub-cards nx-reveal" + (rows.length % 3 === 0 ? " hub-cards--three" : "")}>
                {rows.map((r, i) => {
                  const inner = (
                    <>
                      <span className="sk-card__icon" aria-hidden="true">
                        <ProductIcon name={productIcon(r.icon_key, r.title)} size={26} />
                      </span>
                      <span className="sk-card__title">{r.title}</span>
                      <span className="sk-card__text">{r.body}</span>
                    </>
                  );
                  return r.url ? (
                    <a className="sk-card hub-card" key={r.title} href={destination(r.url)} style={delay(i)}>
                      {inner}
                    </a>
                  ) : (
                    <div className="sk-card hub-card" key={r.title} style={delay(i)}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      case "what-we-deliver": {
        const rows = numbered(f, "card", ["title", "body", "icon_key"], 6);
        return (
          <div className="container sk-split">
            <div className="sk-sticky nx-reveal">
              <SplitHead f={f} />
            </div>
            <ol className="sk-rows">
              {rows.map((r, i) => (
                <li className="sk-row nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={productIcon(r.icon_key, r.title, i)} size={26} />
                  </span>
                  <div>
                    <h3 className="sk-card__title">{r.title}</h3>
                    <p className="sk-card__text">{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "why-netofficials": {
        const adv = Object.entries(f).filter(([k, v]) => v && /^adv_\d+$/.test(k)).map(([, v]) => v);
        return (
          <div className="container">
            <Head f={f} lead={<Rich value={f.body_paragraph ?? ""} paths={paths} className="lead" />} />
            <ul className="sk-stack sk-why">
              {adv.map((a, i) => (
                <li className="sk-stack__group sk-adv nx-reveal" key={a} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={productIcon(undefined, a, i)} size={26} />
                  </span>
                  <p className="sk-card__text">{a}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      case "process": {
        const steps = numbered(f, "step", ["title", "body"], 6);
        return (
          <div className="container">
            <Head f={f} />
            <ol className={"nx-steps" + (steps.length === 5 ? " nx-steps--five" : "")} data-steps>
              {steps.map((st, i) => (
                <li className="nx-step nx-reveal" key={st.title} style={delay(i)}>
                  <h3 className="nx-step__title">{st.title}</h3>
                  <p className="nx-step__desc">{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "technology-stack": {
        const groups = numbered(f, "group", ["name", "items"], 6);
        return (
          <div className="container">
            <Head f={f} />
            <div className="sk-tabs nx-reveal" data-tabs>
              <div className="sk-tabs__rail" role="tablist" aria-orientation="vertical">
                {groups.map((g, i) => (
                  <button type="button" role="tab" id={`stk-tab-${i}`} aria-controls={`stk-panel-${i}`} aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} className="sk-tabs__tab" key={g.name}>
                    <span>{g.name}</span>
                    <small>{g.items.split(/[,|;]/).filter((x) => x.trim()).length}</small>
                  </button>
                ))}
              </div>
              <div className="sk-tabs__panels">
                {groups.map((g, i) => (
                  <div role="tabpanel" id={`stk-panel-${i}`} aria-labelledby={`stk-tab-${i}`} hidden={i !== 0} className="sk-tabs__panel" key={g.name}>
                    <h3 className="sk-stack__name">{g.name}</h3>
                    <ul className="sk-tiles">
                      {g.items.split(/[,|;]/).map((x) => x.trim()).filter(Boolean).map((item) => (
                        <li key={item}>
                          <TechIcon name={item} context={g.name} className="sk-tech-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case "who-its-for": {
        const rows = numbered(f, "persona", ["title", "problem", "outcome"], 4);
        return (
          <div className="container sk-split">
            <div className="sk-sticky nx-reveal">
              <SplitHead f={f} />
            </div>
            <ol className="sk-rows">
              {rows.map((r, i) => (
                <li className="sk-row nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={productIcon(undefined, r.title, i)} size={26} />
                  </span>
                  <div>
                    <h3 className="sk-card__title">{r.title}</h3>
                    <p className="sk-card__label">The problem</p>
                    <p className="sk-card__text">{r.problem}</p>
                    <p className="sk-card__label">The outcome</p>
                    <p className="sk-card__text">{r.outcome}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "industry-applications": {
        const rows = numbered(f, "industry", ["name", "url", "usecase"], 6);
        return (
          <div className="container">
            <Head f={f} lead={<ArrowLink href={contact}>Your industry not listed? Tell us about it</ArrowLink>} />
            <div className={"ind-grid nx-reveal" + (rows.length > 4 ? " ind-grid--three" : "")}>
              {rows.map((r) => {
                const link = r.url || industryPage(r.name, paths);
                const inner = (
                  <>
                    <div className="ind__main">
                      <span className="ind__icon" aria-hidden="true">
                        <ProductIcon name={productIcon(undefined, r.name)} size={26} />
                      </span>
                      <div>
                        <strong>{r.name}</strong>
                        <span>{r.usecase}</span>
                      </div>
                    </div>
                    {link && <Icon name="arrow-right" size={18} />}
                  </>
                );
                return link ? (
                  <a className="ind" key={r.name} href={destination(link)}>
                    {inner}
                  </a>
                ) : (
                  <div className="ind" key={r.name}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case "compliance-data": {
        const rows = numbered(f, "item", ["title", "body"], 6);
        return (
          <div className="container">
            <Head f={f} />
            <div className="sk-cards ind-comp">
              {rows.map((r, i) => (
                <article className="sk-card nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name="shield-check" size={26} />
                  </span>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <p className="sk-card__text">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "engagement-models": {
        const rows = numbered(f, "model", ["name", "body", "best_for"], 4);
        return (
          <div className="container">
            <div className="engage">
              <div className="nx-reveal">
                {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                {f.heading && <h2 className="h-section">{f.heading}</h2>}
              </div>
              <div className="nx-reveal">
                <div className="nx-seg" role="radiogroup" aria-label="Engagement model" data-seg>
                  <span className="nx-seg__thumb" aria-hidden="true" />
                  {rows.map((r, i) => (
                    <button
                      type="button"
                      key={r.name}
                      className="nx-seg__opt"
                      role="radio"
                      aria-checked={i === 0}
                      tabIndex={i === 0 ? 0 : -1}
                      data-value={slug(r.name)}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
                {rows.map((r, i) => (
                  <div className="model" key={r.name} data-model={slug(r.name)} aria-live="polite" hidden={i !== 0}>
                    <h3>{r.name}</h3>
                    <p>{r.body}</p>
                    {r.best_for && (
                      <span className="nx-badge nx-badge--lime model__best">
                        <span className="nx-badge__dot" aria-hidden="true" />
                        Best for {r.best_for}
                      </span>
                    )}
                    <div className="model__actions">
                      <Cta href={contact} service={service} label="Get a scoped estimate" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case "cost-factors": {
        const rows = numbered(f, "factor", ["title", "body"], 6);
        return (
          <div className="container sk-split">
            <div className="sk-sticky nx-reveal">
              <SplitHead f={f} lead={<Rich value={f.subheadline ?? ""} paths={paths} className="lead" />} />
              <div className="sk-actions">
                <Cta href={contact} service={service} label="Get a scoped estimate" />
              </div>
            </div>
            <ol className="sk-rows">
              {rows.map((r, i) => (
                <li className="sk-row nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={productIcon(undefined, r.title, i)} size={26} />
                  </span>
                  <div>
                    <h3 className="sk-card__title">{r.title}</h3>
                    <p className="sk-card__text">{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "faq":
        return <FaqBlock f={f} />;
      case "related-services":
      case "related-hubs":
        return <RelatedBlock s={s} />;
      case "cta-banner":
        return (
          <div className="container">
            <div className="nx-cta nx-cta--indigo nx-reveal">
              <div>
                {f.heading && <h2 className="nx-cta__title">{f.heading}</h2>}
                {f.subheadline && <p className="nx-cta__desc">{f.subheadline}</p>}
              </div>
              <div className="sk-cta-actions">
                <Cta href={contact} service={service} label={f.cta_primary_label || "Get a scoped estimate"} variant="lime" size="lg" />
                {f.cta_secondary_label && <ArrowLink href={destination(f.cta_secondary_url || "/how-we-work")}>{f.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function FaqBlock({ f }: { f: Record<string, string> }) {
    const pairs = Object.keys(f).filter((k) => /^q\d+$/.test(k) && f[k] && f[k.replace("q", "a")]);
    const items = pairs.map((k) => ({ q: f[k], a: <Rich value={f[k.replace("q", "a")]} paths={paths} /> }));
    if (guide) {
      return (
        <>
          <GuideHead f={f} />
          <FaqList items={items} name="skeleton-faq" />
        </>
      );
    }
    return (
      <div className="container faq">
        <div className="faq__aside nx-reveal">
          {f.section_label && <span className="eyebrow">{f.section_label}</span>}
          {f.heading && <h2 className="h-section">{f.heading}</h2>}
          <ArrowLink href={contact}>Ask us directly</ArrowLink>
        </div>
        <div className="nx-reveal">
          <FaqList items={items} name="skeleton-faq" />
        </div>
      </div>
    );
  }

  function RelatedBlock({ s }: { s: PageSection }) {
    const f = s.fields;
    const hubRows = s.id === "related-hubs";
    const rows = hubRows ? numbered(f, "hub", ["name", "body", "url"], 4) : numbered(f, "service", ["name", "reason", "url"], 4);
    const links = (
      <div className="more nx-reveal">
        {rows.map((r) => (
          <a key={r.name} href={destination(r.url || "/services")}>
            <div>
              <strong>{r.name}</strong>
              <span>{hubRows ? r.body : r.reason}</span>
            </div>
            <Icon name="arrow-right" size={20} />
          </a>
        ))}
      </div>
    );
    if (guide) {
      return (
        <>
          <GuideHead f={f} />
          {links}
        </>
      );
    }
    return (
      <div className="container">
        <Head f={f} />
        {links}
      </div>
    );
  }

  /** Guide article: contents rail, key takeaways, chapters with an inline CTA, FAQ and related services. */
  function Article() {
    const toc = chapters.map((s) => ({ id: s.id, text: s.fields.section_label || s.fields.heading }));
    const ctaAfter = chapters.length > 1 ? chapters[1].id : chapters[chapters.length - 1]?.id;
    const body = sections.filter((s) => inArticle(s.id));
    return (
      <section id="guide" className="section section--white guide-article">
        <div className="container guide-layout">
          <aside className="guide-rail">
            <nav className="guide-toc" aria-label="On this page" data-subnav>
              <h2>On this page</h2>
              <ol>
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`}>{t.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="guide-main">
            {toc.length > 0 && (
              <details className="guide-toc-m">
                <summary>On this page</summary>
                <ol>
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>{t.text}</a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            {body.map((s) => {
              if (s.id === "key-takeaways")
                return (
                  <section key={s.id} id={s.id} className="guide-takeaways nx-reveal" aria-labelledby="key-takeaways-title">
                    <h2 id="key-takeaways-title">{s.fields.heading || "Key takeaways"}</h2>
                    <Rich value={s.fields.body_paragraph ?? ""} paths={paths} />
                  </section>
                );
              if (s.id === "faq")
                return (
                  <section key={s.id} id={s.id} className="guide-chapter guide-faq">
                    <FaqBlock f={s.fields} />
                  </section>
                );
              if (s.id === "related-services")
                return (
                  <section key={s.id} id={s.id} className="guide-chapter guide-related">
                    <RelatedBlock s={s} />
                  </section>
                );
              return (
                <div key={s.id}>
                  <section id={s.id} className="guide-chapter" aria-labelledby={`${s.id}-title`}>
                    {s.fields.section_label && (
                      <div className="guide-kicker">
                        <span className="eyebrow">{s.fields.section_label}</span>
                      </div>
                    )}
                    <h2 id={`${s.id}-title`}>{s.fields.heading}</h2>
                    {s.asset && (
                      <figure className="guide-figure">
                        <img src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} loading="lazy" />
                      </figure>
                    )}
                    <Rich value={s.fields.body_paragraph ?? ""} paths={paths} />
                  </section>
                  {s.id === ctaAfter && (
                    <aside className="guide-cta nx-reveal" aria-labelledby="guide-cta-title">
                      <div>
                        <h3 id="guide-cta-title">Planning a project?</h3>
                        <p>Share a short brief and get questions, an initial scope and the team it needs.</p>
                      </div>
                      <TrackedLink href={contact} event="consultation_click" service={service} className="nx-btn nx-btn--lime">
                        <span>Get a scoped estimate</span>
                        <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                      </TrackedLink>
                    </aside>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  function Author() {
    return (
      <section className="section guide-author-section">
        <div className="container">
          <div className="guide-author nx-reveal" aria-labelledby="author-title">
            <span className="guide-avatar guide-avatar--lg" aria-hidden="true">{initials}</span>
            <div>
              <h2 id="author-title">{company.founder.name}</h2>
              <p className="guide-author__role">{company.founder.jobTitle}, Netofficials</p>
              {company.founder.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <ArrowLink href={founderPage}>Read the full profile</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const out: ReactNode[] = [];
  let articleDone = false;
  let authorDone = false;
  for (const s of sections) {
    if (s.id === "hero") {
      out.push(<Hero key={s.id} s={s} />);
      if (!guide) out.push(<SubNav key="subnav" />);
      continue;
    }
    if (guide && inArticle(s.id)) {
      if (!articleDone) {
        articleDone = true;
        out.push(<Article key="article" />);
      }
      continue;
    }
    if (guide && !authorDone) {
      authorDone = true;
      out.push(<Author key="author" />);
    }
    const tint = tone.get(s.id);
    const cls =
      "section" +
      (tint === "white" ? " section--white" : "") +
      (tint === "band" ? " band" : "") +
      (sectors && s.id === "services-grid" ? " sectors" : "");
    out.push(
      <section key={s.id} id={s.id} className={cls}>
        <Body s={s} />
      </section>,
    );
  }
  if (guide && !authorDone) out.push(<Author key="author" />);
  return <>{out}</>;
}
