import { SiteIcon, legacyIcon, iconFor } from "./icon-set";
import { company, founderPage } from "./company";
import { TechIcon } from "./brand-icon";
import { sanitizeRichHTML } from "./rich-text";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillarFor, sitePages } from "./site-structure";
import { mediaPath } from "./media-path";
import { familyOf } from "./prompts/templates";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Frontend for the canonical page skeleton (see familySections in prompts/templates.ts).
// Every commercial family (hub, service, technology, hire, industry, location) renders through
// these components, so the pages look and read alike. Styles live in /assets/skeleton.css.

/** True for pages generated from the skeleton; older drafts keep the legacy renderer until regenerated. */
export function isSkeletonContent(content: Content, path: string) {
  const family = familyOf(path);
  if (family === "guide") return !!content.pageSections?.some((s) => s.id === "key-takeaways" && !s.omitted);
  return family !== "other" && !!content.pageSections?.some((s) => s.id === "cost-factors" && !s.omitted);
}

const isChapter = (id: string) => /^editorial-\d+$/.test(id);

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

const DARK = new Set(["process", "engagement-models", "cta-banner"]);
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

/** "Healthcare Mobile App Development" links to the healthcare industry page when it is live. */
function industryPage(name: string, paths: string[]) {
  const lower = name.toLowerCase();
  return sitePages.find((p) => p.type === "industry" && paths.includes(p.path) && lower.includes(p.label.toLowerCase().split(/[ &/]/)[0]))?.path;
}

function Rich({ value, paths, className }: { value: string; paths: string[]; className?: string }) {
  if (!value) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"sk-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

function Head({ f, light }: { f: Record<string, string>; light?: boolean }) {
  return (
    <header className={"sk-head" + (light ? " is-light" : "")}>
      {f.section_label && <p className="sk-eyebrow">{f.section_label}</p>}
      {f.heading && <h2 className="sk-h2">{f.heading}</h2>}
    </header>
  );
}

export function SkeletonSections({ content, path, paths, preview = false, linkMap = {}, published, modified }: Props) {
  const destination = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const sections = (content.pageSections ?? []).filter((s) => !s.omitted);
  const pillar = pillarFor(path);
  const service = pillar?.service ?? "Help defining the scope";
  const contact = destination("/contact") + "?service=" + encodeURIComponent(service);
  const trail = breadcrumbs(path, sections.find((s) => s.id === "hero")?.fields.h1 || content.title);
  const facts = (content.seo?.keyFacts ?? []).filter(Boolean).slice(0, 6);
  const Icon = ({ name, text }: { name?: string; text?: string }) => (
    <span className="sk-icon" aria-hidden="true">
      <SiteIcon name={legacyIcon[name ?? ""] ?? (name || iconFor(text ?? ""))} className="sk-icon-svg" />
    </span>
  );

  // Background rhythm: hero white, then tint/white alternating, dark bands where the skeleton asks for them.
  const tone = new Map<string, string>();
  let flip = true;
  for (const s of sections) {
    if (s.id === "hero") tone.set(s.id, "white");
    else if (s.id === "key-takeaways" || isChapter(s.id)) tone.set(s.id, "white"); // one article block, not alternating bands
    else if (DARK.has(s.id)) tone.set(s.id, "dark");
    else {
      tone.set(s.id, flip ? "tint" : "white");
      flip = !flip;
    }
  }
  const guide = familyOf(path) === "guide";
  // Guides get a table of contents beside the article instead of the top sub-nav.
  const nav = guide ? [] : sections.filter((s) => NAV_LABELS[s.id]).slice(0, 7);
  const takeaways = sections.find((s) => s.id === "key-takeaways");
  const chapters = sections.filter((s) => isChapter(s.id));
  const readMinutes = Math.max(1, Math.round([takeaways, ...chapters].reduce((n, s) => n + (s ? Object.values(s.fields).reduce((m, v) => m + words(v), 0) : 0), 0) / 230));

  function Article() {
    const toc = chapters.map((s, i) => ({ id: s.id, n: String(i + 1).padStart(2, "0"), text: s.fields.section_label || s.fields.heading }));
    return (
      <div className="sk-wrap sk-article-grid">
        <article className="sk-article-main">
          <details className="sk-toc-m">
            <summary>On this page</summary>
            <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
          </details>
          {takeaways && (
            <div className="sk-takeaways">
              <span className="sk-answer-label">{takeaways.fields.heading || "Key takeaways"}</span>
              <Rich value={takeaways.fields.body_paragraph ?? ""} paths={paths} className="sk-takeaways-list" />
            </div>
          )}
          {chapters.map((s, i) => (
            <section key={s.id} id={s.id} className="sk-chapter">
              <p className="sk-chapter-n"><span>{String(i + 1).padStart(2, "0")}</span>{s.fields.section_label}</p>
              <h2 className="sk-chapter-h">{s.fields.heading}</h2>
              {s.asset && (
                <figure className="sk-figure sk-chapter-fig">
                  <img src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} loading="lazy" />
                </figure>
              )}
              <Rich value={s.fields.body_paragraph ?? ""} paths={paths} className="sk-article-prose" />
            </section>
          ))}
        </article>
        <aside className="sk-rail">
          <nav className="sk-toc" aria-label="On this page">
            <h2>On this page</h2>
            <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}><span>{t.n}</span>{t.text}</a></li>)}</ol>
          </nav>
          <div className="sk-rail-cta">
            <h3>Planning a project?</h3>
            <p>Share a short brief and get questions, an initial scope and the team it needs.</p>
            <TrackedLink href={contact} event="consultation_click" service={service} className="sk-btn is-lime">
              Get a scoped estimate <span aria-hidden="true">↗</span>
            </TrackedLink>
          </div>
        </aside>
      </div>
    );
  }

  function Body({ s }: { s: PageSection }) {
    const f = s.fields;
    switch (s.id) {
      case "hero": {
        const long = words(f.h1 || "") > 9;
        return (
          <div className="sk-wrap">
            <nav className="sk-crumbs" aria-label="Breadcrumb">
              <ol>
                {trail.map((c, i) =>
                  i === trail.length - 1 ? (
                    <li key={c.path} aria-current="page">{c.label}</li>
                  ) : (
                    <li key={c.path}><a href={destination(c.path)}>{c.label}</a></li>
                  ),
                )}
              </ol>
            </nav>
            <div className={"sk-hero-grid" + (s.asset ? " has-art" : "")}>
              <div>
                {(f.tag_pill || pillar?.label) && <span className="sk-tag">{f.tag_pill || pillar?.label}</span>}
                <h1 className={"sk-h1" + (long ? " is-long" : "")}>{f.h1 || content.title}</h1>
                <p className="sk-lead">{f.subheadline}</p>
                {guide && (
                  <p className="sk-meta">
                    <span>Guide</span>
                    <span>{readMinutes} min read</span>
                    <span>
                      By{" "}
                      <a href={founderPage} rel="author" className="sk-author">
                        {company.founder.name}
                      </a>
                    </span>
                    {published && <span><time dateTime={new Date(published).toISOString()}>Published {shortDate(published)}</time></span>}
                    {modified && published && new Date(modified).getTime() - new Date(published).getTime() > DAY && (
                      <span><time dateTime={new Date(modified).toISOString()}>Updated {shortDate(modified)}</time></span>
                    )}
                  </p>
                )}
                <div className="sk-actions">
                  <TrackedLink href={contact} event="consultation_click" service={service} className="sk-btn">
                    {f.cta_primary_label || "Get a scoped estimate"} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  {f.cta_secondary_label && (
                    <a className="sk-link" href={destination(f.cta_secondary_url || "/how-we-work")}>{f.cta_secondary_label} →</a>
                  )}
                </div>
              </div>
              {s.asset && (
                <figure className="sk-art">
                  <img src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} fetchPriority="high" />
                </figure>
              )}
            </div>
          </div>
        );
      }
      case "service-overview": {
        const body = f.body_paragraph ?? "";
        const first = body.match(/^\s*<p>([\s\S]*?)<\/p>/i);
        const rest = first ? body.slice(first[0].length) : "";
        const outcomes = Object.entries(f).filter(([k, v]) => v && /^outcome_\d+$/.test(k)).map(([, v]) => v);
        return (
          <div className="sk-wrap sk-overview">
            <aside className="sk-overview-side">
              <Head f={f} />
              {facts.length > 0 && (
                <div className="sk-facts">
                  <h3>At a glance</h3>
                  <ul>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
                  <TrackedLink href={contact} event="consultation_click" service={service} className="sk-facts-cta">
                    Get a scoped estimate <span aria-hidden="true">→</span>
                  </TrackedLink>
                </div>
              )}
              {s.asset && (
                <figure className="sk-figure">
                  <img src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} loading="lazy" />
                </figure>
              )}
            </aside>
            <div className="sk-overview-main">
              {first ? (
                <div className="sk-answer">
                  <span className="sk-answer-label">Quick answer</span>
                  <Rich value={`<p>${first[1]}</p>`} paths={paths} className="sk-answer-text" />
                </div>
              ) : null}
              <Rich value={first ? rest : body} paths={paths} className="sk-body" />
              {outcomes.length > 0 && (
                <ul className="sk-outcomes">
                  {outcomes.map((o) => (
                    <li key={o}>
                      <span aria-hidden="true">✓</span>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      }
      case "services-grid": {
        const rows = numbered(f, "svc", ["title", "body", "url", "icon_key"], 12);
        return (
          <div className="sk-wrap sk-split sk-services">
            <div className="sk-sticky">
              <Head f={f} />
              <p className="sk-body">{`Open a ${pillar?.id === "hire" ? "role" : pillar?.id === "industries" ? "sector" : "service"} to see what it covers, when to choose it and where to read more.`}</p>
              <TrackedLink href={contact} event="consultation_click" service={service} className="sk-btn">
                Start your project <span aria-hidden="true">↗</span>
              </TrackedLink>
            </div>
            <div className="sk-acc">
              {rows.map((r, i) => (
                <details key={r.title} name="sk-services" open={i === 0}>
                  <summary>
                    <h3>{r.title}</h3>
                    <span className="sk-chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m7 10 5 5 5-5" /></svg>
                    </span>
                  </summary>
                  <div className="sk-acc-body">
                    <p>{r.body}</p>
                    {r.url && (
                      <a className="sk-card-link" href={destination(r.url)}>
                        Explore {r.title} <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        );
      }
      case "what-we-deliver": {
        const rows = numbered(f, "card", ["title", "body", "icon_key"], 6);
        return (
          <div className="sk-wrap">
            <Head f={f} />
            <div className="sk-grid sk-cols-3">
              {rows.map((r) => (
                <article className="sk-card" key={r.title}>
                  <Icon name={r.icon_key} text={r.title} />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "why-netofficials": {
        const adv = Object.entries(f).filter(([k, v]) => v && /^adv_\d+$/.test(k)).map(([, v]) => v);
        return (
          <div className="sk-wrap sk-split sk-why">
            <div className="sk-sticky">
              <Head f={f} />
              <Rich value={f.body_paragraph ?? ""} paths={paths} className="sk-body" />
            </div>
            <ol className="sk-adv-grid">
              {adv.map((a, i) => (
                <li className="sk-adv" key={a}>
                  <span className="sk-adv-n">{String(i + 1).padStart(2, "0")}</span>
                  <p>{a}</p>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "process": {
        const steps = numbered(f, "step", ["title", "body"], 6);
        return (
          <div className="sk-wrap">
            <Head f={f} light />
            <ol className="sk-steps" style={{ ["--steps" as string]: steps.length }}>
              {steps.map((st, i) => (
                <li key={st.title}>
                  <span className="sk-step-n">{i + 1}</span>
                  <h3>{st.title}</h3>
                  <p>{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "technology-stack": {
        const groups = numbered(f, "group", ["name", "items"], 6);
        return (
          <div className="sk-wrap">
            <Head f={f} />
            <div className="sk-stack">
              {groups.map((g) => (
                <div className="sk-stack-row" key={g.name}>
                  <h3>{g.name}</h3>
                  <ul>
                    {g.items.split(/[,|;]/).map((i) => i.trim()).filter(Boolean).map((item) => (
                      <li key={item}>
                        <TechIcon name={item} context={g.name} className="sk-tech-icon" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "who-its-for": {
        const rows = numbered(f, "persona", ["title", "problem", "outcome"], 4);
        return (
          <div className="sk-wrap">
            <Head f={f} />
            <div className="sk-grid sk-cols-3">
              {rows.map((r) => (
                <article className="sk-card sk-persona" key={r.title}>
                  <h3>{r.title}</h3>
                  <dl>
                    <dt>Situation</dt>
                    <dd>{r.problem}</dd>
                    <dt>What changes</dt>
                    <dd>{r.outcome}</dd>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "industry-applications": {
        const rows = numbered(f, "industry", ["name", "url", "usecase"], 6);
        return (
          <div className="sk-wrap">
            <div className="sk-head-row">
              <Head f={f} />
              <a className="sk-link sk-head-link" href={contact}>Your industry not listed? Tell us about it →</a>
            </div>
            <div className={"sk-grid " + (rows.length > 4 ? "sk-cols-3" : "sk-cols-2")}>
              {rows.map((r, i) => {
                const link = r.url || industryPage(r.name, paths);
                return (
                  <article className={"sk-ind tint-" + (i % 4)} key={r.name}>
                    <div className="sk-ind-top">
                      <Icon text={r.name} />
                      <span className="sk-ind-n">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3>{link ? <a href={destination(link)}>{r.name}</a> : r.name}</h3>
                    <p>{r.usecase}</p>
                    {link && (
                      <span className="sk-go" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        );
      }
      case "compliance-data": {
        const rows = numbered(f, "item", ["title", "body"], 6);
        return (
          <div className="sk-wrap">
            <Head f={f} />
            <div className="sk-grid sk-cols-2">
              {rows.map((r) => (
                <article className="sk-card sk-row-card" key={r.title}>
                  <Icon name="shield-check" />
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "engagement-models": {
        const rows = numbered(f, "model", ["name", "body", "best_for"], 4);
        return (
          <div className="sk-wrap">
            <Head f={f} light />
            <div className="sk-grid sk-cols-3">
              {rows.map((r) => (
                <article className="sk-card sk-model" key={r.name}>
                  <h3>{r.name}</h3>
                  <p>{r.body}</p>
                  {r.best_for && (
                    <p className="sk-best">
                      <strong>Best for</strong> {r.best_for}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        );
      }
      case "cost-factors": {
        const rows = numbered(f, "factor", ["title", "body"], 6);
        return (
          <div className="sk-wrap sk-split sk-cost">
            <div className="sk-sticky">
              <Head f={f} />
              <Rich value={f.subheadline ?? ""} paths={paths} className="sk-body" />
              <TrackedLink href={contact} event="consultation_click" service={service} className="sk-btn">
                Get a scoped estimate <span aria-hidden="true">↗</span>
              </TrackedLink>
            </div>
            <ol className="sk-factors">
              {rows.map((r, i) => (
                <li key={r.title}>
                  <span className="sk-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      case "faq": {
        const pairs = Object.keys(f).filter((k) => /^q\d+$/.test(k) && f[k] && f[k.replace("q", "a")]);
        return (
          <div className="sk-wrap sk-split sk-faq">
            <div className="sk-sticky">
              <Head f={f} />
              <p className="sk-body">Still deciding? Send a short brief and we reply with questions and a scope.</p>
              <a className="sk-link" href={contact}>Ask us directly →</a>
            </div>
            <div className="sk-accordion">
              {pairs.map((k, i) => (
                <details key={k} name="sk-faq" open={i === 0}>
                  <summary>
                    {f[k]}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <Rich value={f[k.replace("q", "a")]} paths={paths} className="sk-body" />
                </details>
              ))}
            </div>
          </div>
        );
      }
      case "related-services":
      case "related-hubs": {
        const hub = s.id === "related-hubs";
        const rows = hub ? numbered(f, "hub", ["name", "body", "url"], 4) : numbered(f, "service", ["name", "reason", "url"], 4);
        return (
          <div className="sk-wrap">
            <Head f={f} />
            <div className="sk-grid sk-cols-3">
              {rows.map((r) => (
                <a className="sk-rel" key={r.name} href={destination(r.url || "/services")}>
                  <span className="sk-rel-top">
                    <Icon text={r.name} />
                    <span className="sk-rel-kicker">Often paired with this</span>
                  </span>
                  <h3>{r.name}</h3>
                  <p>{hub ? r.body : r.reason}</p>
                  <span className="sk-go" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      }
      case "cta-banner":
        return (
          <div className="sk-wrap sk-cta">
            <div>
              <h2 className="sk-h2">{f.heading}</h2>
              <p className="sk-lead">{f.subheadline}</p>
            </div>
            <div className="sk-actions">
              <TrackedLink href={contact} event="consultation_click" service={service} className="sk-btn is-lime">
                {f.cta_primary_label || "Get a scoped estimate"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {f.cta_secondary_label && (
                <a className="sk-link" href={destination(f.cta_secondary_url || "/how-we-work")}>{f.cta_secondary_label} →</a>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      {nav.length > 2 && (
        <nav className="sk-subnav" aria-label="On this page">
          <ul>
            {nav.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{NAV_LABELS[s.id]}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {sections.map((s) => {
        if (guide && (s.id === "key-takeaways" || isChapter(s.id))) {
          // The takeaways card and every chapter share one article block with a sticky contents rail.
          return s === (takeaways ?? chapters[0]) ? (
            <section key="article" id="guide" className="sk-section sk-article is-white">
              <Article />
            </section>
          ) : null;
        }
        return (
          <section key={s.id} id={s.id} className={`sk-section sk-${s.id} is-${tone.get(s.id)}`}>
            <Body s={s} />
          </section>
        );
      })}
    </>
  );
}
