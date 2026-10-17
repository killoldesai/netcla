import { Fragment, type ReactNode } from "react";
import { company, founderPage } from "./company";
import { sanitizeRichHTML } from "./rich-text";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillarFor, sitePage, sitePages } from "./site-structure";
import { familyOf } from "./prompts/templates";
import { V2Art, V2Crumbs, V2Icon, V2Img, V2_VERSION, TechMark, v2img, type V2IconName } from "./site/v2/ui";
import { PAGE_KIND, relTint, spotForPage } from "./site/v2/spots";
import { ServiceBoard } from "./site/v2/service-board";
import { HeroScene, hireChar, hireRole, sceneFor } from "./site/v2/hero-scenes";
import { ReadingProgress } from "./site/v2/reading-progress";
import { DeliverMock, mockKind } from "./site/v2/deliver-mocks";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Frontend for the canonical page skeleton (see familySections in prompts/templates.ts).
// Every commercial family (hub, service, technology, hire, industry, location) and every guide renders through
// these components. Markup and classes follow the v2 prototypes in html-prototype/v2/ (service.html for the
// shared sections, pillar.html, technology.html, hire.html, industry.html, location.html, industries-hub.html and
// guide.html for the family pages). Styles: public/assets/v2/ (V2_PORTED.skeleton loads pages/service.css).

/** True for pages generated from the skeleton; older drafts keep the legacy renderer until regenerated. */
export function isSkeletonContent(content: Content, path: string) {
  const family = familyOf(path);
  if (family === "guide") return !!content.pageSections?.some((s) => s.id === "key-takeaways" && !s.omitted);
  return family !== "other" && !!content.pageSections?.some((s) => s.id === "cost-factors" && !s.omitted);
}

const isChapter = (id: string) => /^editorial-\d+$/.test(id);
/** Guide sections that sit inside the article block (key takeaways and the numbered chapters). */
const inArticle = (id: string) => id === "key-takeaways" || isChapter(id);

type Props = {
  content: Content;
  path: string;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  published?: string | Date | null;
  modified?: string | Date | null;
  /** Case studies block, placed before the closing CTA band so the page still ends on the call to action. */
  studies?: ReactNode;
};

const shortDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DAY = 86_400_000;

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

/** Spot icon (3D tile) for a card: the mapped icon when the page gives a known key, otherwise a rotating set. */
const SPOT_BY_KEY: Record<string, string> = {
  "code-brackets": "ic-software",
  "layers-stack": "ic-software",
  "react-atom": "ic-software",
  "nodejs-hexagon": "ic-software",
  "mobile-device": "ic-mobile",
  "flutter-diamond": "ic-mobile",
  "brain-circuit": "ic-ai",
  "python-snake": "ic-ai",
  "cloud-upload": "ic-cloud",
  "aws-cloud": "ic-cloud",
  "settings-gear": "ic-devops",
  "api-plug": "ic-devops",
  "kubernetes-wheel": "ic-devops",
  "docker-whale": "ic-devops",
  "terraform-blocks": "ic-devops",
  "shield-check": "ic-security",
  "users-group": "ic-team",
  "rocket-launch": "ic-milestones",
  "chart-bar": "ic-scope",
  "document-text": "ic-handover",
};
const SPOT_SET = ["ic-software", "ic-scope", "ic-milestones", "ic-team", "ic-security", "ic-cost", "ic-support", "ic-handover"];
const spotFor = (key: string | undefined, index = 0) => (key && SPOT_BY_KEY[key]) || SPOT_SET[index % SPOT_SET.length];

/** Industry spot icons, matched on the sector name. */
const INDUSTRY_SPOTS: [RegExp, string][] = [
  [/health|clinic|medic|patient|care/i, "ic-healthcare"],
  [/fintech|financ|bank|payment|lend|invest/i, "ic-fintech"],
  [/edu|learn|school|course|student/i, "ic-edtech"],
  [/estate|propert/i, "ic-realestate"],
  [/logist|freight|shipping|supply|fleet|warehouse/i, "ic-logistics"],
  [/on.?demand|marketplace/i, "ic-ondemand"],
  [/retail|shop|store|commerce/i, "ic-retail"],
  [/travel|hotel|hospitality|tour/i, "ic-travel"],
  [/\blegal\b|\blaw\b/i, "ic-legal"],
  [/\bhr\b|hrtech|recruit|payroll|talent/i, "ic-hr"],
  [/insur/i, "ic-insurance"],
  [/manufact|factory|industrial/i, "ic-manufacturing"],
];
const industrySpot = (name: string, index: number) => INDUSTRY_SPOTS.find(([re]) => re.test(name))?.[1] ?? SPOT_SET[index % 4];

/** Pastel tints for industry cards, timeline numbers and tiles, in the prototype's order. */
const TINTS = ["--p-lavender", "--p-sky", "--p-lime", "--p-peach", "--p-peri"];
const tint = (i: number) => ({ background: `var(${TINTS[i % TINTS.length]})` });
const SPOT_BY_PILLAR: Record<string, string> = { software: "ic-software", mobile: "ic-mobile", ai: "ic-ai", cloud: "ic-cloud", web: "ic-software", marketing: "ic-scope", hire: "ic-team", industries: "ic-healthcare" };
const CHARACTERS = ["char-lead", "char-fullstack", "char-devops", "char-react"];
/** Family pages without their own hero image fall back to a shipped v2 image. */
const FAMILY_FALLBACK: Record<string, string> = { hire: "char-lead", industry: "char-data", location: "char-lead" };
/** Family stylesheet loaded on top of the skeleton's page css (service.css is loaded by the renderer's V2_PORTED entry). */
const FAMILY_CSS: Record<string, string> = { hub: "pillar", technology: "technology", hire: "hire", industry: "industry", location: "location" };

/**
 * Service pages use the animated showcase layout (a hero scene picked from the page topic, product mockups for each
 * deliverable, workflow, stacked persona cards, floating cost cards). Set this to a Set of paths to limit it to those
 * pages while reviewing a change.
 */
/** Page families on the showcase layout. */
export const SHOWCASE_FAMILIES: ReadonlySet<string> = new Set(["service", "technology", "hire", "industry", "location", "hub"]);
export const SHOWCASE_PATHS: ReadonlySet<string> | "all-services" = "all-services";
const SHOWCASE_IDS = new Set(["service-overview", "what-we-deliver", "process", "technology-stack", "who-its-for", "cost-factors"]);

/** Primary CTA: TrackedLink with the consultation analytics event. */
function Cta({ href, service, label, variant = "violet" }: { href: string; service: string; label: string; variant?: "grad" | "violet" | "white" }) {
  return (
    <TrackedLink href={href} event="consultation_click" service={service} className={`btn btn--${variant}`}>
      {label} <V2Icon name="arrow" />
    </TrackedLink>
  );
}

/** "Healthcare Mobile App Development" links to the healthcare industry page when it is live. */
function industryPage(name: string, paths: string[]) {
  const lower = name.toLowerCase();
  return sitePages.find((p) => p.type === "industry" && paths.includes(p.path) && lower.includes(p.label.toLowerCase().split(/[ &/]/)[0]))?.path;
}

function Rich({ value, paths, className }: { value: string; paths: string[]; className?: string }) {
  if (!value) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Each <p> block of a rich-text field as its own HTML string (a plain-text value counts as one paragraph). */
function splitParagraphs(value: string): string[] {
  if (!value) return [];
  if (!hasHtml(value)) return [value];
  const blocks = value.match(/<p[\s>][\s\S]*?<\/p>/gi);
  return blocks && blocks.length > 0 ? blocks : [value];
}

/** Labels for overview paragraphs 2 to 4, in the order the generation prompt writes them. */
const DETAIL_LABELS = ["What is covered", "Who it is for", "How delivery runs"];
const HUB_DETAIL_LABELS = ["What is covered", "How to choose", "How delivery runs"];
const DETAIL_ICONS: V2IconName[] = ["layers", "users", "rocket"];

/** Section header (sec__head): eyebrow, h2 and an optional lead. Omitted when the content has no heading. */
function Head({ s, lead, className = "" }: { s: PageSection; lead?: ReactNode; className?: string }) {
  const f = s.fields;
  if (!f.section_label && !f.heading && !lead) return null;
  return (
    <div className={`sec__head rv ${className}`.trim()}>
      {f.section_label && <span className="eyebrow">{f.section_label}</span>}
      {f.heading && (
        <h2 className="h2" id={`${s.id}-h`}>
          {f.heading}
        </h2>
      )}
      {lead}
    </div>
  );
}

/** Guide thumbnail for the hero when the guide has no image of its own, picked from its URL. */
const GUIDE_THUMBS: [RegExp, string][] = [
  [/cost|budget|pric/, "th-cost"],
  [/timeline|schedule|duration/, "th-timeline"],
  [/mvp/, "th-mvp"],
  [/saas/, "th-saas"],
  [/seo/, "th-seo"],
  [/ppc|paid|ads/, "th-ppc"],
  [/ecommerce|e-commerce|shop/, "th-ecommerce"],
  [/website/, "th-website"],
  [/redesign|rebuild/, "th-redesign"],
  [/checklist/, "th-checklist"],
  [/-vs-|compare|versus/, "th-compare"],
  [/agency/, "th-agency"],
];
const guideThumb = (path: string) => GUIDE_THUMBS.find(([re]) => re.test(path))?.[1] ?? "th-checklist";

const NAV_TEXT: Record<string, string> = { faq: "Frequently asked questions", "related-services": "Related services" };

export function SkeletonSections({ content, path, paths, preview = false, linkMap = {}, published, modified, studies }: Props) {
  const destination = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const sections = (content.pageSections ?? []).filter((s) => !s.omitted);
  const pillar = pillarFor(path);
  const service = pillar?.service ?? "Help defining the scope";
  const contact = destination("/contact") + "?service=" + encodeURIComponent(service);
  const trail = breadcrumbs(path, sections.find((s) => s.id === "hero")?.fields.h1 || content.title);
  const facts = (content.seo?.keyFacts ?? []).filter(Boolean).slice(0, 6);
  const family = familyOf(path);
  const guide = family === "guide";
  const sectors = pillar?.id === "industries";
  const familyCss = path === "/industries" ? "industries-hub" : FAMILY_CSS[family];
  const showcase = SHOWCASE_FAMILIES.has(family) && (SHOWCASE_PATHS === "all-services" || SHOWCASE_PATHS.has(path));

  // Alternating rhythm for the plain sections: white, then the cloud tint. Special sections set their own look.
  const tone = new Map<string, string>();
  let cloud = false;
  for (const s of sections) {
    if (s.id === "hero" || inArticle(s.id) || SPECIAL_CLASS[s.id]) continue;
    tone.set(s.id, cloud ? "sec sec--cloud" : "sec");
    cloud = !cloud;
  }
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
    const h1 = f.h1 || content.title;
    // The last word of the headline is the gradient word (gword), as on the prototype pages.
    const parts = h1.trim().split(/\s+/);
    const gword = parts.length > 2 ? parts.pop() : undefined;
    const headline = gword ? (
      <>
        {parts.join(" ")}{" "}
        <span className="gword">{gword}</span>
      </>
    ) : (
      h1
    );
    const ctaLabel = f.cta_primary_label || "Get a scoped estimate";
    const secondary = f.cta_secondary_label ? (
      <a className="btn btn--ghost" href={destination(f.cta_secondary_url || "/how-we-work")}>
        {f.cta_secondary_label}
      </a>
    ) : null;
    if (guide) {
      return (
        <section id={s.id} className="sec guide-hero" aria-label="Article introduction">
          <div className="wrap">
            <V2Crumbs trail={trail.map((c) => ({ label: c.label, href: destination(c.path) }))} />
            <div className="feature">
              <div>
                {pillarLabel && <p className="bcard__tag">{pillarLabel}</p>}
                <h1 id="hero-h1">{headline}</h1>
                {f.subheadline && <p className="lead guide-lead">{f.subheadline}</p>}
                <p className="guide-byline">
                  <span className="ph" aria-hidden="true">
                    {initials}
                  </span>
                  <span>
                    By{" "}
                    <a href={founderPage} rel="author">
                      {company.founder.name}
                    </a>
                  </span>
                </p>
                <p className="guide-meta">
                  {published && (
                    <span>
                      <time dateTime={new Date(published).toISOString()}>Published {shortDate(published)}</time>
                    </span>
                  )}
                  {modified && published && new Date(modified).getTime() - new Date(published).getTime() > DAY && (
                    <span>
                      <time dateTime={new Date(modified).toISOString()}>Updated {shortDate(modified)}</time>
                    </span>
                  )}
                  <span>{readMinutes} min read</span>
                </p>
                <div className="hero__acts hero__acts--left">
                  <Cta href={contact} service={service} label={ctaLabel} variant="grad" />
                  {secondary}
                </div>
              </div>
              <div className="feature__img guide-visual">
                <figure className="guide-visual__frame">
                  <V2Art asset={s.asset} fallback={guideThumb(path)} />
                </figure>
                <span className="guide-visual__chip guide-visual__chip--a">{readMinutes} min read</span>
                {chapters.length > 0 && <span className="guide-visual__chip guide-visual__chip--b">{chapters.length} chapters</span>}
              </div>
            </div>
          </div>
        </section>
      );
    }
    return (
      <section id={s.id} className="hero--center" aria-labelledby="hero-h1">
        <div className="wrap">
          <V2Crumbs trail={trail.map((c) => ({ label: c.label, href: destination(c.path) }))} />
          {pillarLabel && (
            <p className="eyebrow">
              <img src={v2img(SPOT_BY_PILLAR[pillar?.id ?? ""] ?? "ic-software")} alt="" width={48} height={48} />
              {pillarLabel}
            </p>
          )}
          <h1 id="hero-h1">{headline}</h1>
          {f.subheadline && <p className="lead">{f.subheadline}</p>}
          <div className="hero__acts">
            <Cta href={contact} service={service} label={ctaLabel} variant="grad" />
            {secondary}
          </div>
          <figure className={"heroart rv" + (s.asset ? "" : " heroart--fallback")}>
            <V2Art asset={s.asset} fallback={FAMILY_FALLBACK[family] ?? "hero-crew"} className="media" priority />
          </figure>
        </div>
      </section>
    );
  }

  function Overview({ s }: { s: PageSection }) {
    const f = s.fields;
    const body = f.body_paragraph ?? "";
    const first = body.match(/^\s*<p>([\s\S]*?)<\/p>/i);
    const rest = first ? body.slice(first[0].length) : "";
    const outcomes = Object.entries(f).filter(([k, v]) => v && /^outcome_\d+$/.test(k)).map(([, v]) => v);
    const ticks = [...outcomes, ...facts];
    return (
      <>
        <div className="wrap split">
          <div className="rv">
            {f.section_label && <span className="eyebrow">{f.section_label}</span>}
            {f.heading && (
              <h2 className="h2" id={`${s.id}-h`}>
                {f.heading}
              </h2>
            )}
            {first && (
              <>
                <p className="label" style={{ marginTop: 36 }}>
                  Quick answer
                </p>
                <p className="lead" dangerouslySetInnerHTML={{ __html: clean(first[1], paths) }} />
              </>
            )}
          </div>
          {ticks.length > 0 && (
            <aside className="frame rv" aria-label="At a glance">
              <p className="label">At a glance</p>
              <ul className="ticks">
                {ticks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className="hero__acts" style={{ marginTop: 28 }}>
                <Cta href={contact} service={service} label="Get a scoped estimate" />
              </div>
            </aside>
          )}
        </div>
        {(rest || s.asset) && (
          <div className="wrap">
            {rest && <Rich value={rest} paths={paths} />}
            {s.asset && <V2Art asset={s.asset} fallback="hero-crew" className="media rv" />}
          </div>
        )}
      </>
    );
  }

  /** Industry cards in a horizontal scroller (irow + icard), shared by the sector hub and industry applications. */
  function IndustryRow({ rows }: { rows: { name: string; body?: string; href?: string }[] }) {
    return (
      <>
        <div className="irow">
          {rows.map((r, i) => {
            const inner = (
              <>
                <img className="spot" src={v2img(industrySpot(r.name, i))} alt="" loading="eager" />
                <h3>{r.name}</h3>
                {r.body && <p>{r.body}</p>}
                {r.href && (
                  <span className="tlink">
                    Explore <V2Icon name="arrow" />
                  </span>
                )}
              </>
            );
            return r.href ? (
              <a key={r.name} className="icard" style={tint(i)} href={destination(r.href)}>
                {inner}
              </a>
            ) : (
              <div key={r.name} className="icard" style={tint(i)}>
                {inner}
              </div>
            );
          })}
        </div>
        <div className="wrap ind__nav">
          <button type="button" aria-label="Scroll left" data-scroll="-1">
            <V2Icon name="left" />
          </button>
          <button type="button" aria-label="Scroll right" data-scroll="1">
            <V2Icon name="arrow" />
          </button>
        </div>
      </>
    );
  }

  function Body({ s }: { s: PageSection }) {
    const f = s.fields;
    switch (s.id) {
      case "service-overview":
        return <Overview s={s} />;
      case "services-grid": {
        const rows = numbered(f, "svc", ["title", "body", "url", "icon_key"], 12);
        const label = `Open a ${pillar?.id === "hire" ? "role" : sectors ? "sector" : "service"} to see what it covers, when to choose it and where to read more.`;
        if (sectors) {
          return (
            <>
              <div className="wrap ind__h">
                <div>
                  {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                  {f.heading && (
                    <h2 id={`${s.id}-h`}>{f.heading}</h2>
                  )}
                  <p>{label}</p>
                </div>
              </div>
              <IndustryRow rows={rows.map((r) => ({ name: r.title, body: r.body, href: r.url ? destination(r.url) : undefined }))} />
            </>
          );
        }
        return (
          <div className="wrap">
            <Head s={s} lead={<p className="lead">{label}</p>} />
            <div className={"catgrid" + (rows.length % 4 === 0 ? " catgrid--4" : "")}>
              {rows.map((r, i) => {
                const inner = (
                  <>
                    <img className="spot" src={v2img(spotFor(r.icon_key, i))} alt="" loading="eager" />
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                    {r.url && (
                      <span className="more">
                        Learn more <V2Icon name="arrow" />
                      </span>
                    )}
                  </>
                );
                return r.url ? (
                  <a className="cat rv" key={r.title} href={destination(r.url)}>
                    {inner}
                  </a>
                ) : (
                  <div className="cat rv" key={r.title}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case "what-we-deliver": {
        const rows = numbered(f, "card", ["title", "body", "icon_key"], 6);
        return (
          <div className="wrap">
            <Head s={s} />
            <div className="accs rv" data-accs>
              <div className="accs__list">
                {rows.map((r) => (
                  <div className="accs__item" key={r.title}>
                    <button className="accs__btn" type="button">
                      {r.title}
                      <V2Icon name="chev" />
                    </button>
                    <div className="accs__bar">
                      <i />
                    </div>
                    <div className="accs__body">
                      <div>{r.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="accs__vis" aria-hidden="true">
                {rows.map((r, i) => (
                  <div key={r.title} data-vis={i}>
                    <V2Img name={spotFor(r.icon_key, i)} className="accs__spot" priority />
                    <span className="accs__cap">{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case "why-netofficials": {
        const adv = Object.entries(f).filter(([k, v]) => v && /^adv_\d+$/.test(k)).map(([, v]) => v);
        const grid = adv.length === 4 ? " feat__g--4" : adv.length === 2 ? " feat__g--2" : "";
        return (
          <div className="wrap">
            <Head s={s} lead={<Rich value={f.body_paragraph ?? ""} paths={paths} className="lead" />} />
            <div className={"feat__g" + grid}>
              {adv.map((a, i) => (
                <div className="rv" key={a}>
                  <V2Img name={spotFor(undefined, i)} className="spot" priority />
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "process": {
        const steps = numbered(f, "step", ["title", "body"], 6);
        const tones = ["--p-lime", "--p-sky", "--p-lavender", "--p-peach", "--p-peri"];
        return (
          <div className="wrap">
            {f.section_label && <p className="label rv">{f.section_label}</p>}
            {f.heading && (
              <h2 className="big rv" id={`${s.id}-h`}>
                {f.heading}
              </h2>
            )}
            <div className="wf" data-wf style={{ marginTop: 56 }}>
              {steps.map((st, i) => (
                <Fragment key={st.title}>
                  <div className="wf__step" style={{ transitionDelay: `${(i * 0.2 + 0.1).toFixed(1)}s` }}>
                    <div>
                      <span className="n" style={{ background: `var(${tones[i % tones.length]})` }}>
                        {i + 1}
                      </span>
                      <span>
                        <h3>{st.title}</h3>
                        {st.body && <p>{st.body}</p>}
                      </span>
                    </div>
                  </div>
                  {i < steps.length - 1 && <span className="wf__ln" style={{ transitionDelay: `${(i * 0.2 + 0.2).toFixed(1)}s` }} />}
                </Fragment>
              ))}
            </div>
          </div>
        );
      }
      case "technology-stack": {
        const groups = numbered(f, "group", ["name", "items"], 6).map((g) => ({
          name: g.name,
          items: g.items.split(/[,|;]/).map((x) => x.trim()).filter(Boolean),
        }));
        const all = [...new Map(groups.flatMap((g) => g.items.map((item) => [item, g.name] as const))).entries()];
        return (
          <>
            <div className="wrap">
              <Head s={s} />
            </div>
            {all.length > 0 && (
              <div className="trust rv">
                <p>Technologies we use</p>
                <div className="marquee">
                  <ul className="marquee__track" data-marquee>
                    {all.map(([item, context]) => (
                      <li key={item}>
                        <TechMark name={item} size={30} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="wrap">
              <div className={"catgrid" + (groups.length === 4 ? " catgrid--4" : "")}>
                {groups.map((g) => (
                  <div className="cat rv" key={g.name}>
                    <h3>{g.name}</h3>
                    <div className="chips">
                      {g.items.map((x) => (
                        <span key={x}>
                          <TechMark name={x} size={20} />
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      }
      case "who-its-for": {
        const rows = numbered(f, "persona", ["title", "problem", "outcome"], 4);
        return (
          <div className="wrap">
            <Head s={s} />
            <div className={"catgrid" + (rows.length === 4 ? " catgrid--2" : "")}>
              {rows.map((r, i) => (
                <div className="cat rv" key={r.title}>
                  <V2Img name={SPOT_SET[(i + 2) % SPOT_SET.length]} className="spot" priority />
                  <h3>{r.title}</h3>
                  <p className="label">The problem</p>
                  <p>{r.problem}</p>
                  <p className="label">The outcome</p>
                  <p>{r.outcome}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "industry-applications": {
        const rows = numbered(f, "industry", ["name", "url", "usecase"], 6);
        return (
          <>
            <div className="wrap ind__h">
              <div>
                {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                {f.heading && <h2 id={`${s.id}-h`}>{f.heading}</h2>}
                <p>
                  <a className="tlink" href={contact}>
                    Your industry not listed? Tell us about it
                  </a>
                </p>
              </div>
            </div>
            <IndustryRow
              rows={rows.map((r) => {
                const link = r.url || industryPage(r.name, paths);
                return { name: r.name, body: r.usecase, href: link ? destination(link) : undefined };
              })}
            />
          </>
        );
      }
      case "compliance-data": {
        const rows = numbered(f, "item", ["title", "body"], 6);
        return (
          <div className="wrap">
            <Head s={s} />
            <div className="catgrid catgrid--2">
              {rows.map((r) => (
                <div className="cat rv" key={r.title}>
                  <V2Img name="ic-security" className="spot" priority />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "engagement-models": {
        const rows = numbered(f, "model", ["name", "body", "best_for"], 4);
        return (
          <div className="wrap">
            {f.section_label && <p className="label rv">{f.section_label}</p>}
            {f.heading && (
              <h2 className="big rv" id={`${s.id}-h`} style={{ marginBottom: 56 }}>
                {f.heading}
              </h2>
            )}
            <div>
              {rows.map((r, i) => (
                <article className="mcard" key={r.name}>
                  <div className="mcard__c">
                    <h3>{r.name}</h3>
                    <p>{r.body}</p>
                    {r.best_for && <small>Best for {r.best_for}</small>}
                    <Cta href={contact} service={service} label="Get a scoped estimate" />
                  </div>
                  <div className="mcard__m" aria-hidden="true">
                    <V2Img name={CHARACTERS[i % CHARACTERS.length]} className="mcard__img" priority />
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "cost-factors": {
        const rows = numbered(f, "factor", ["title", "body"], 6);
        return (
          <div className="wrap">
            <div className="sec__head rv">
              {f.section_label && <span className="eyebrow">{f.section_label}</span>}
              {f.heading && (
                <h2 className="h2" id={`${s.id}-h`}>
                  {f.heading}
                </h2>
              )}
              <Rich value={f.subheadline ?? ""} paths={paths} className="lead" />
            </div>
            <div className="feat__g">
              {rows.map((r, i) => (
                <div className="rv" key={r.title}>
                  <V2Img name={SPOT_SET[(i + 1) % SPOT_SET.length]} className="spot" priority />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
            <div className="hero__acts" style={{ marginTop: 56 }}>
              <Cta href={contact} service={service} label="Get a scoped estimate" />
            </div>
          </div>
        );
      }
      case "faq":
        return <FaqBlock s={s} />;
      case "related-services":
      case "related-hubs":
        return <RelatedBlock s={s} />;
      case "cta-banner":
        return (
          <div className="wrap">
            <div className="cta-band__in rv">
              <div>
                {f.heading && <h2 id={`${s.id}-h`}>{f.heading}</h2>}
                {f.subheadline && <p>{f.subheadline}</p>}
              </div>
              <div className="cta-band__acts">
                <Cta href={contact} service={service} label={f.cta_primary_label || "Get a scoped estimate"} variant="white" />
                {f.cta_secondary_label && (
                  <a className="btn btn--ghost-w" href={destination(f.cta_secondary_url || "/how-we-work")}>
                    {f.cta_secondary_label}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function FaqBlock({ s }: { s: PageSection }) {
    const f = s.fields;
    const pairs = Object.keys(f).filter((k) => /^q\d+$/.test(k) && f[k] && f[k.replace("q", "a")]);
    const items = pairs.map((k) => ({ q: f[k], a: <Rich value={f[k.replace("q", "a")]} paths={paths} /> }));
    if (items.length === 0) return null;
    const item = (it: (typeof items)[number], i: number) => (
      <details key={pairs[i]} open={(!showcase && i === 0) || undefined}>
        <summary>
          {it.q}
          <i aria-hidden="true">
            <V2Icon name="plus" />
          </i>
        </summary>
        {it.a}
      </details>
    );
    // Showcase pages with a full set of questions: centred heading, then two accordion columns (reads as a grid, not a sparse list).
    if ((showcase || guide) && items.length >= 6) {
      const half = Math.ceil(items.length / 2);
      return (
        <div className="wrap sc-faq">
          <div className="sc-faq__head rv">
            {f.section_label && <span className="eyebrow">{f.section_label}</span>}
            {f.heading && (
              <h2 className="h2" id={`${s.id}-h`}>
                {f.heading}
              </h2>
            )}
          </div>
          <div className="sc-faq__cols rv">
            <div className="acc">{items.slice(0, half).map((it, i) => item(it, i))}</div>
            <div className="acc">{items.slice(half).map((it, i) => item(it, half + i))}</div>
          </div>
          <p className="sc-faq__ask rv">
            Not listed here?{" "}
            <a className="btn btn--ghost" href={contact}>
              Ask us directly <V2Icon name="arrow" />
            </a>
          </p>
        </div>
      );
    }
    return (
      <div className="wrap faq">
        <div className="faq__aside rv">
          {f.section_label && <span className="eyebrow">{f.section_label}</span>}
          {f.heading && (
            <h2 className="h2" id={`${s.id}-h`}>
              {f.heading}
            </h2>
          )}
          <a className="btn btn--ghost" href={contact}>
            Ask us directly <V2Icon name="arrow" />
          </a>
        </div>
        <div className="acc rv">{items.map((it, i) => item(it, i))}</div>
      </div>
    );
  }

  function RelatedBlock({ s }: { s: PageSection }) {
    const f = s.fields;
    const hubRows = s.id === "related-hubs";
    const rows = hubRows ? numbered(f, "hub", ["name", "body", "url"], 4) : numbered(f, "service", ["name", "reason", "url"], 4);
    if (showcase) {
      return (
        <div className="wrap sc-rel">
          <div className="sc-rel__aside rv">
            {f.section_label && <span className="eyebrow">{f.section_label}</span>}
            {f.heading && (
              <h2 className="h2" id={`${s.id}-h`}>
                {f.heading}
              </h2>
            )}
            <p>Work that usually sits alongside this service, and can be scoped together.</p>
            <a className="btn btn--ghost" href={destination("/services")}>
              All services <V2Icon name="arrow" />
            </a>
          </div>
          <div className="sc-rel__list">
            {rows.map((r, i) => {
              const target = r.url || "/services";
              const kind = sitePage(target)?.type;
              return (
                <a className={`sc-rel__row sc-rel__row--${relTint(i)} rv`} key={r.name} href={destination(target)} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <img src={v2img(spotForPage(target, r.name, i))} alt="" loading="lazy" />
                  <span className="sc-rel__txt">
                    {kind && <small>{PAGE_KIND[kind] ?? "Page"}</small>}
                    <h3>{r.name}</h3>
                    <p>{hubRows ? r.body : r.reason}</p>
                  </span>
                  <span className="sc-rel__go" aria-hidden="true">
                    <V2Icon name="arrow" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className="wrap">
        <Head s={s} />
        <div className="relgrid">
          {rows.map((r, i) => {
            const target = r.url || "/services";
            const kind = sitePage(target)?.type;
            return (
              <a className={`rel rel--${relTint(i)} rv`} key={r.name} href={destination(target)}>
                <span className="rel__top">
                  <img className="rel__ico" src={v2img(spotForPage(target, r.name, i))} alt="" loading="lazy" />
                  {kind && <span className="rel__tag">{PAGE_KIND[kind] ?? "Page"}</span>}
                </span>
                <h3>{r.name}</h3>
                <p>{hubRows ? r.body : r.reason}</p>
                <span className="rel__go" aria-hidden="true">
                  <V2Icon name="arrow" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  /** Guide article: contents, key takeaways and the numbered chapters with one inline CTA (guide.html). */
  function Article() {
    const takeaway = sections.find((s) => s.id === "key-takeaways");
    const ctaAfter = chapters.length > 1 ? chapters[1].id : chapters[chapters.length - 1]?.id;
    const toc = [
      ...(takeaway ? [{ id: takeaway.id, text: takeaway.fields.heading || "Key takeaways" }] : []),
      ...chapters.map((s) => ({ id: s.id, text: s.fields.section_label || s.fields.heading })),
      ...sections.filter((s) => s.id === "faq" || s.id === "related-services").map((s) => ({ id: s.id, text: s.fields.heading || NAV_TEXT[s.id] })),
    ].filter((t) => t.text);
    return (
      <section id="guide" className="sec" aria-label="Article">
        <ReadingProgress targetId="guide" />
        <div className="wrap article">
          {toc.length > 0 && (
            <nav className="toc" data-toc aria-label="On this page">
              <b>On this page</b>
              {toc.map((t) => (
                <a key={t.id} href={`#${t.id}`}>
                  {t.text}
                </a>
              ))}
            </nav>
          )}
          <div className="prose">
            {takeaway && (
              <div className="keybox" id={takeaway.id}>
                <b>{takeaway.fields.heading || "Key takeaways"}</b>
                <Rich value={takeaway.fields.body_paragraph ?? ""} paths={paths} />
              </div>
            )}
            {chapters.map((s) => (
              <Fragment key={s.id}>
                <section id={s.id} className="guide-chapter" aria-labelledby={`${s.id}-h`}>
                  {s.fields.section_label && <span className="eyebrow">{s.fields.section_label}</span>}
                  <h2 id={`${s.id}-h`}>{s.fields.heading}</h2>
                  {s.asset && (
                    <figure className="guide-figure">
                      <V2Art asset={s.asset} fallback="th-checklist" className="media" />
                    </figure>
                  )}
                  <Rich value={s.fields.body_paragraph ?? ""} paths={paths} />
                </section>
                {s.id === ctaAfter && (
                  <aside className="keybox guide-cta" aria-labelledby="guide-cta-title">
                    <div>
                      <h3 id="guide-cta-title">Planning a project?</h3>
                      <p>Share a short brief and get questions, an initial scope and the team it needs.</p>
                    </div>
                    <Cta href={contact} service={service} label="Get a scoped estimate" />
                  </aside>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function Author() {
    return (
      <section className="sec" aria-label="About the author">
        <div className="wrap">
          <div className="author guide-author rv" aria-labelledby="author-title">
            <span className="ph" aria-hidden="true">
              {initials}
            </span>
            <div>
              <h2 id="author-title" className="guide-author__name">
                {company.founder.name}
              </h2>
              <p className="guide-author__role">{company.founder.jobTitle}, Netofficials</p>
              {company.founder.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <a className="btn btn--ghost" href={founderPage}>
                Read the full profile
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // ---- Showcase layout (SHOWCASE_PATHS): same fields, homepage-style motion ----
  const deliverRows = numbered(sections.find((x) => x.id === "what-we-deliver")?.fields ?? {}, "card", ["title", "body", "icon_key"], 6);
  const stepRows = numbered(sections.find((x) => x.id === "process")?.fields ?? {}, "step", ["title", "body"], 8);
  const stackItems = numbered(sections.find((x) => x.id === "technology-stack")?.fields ?? {}, "group", ["name", "items"], 6).flatMap((g) => g.items.split(/[,|;]/).map((x) => x.trim()).filter(Boolean));
  const heroAsset = sections.find((x) => x.id === "hero")?.asset;

  const scene = sceneFor(path, family);
  // Hubs have no deliverables: the child services become the hub map and the overview outcomes the floating cards.
  const hubTitles = numbered(sections.find((x) => x.id === "services-grid")?.fields ?? {}, "svc", ["title", "body", "url", "icon_key"], 6).map((r) => r.title).filter(Boolean);
  const heroOutcomes = Object.entries(sections.find((x) => x.id === "service-overview")?.fields ?? {}).filter(([k, v]) => v && /^outcome_\d+$/.test(k)).map(([, v]) => v);
  const heroItems = family === "hub" ? heroOutcomes : deliverRows.map((r) => r.title);

  function ShowHero({ s }: { s: PageSection }) {
    const f = s.fields;
    const label = f.tag_pill || pillar?.label;
    const h1 = f.h1 || content.title;
    const parts = h1.trim().split(/\s+/);
    const g = parts.length > 2 ? parts.pop() : undefined;
    return (
      <section id={s.id} className="hero sc-hero" aria-labelledby="hero-h1">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <V2Crumbs trail={trail.map((c) => ({ label: c.label, href: destination(c.path) }))} />
            {label && (
              <p className="eyebrow">
                <img src={v2img(SPOT_BY_PILLAR[pillar?.id ?? ""] ?? "ic-software")} alt="" width={48} height={48} />
                {label}
              </p>
            )}
            <h1 id="hero-h1">
              {g ? (
                <>
                  {parts.join(" ")} <span className="gword">{g}</span>
                </>
              ) : (
                h1
              )}
            </h1>
            {f.subheadline && <p className="hero__sub">{f.subheadline}</p>}
            <div className="hero__cta sc-hero__cta">
              <Cta href={contact} service={service} label={f.cta_primary_label || "Get a scoped estimate"} variant="grad" />
              {f.cta_secondary_label && (
                <a className="btn btn--ghost" href={destination(f.cta_secondary_url || "/how-we-work")}>
                  {f.cta_secondary_label}
                </a>
              )}
            </div>
          </div>
          {scene === "board" ? (
            <ServiceBoard title={label || h1} rows={deliverRows.map((r) => r.title)} steps={stepRows.map((r) => r.title)} />
          ) : (
            <HeroScene kind={scene} title={family === "hire" ? hireRole(path, label || h1) : label || h1} items={heroItems} stack={family === "hub" ? hubTitles : stackItems} char={family === "hire" ? hireChar(path) : undefined} />
          )}
        </div>
      </section>
    );
  }

  function ShowBody({ s }: { s: PageSection }) {
    const f = s.fields;
    switch (s.id) {
      case "service-overview": {
        const outcomes = Object.entries(f).filter(([k, v]) => v && /^outcome_\d+$/.test(k)).map(([, v]) => v);
        const art = s.asset ?? heroAsset;
        // Paragraph 1 is the direct answer and stays beside the visual. Paragraphs 2 to 4 become labelled detail cards
        // below it (new `detail_N` fields win; older drafts are split from body_paragraph). Anything past four goes
        // into a native expander, so one over-long generation can never stretch the section.
        const paras = f.answer ? [f.answer, ...[1, 2, 3].map((n) => f[`detail_${n}`]).filter(Boolean)] : splitParagraphs(f.body_paragraph ?? "");
        const [answer, ...more] = paras;
        const labels = family === "hub" ? HUB_DETAIL_LABELS : DETAIL_LABELS;
        const cards = more.slice(0, 3);
        const rest = more.slice(3);
        const card = (list: string[], cls: string, speed: string, delay: number) =>
          list.length > 0 ? (
            <div className={`fc sc-fc ${cls}`} data-speed={speed}>
              <div className="fc__in">
                {list.map((o, i) => (
                  <span key={o} className="fc__row" style={{ animationDelay: `${delay + i * 0.5}s` }}>
                    <i className="on">
                      <V2Icon name="check" />
                    </i>
                    {o}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        return (
          <section id={s.id} className="sec sc-overview" data-parallax aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap split split--wide sc-ov">
              <div className="rv">
                {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                {f.heading && (
                  <h2 className="h2" id={`${s.id}-h`}>
                    {f.heading}
                  </h2>
                )}
                <Rich value={answer ?? ""} paths={paths} className="sc-ov__body sc-ov__answer" />
              </div>
              <div className="sc-ov__art rv">
                <V2Art asset={art} fallback="hero-crew" className="media" />
                {card(outcomes.slice(0, 2), "sc-fc--a", "-0.12", 0.4)}
                {card(outcomes.slice(2, 4), "sc-fc--b", "0.14", 1.4)}
              </div>
            </div>
            {(cards.length > 0 || facts.length > 0) && (
              <div className="wrap">
                {facts.length > 0 && (
                  <ul className="sc-ov__facts">
                    {facts.map((x, i) => (
                      <li key={x} className="rv" style={{ transitionDelay: `${i * 0.06}s` }}>
                        <i>
                          <V2Icon name="check" />
                        </i>
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="sc-ov__more">
                  {cards.map((p, i) => (
                    <article className="sc-ov__card rv" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                      <span className="sc-ov__n" style={tint(i)}>
                        <V2Icon name={DETAIL_ICONS[i] ?? "check"} />
                      </span>
                      <h3>{f[`detail_${i + 1}_label`] || labels[i]}</h3>
                      <Rich value={p} paths={paths} />
                    </article>
                  ))}
                </div>
                {rest.length > 0 && (
                  <details className="sc-ov__rest">
                    <summary>Read more</summary>
                    {rest.map((p, i) => (
                      <Rich key={i} value={p} paths={paths} />
                    ))}
                  </details>
                )}
              </div>
            )}
          </section>
        );
      }
      case "what-we-deliver":
        return (
          <section id={s.id} className="sec sec--cloud" aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              <Head s={s} />
              <div className="accs sc-accs rv" data-accs>
                <div className="accs__list">
                  {deliverRows.map((r) => (
                    <div className="accs__item" key={r.title}>
                      <button className="accs__btn" type="button">
                        {r.title}
                        <V2Icon name="chev" />
                      </button>
                      <div className="accs__bar">
                        <i />
                      </div>
                      <div className="accs__body">
                        <div>{r.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="accs__vis sc-vis" aria-hidden="true">
                  {deliverRows.map((r, i) => (
                    <div key={r.title} data-vis={i}>
                      <DeliverMock kind={mockKind(r.icon_key, i)} title={r.title} stack={stackItems} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      case "process":
        return (
          <section id={s.id} className="flow sc-flow" aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              {f.section_label && <p className="label rv">{f.section_label}</p>}
              {f.heading && (
                <h2 className="big rv" id={`${s.id}-h`}>
                  {f.heading}
                </h2>
              )}
              <p className="sc-team rv" aria-hidden="true">
                <span className="inav">
                  {["fullstack", "ai", "devops", "mobile", "lead"].map((c) => (
                    <img key={c} src={v2img(`char-${c}`)} alt="" />
                  ))}
                </span>
              </p>
              <ol className="wf sc-wf" data-wf>
                {stepRows.map((r, i) => (
                  <li key={r.title} className="sc-step">
                    {i > 0 && <span className="wf__ln" style={{ transitionDelay: `${i * 0.15}s` }} />}
                    <div className="wf__step" style={{ transitionDelay: `${0.1 + i * 0.15}s` }}>
                      <div>
                        <span className="n" style={tint(i)}>
                          {i + 1}
                        </span>
                        <span>
                          <h3>{r.title}</h3>
                          {r.body && <p>{r.body}</p>}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      case "technology-stack": {
        const groups = numbered(f, "group", ["name", "items"], 6).map((g) => ({ name: g.name, items: g.items.split(/[,|;]/).map((x) => x.trim()).filter(Boolean) }));
        return (
          <section id={s.id} className="sec sc-tech" aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              <Head s={s} />
            </div>
            <div className="wrap">
              <div className={"catgrid" + (groups.length === 4 ? " catgrid--4" : "")}>
                {groups.map((g, i) => (
                  <div className={`cat rv sc-group sc-group--${relTint(i)}`} key={g.name} style={{ transitionDelay: `${i * 0.08}s` }}>
                    <h3>{g.name}</h3>
                    <div className="chips">
                      {g.items.map((x, j) => (
                        <span key={x} style={{ animationDelay: `${i * 0.12 + j * 0.06}s` }}>
                          <TechMark name={x} size={22} />
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "who-its-for": {
        const rows = numbered(f, "persona", ["title", "problem", "outcome"], 4);
        const chars = ["lead", "fullstack", "data", "aws"];
        return (
          <section id={s.id} className="models sc-who" aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              <Head s={s} className="center" />
              <div>
                {rows.map((r, i) => (
                  <article className="mcard sc-mcard" key={r.title}>
                    <div className="mcard__c">
                      <h3>{r.title}</h3>
                      {r.problem && (
                        <>
                          <p className="label sc-label">The problem</p>
                          <p>{r.problem}</p>
                        </>
                      )}
                      {r.outcome && (
                        <>
                          <p className="label sc-label">The outcome</p>
                          <p>{r.outcome}</p>
                        </>
                      )}
                      <Cta href={contact} service={service} label="Discuss your project" variant="violet" />
                    </div>
                    <div className="mcard__m sc-who__m" style={tint(i)} aria-hidden="true">
                      <img className="sc-who__char" src={v2img(`char-${chars[i % chars.length]}`)} alt="" loading="lazy" />
                      <span className="sc-bubble sc-bubble--a">
                        <V2Icon name="flag" />
                      </span>
                      <span className="sc-bubble sc-bubble--b">
                        <V2Icon name="check" />
                      </span>
                      <span className="sc-bubble sc-bubble--c">
                        <V2Icon name="spark" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "cost-factors": {
        const rows = numbered(f, "factor", ["title", "body"], 8);
        const icons = ["ic-team", "ic-software", "ic-cost", "ic-support", "ic-security"];
        const split = Math.ceil(rows.length / 2);
        const factor = (r: (typeof rows)[number], i: number) => (
          <div key={r.title} className="fc sc-factor rv" style={{ transitionDelay: `${i * 0.1}s`, animationDelay: `${-i * 1.3}s` }}>
            <b>
              <img src={v2img(icons[i % icons.length])} alt="" />
              {r.title}
            </b>
            {r.body && (
              <div className="fc__in">
                <p>{r.body}</p>
              </div>
            )}
          </div>
        );
        return (
          <section id={s.id} className="ctx sc-cost" aria-labelledby={f.heading ? `${s.id}-h` : undefined}>
            <div className="wrap">
              <div className="ctx__top">
                <div className="rv">
                  {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                  {f.heading && (
                    <h2 className="big sc-cost__h" id={`${s.id}-h`}>
                      {f.heading}
                    </h2>
                  )}
                </div>
                <div className="rv">
                  {f.subheadline && <p>{f.subheadline}</p>}
                  <Cta href={contact} service={service} label="Get a scoped estimate" variant="violet" />
                </div>
              </div>
              <div className="sc-cost__stage">
                <div className="sc-cost__col">{rows.slice(0, split).map((r, i) => factor(r, i))}</div>
                <div className="sc-cost__hero" aria-hidden="true">
                  <img src={v2img("hero-crew")} alt="" loading="lazy" />
                </div>
                <div className="sc-cost__col">{rows.slice(split).map((r, i) => factor(r, split + i))}</div>
              </div>
            </div>
          </section>
        );
      }
      default:
        return null;
    }
  }

  /** Big word marquee of the deliverables with role tiles between them (the homepage words band). */
  const showWords =
    deliverRows.length > 0 ? (
      <section key="sc-words" className="words sc-words" aria-hidden="true">
        <div className="words__track" data-marquee>
          {deliverRows.map((r, i) => (
            <Fragment key={r.title}>
              <span>{r.title}</span>
              <span className="tiles">
                <img src={v2img(`char-${["fullstack", "ai", "devops", "mobile", "design", "lead"][i % 6]}`)} alt="" />
              </span>
            </Fragment>
          ))}
        </div>
      </section>
    ) : null;

  const out: ReactNode[] = [];
  let articleDone = false;
  let authorDone = false;
  if (familyCss) out.push(<link key="family-css" rel="stylesheet" href={`/assets/v2/pages/${familyCss}.css?v=${V2_VERSION}`} />);
  if (guide) out.push(<link key="kit-css" rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />);
  if (showcase) {
    out.push(<link key="home-css" rel="stylesheet" href={`/assets/v2/home.css?v=${V2_VERSION}`} />);
    out.push(<link key="showcase-css" rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />);
  }
  for (const s of sections) {
    if (s.id === "hero") {
      out.push(showcase ? <ShowHero key={s.id} s={s} /> : <Hero key={s.id} s={s} />);
      continue;
    }
    if (showcase && SHOWCASE_IDS.has(s.id)) {
      out.push(<ShowBody key={s.id} s={s} />);
      continue;
    }
    if (showcase && s.id === "faq" && showWords) out.push(showWords);
    if (guide && inArticle(s.id)) {
      if (!articleDone) {
        articleDone = true;
        out.push(<Article key="article" />);
      }
      continue;
    }
    if (guide && s.id === "cta-banner" && !authorDone) {
      authorDone = true;
      out.push(<Author key="author" />);
    }
    if (s.id === "cta-banner" && studies) out.push(<Fragment key="studies">{studies}</Fragment>);
    const industryBlock = s.id === "industry-applications" || (s.id === "services-grid" && sectors);
    const cls = s.id === "cta-banner" ? "cta-band" : industryBlock ? "ind" : (SPECIAL_CLASS[s.id] ?? tone.get(s.id) ?? "sec");
    out.push(
      <section key={s.id} id={s.id} className={cls} {...(industryBlock ? { "data-scroller": "" } : {})} aria-labelledby={s.fields.heading ? `${s.id}-h` : undefined}>
        <Body s={s} />
      </section>,
    );
  }
  if (guide && !authorDone) out.push(<Author key="author" />);
  return <>{out}</>;
}

/** Section classes that replace the alternating rhythm: process (flow), feature and cost blocks, engagement models. */
const SPECIAL_CLASS: Record<string, string> = {
  process: "flow",
  "why-netofficials": "feat",
  "cost-factors": "feat",
  "engagement-models": "models",
  "industry-applications": "ind",
};
