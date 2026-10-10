import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { mediaPath } from "./media-path";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Why Choose Netofficials: the reasons as checkable working practices, a category comparison that says when the
// alternatives are the better choice, who Netofficials is not right for, and where to read next.
// Own layout and stylesheet (/assets/why-choose.css). Nothing is numbered: the reasons have no order.

/** True for content generated from the why-choose spec; older accepted content keeps the legacy renderer. */
export function isWhyChooseContent(content: Content, path: string) {
  return path === "/why-choose-netofficials" && !!content.pageSections?.some((s) => s.id === "not-a-fit" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);

function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

function Prose({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"wc-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

export function WhyChooseSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const live = (url: string) => paths.includes(url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = by("hero");
  const h = f("hero");
  const trail = breadcrumbs(path, h.h1 || content.title);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Help defining the scope");
  const reasonsSec = f("reasons");
  const reasons = rows(reasonsSec, "reason", ["title", "body"], 6);
  const cmp = f("comparison");
  const cmpRows = rows(cmp, "row", ["attribute", "us", "firms", "freelancers"], 5);
  const fitSec = f("not-a-fit");
  const fits = rows(fitSec, "fit", ["title", "body"], 3);
  const quotes = rows(f("proof-testimonials"), "quote", ["text", "name", "role"], 3).filter((q) => q.text && q.name);
  const routesSec = f("routes");
  const routes = rows(routesSec, "route", ["name", "url", "body"], 3).filter((r) => !r.url || live(r.url));
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  return (
    <>
      {hero && (
        <section id="hero" className="wc-hero">
          <div className="wc-wrap">
            <nav className="wc-crumbs" aria-label="Breadcrumb">
              <ol>
                {trail.map((c, i) =>
                  i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
                )}
              </ol>
            </nav>
            <div className={"wc-hero-grid" + (hero.asset ? " has-art" : "")}>
              <div>
                <span className="wc-tag">{h.tag_pill || "Why Netofficials"}</span>
                <h1 className="wc-h1">{h.h1 || content.title}</h1>
                <p className="wc-lead">{h.subheadline}</p>
                <div className="wc-actions">
                  <TrackedLink href={contact} event="consultation_click" service="Why choose" className="wc-btn">
                    {h.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  {h.cta_secondary_label && <a className="wc-link" href={go(h.cta_secondary_url || "/how-we-work")}>{h.cta_secondary_label} →</a>}
                </div>
              </div>
              {hero.asset && (
                <figure className="wc-art">
                  <img src={mediaPath(hero.asset)} alt={hero.asset.alt} width={hero.asset.width} height={hero.asset.height} fetchPriority="high" />
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {reasons.length > 0 && (
        <section id="reasons" className="wc-section">
          <div className="wc-wrap wc-split">
            <header className="wc-head is-sticky">
              {reasonsSec.section_label && <p className="wc-eyebrow">{reasonsSec.section_label}</p>}
              <h2 className="wc-h2">{reasonsSec.heading}</h2>
              {reasonsSec.intro && <p className="wc-intro">{reasonsSec.intro}</p>}
            </header>
            <ul className="wc-reasons">
              {reasons.map((r) => (
                <li key={r.title}>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {cmpRows.length > 0 && (
        <section id="comparison" className="wc-section is-tint">
          <div className="wc-wrap">
            <header className="wc-head">
              {cmp.section_label && <p className="wc-eyebrow">{cmp.section_label}</p>}
              <h2 className="wc-h2">{cmp.heading}</h2>
              {cmp.intro && <p className="wc-intro">{cmp.intro}</p>}
            </header>
            <div className="wc-table-wrap">
              <table className="wc-matrix">
                <caption className="wc-sr">Netofficials compared with typical large outsourcing firms and freelancers</caption>
                <thead>
                  <tr>
                    <td aria-hidden="true" />
                    <th scope="col" className="is-us">Netofficials</th>
                    <th scope="col">Large outsourcing firm, typically</th>
                    <th scope="col">Freelancer, typically</th>
                  </tr>
                </thead>
                <tbody>
                  {cmpRows.map((r) => (
                    <tr key={r.attribute}>
                      <th scope="row">{r.attribute}</th>
                      <td data-label="Netofficials" className="is-us">{r.us}</td>
                      <td data-label="Large outsourcing firm">{r.firms}</td>
                      <td data-label="Freelancer">{r.freelancers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(cmp.firms_better || cmp.freelancers_better) && (
              <div className="wc-better">
                {cmp.firms_better && (
                  <div>
                    <h3>When a large outsourcing firm is the better choice</h3>
                    <p>{cmp.firms_better}</p>
                  </div>
                )}
                {cmp.freelancers_better && (
                  <div>
                    <h3>When a freelancer is the better choice</h3>
                    <p>{cmp.freelancers_better}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {fits.length > 0 && (
        <section id="not-a-fit" className="wc-section">
          <div className="wc-wrap">
            <header className="wc-head">
              {fitSec.section_label && <p className="wc-eyebrow">{fitSec.section_label}</p>}
              <h2 className="wc-h2">{fitSec.heading}</h2>
              {fitSec.intro && <p className="wc-intro">{fitSec.intro}</p>}
            </header>
            <ul className="wc-fits">
              {fits.map((r) => (
                <li key={r.title}>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section id="proof-testimonials" className="wc-section is-tint">
          <div className="wc-wrap">
            <header className="wc-head">
              {f("proof-testimonials").section_label && <p className="wc-eyebrow">{f("proof-testimonials").section_label}</p>}
              <h2 className="wc-h2">{f("proof-testimonials").heading}</h2>
            </header>
            <div className="wc-quotes">
              {quotes.map((q) => (
                <figure key={q.name}>
                  <blockquote>{q.text}</blockquote>
                  <figcaption>
                    <strong>{q.name}</strong>
                    {q.role && <span>{q.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section id="routes" className="wc-section">
          <div className="wc-wrap">
            <header className="wc-head">
              {routesSec.section_label && <p className="wc-eyebrow">{routesSec.section_label}</p>}
              <h2 className="wc-h2">{routesSec.heading}</h2>
            </header>
            <div className="wc-routes">
              {routes.map((r) => (
                <a key={r.name} href={go(r.url || "/services")}>
                  <h3>{r.name}</h3>
                  <p>{r.body}</p>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="wc-section is-tint">
          <div className="wc-wrap wc-split">
            <header className="wc-head is-sticky">
              {faq.section_label && <p className="wc-eyebrow">{faq.section_label}</p>}
              <h2 className="wc-h2">{faq.heading}</h2>
            </header>
            <div className="wc-accordion">
              {faqPairs.map((k, i) => (
                <details key={k} name="wc-faq" open={i === 0}>
                  <summary>
                    {faq[k]}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <Prose value={faq[k.replace("q", "a")]} paths={paths} className="wc-answer" />
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="wc-cta">
          <div className="wc-wrap wc-cta-grid">
            <div>
              <h2>{cta.heading}</h2>
              <p>{cta.subheadline}</p>
            </div>
            <div className="wc-actions">
              <TrackedLink href={contact} event="consultation_click" service="Why choose" className="wc-btn is-lime">
                {cta.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {cta.cta_secondary_label && <a className="wc-link is-light" href={go(cta.cta_secondary_url || "/how-we-work")}>{cta.cta_secondary_label} →</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
