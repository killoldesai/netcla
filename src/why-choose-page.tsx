import type { CSSProperties } from "react";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon } from "./site/ui";
import { WhyChooseArt } from "./site/art/why-choose-art";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Why Choose Netofficials: the reasons as checkable working practices, a category comparison that says when the
// alternatives are the better choice, who Netofficials is not right for, and where to read next.
// Markup follows html-prototype/why-choose.html; styles live in public/assets/nx/site.css and pages/why-choose.css.
// Nothing is numbered: the reasons have no order.

/** True for content generated from the why-choose spec; older accepted content keeps the legacy renderer. */
export function isWhyChooseContent(content: Content, path: string) {
  return path === "/why-choose-netofficials" && !!content.pageSections?.some((s) => s.id === "not-a-fit" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
/** Staggered reveal delay for card N in a row of three, as the prototype does. */
const delay = (i: number) => ({ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }) as CSSProperties;

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
  return <div className={"nx-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header: eyebrow (section_label), h2 (heading) and optional lead, each only when the content has it. */
function Head({ f, lead }: { f: Record<string, string>; lead?: string }) {
  if (!f.section_label && !f.heading && !lead) return null;
  return (
    <div className="section-head nx-reveal">
      <div>
        {f.section_label && <span className="eyebrow">{f.section_label}</span>}
        {f.heading && <h2 className="h-section">{f.heading}</h2>}
      </div>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
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
  const quoteSec = f("proof-testimonials");
  const quotes = rows(quoteSec, "quote", ["text", "name", "role"], 3).filter((q) => q.text && q.name);
  const routesSec = f("routes");
  const routes = rows(routesSec, "route", ["name", "url", "body"], 3).filter((r) => !r.url || live(r.url));
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");
  const hasNotes = !!(cmp.firms_better || cmp.freelancers_better);

  const Cta = ({ label, variant }: { label: string; variant: "primary" | "lime" }) => (
    <TrackedLink href={contact} event="consultation_click" service="Why choose" className={`nx-btn nx-btn--${variant} nx-btn--lg`}>
      <span>{label}</span>
      <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
    </TrackedLink>
  );

  // Sub-nav lists only the sections that actually render on this page.
  const nav = [
    reasons.length > 0 && { id: "reasons", label: "Reasons" },
    cmpRows.length > 0 && { id: "comparison", label: "How we compare" },
    fits.length > 0 && { id: "not-a-fit", label: "Not the right fit" },
    quotes.length > 0 && { id: "proof-testimonials", label: "Client feedback" },
    routes.length > 0 && { id: "routes", label: "Where to read next" },
    faqPairs.length > 0 && { id: "faq", label: "FAQ" },
  ].filter((n): n is { id: string; label: string } => !!n);

  return (
    <>
      {hero && (
        <section id="hero" className="page-hero">
          <div className="container">
            <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            <div className="hero__grid">
              <div>
                <span className="tag-pill">{h.tag_pill || "Why Netofficials"}</span>
                <h1>{h.h1 || content.title}</h1>
                {h.subheadline && <p className="lead">{h.subheadline}</p>}
                <div className="hero__actions">
                  <Cta label={h.cta_primary_label || "Start a conversation"} variant="primary" />
                  {h.cta_secondary_label && <ArrowLink href={go(h.cta_secondary_url || "/how-we-work")}>{h.cta_secondary_label}</ArrowLink>}
                </div>
              </div>
              <HeroArt asset={hero.asset} fallback={<WhyChooseArt />} priority />
            </div>
          </div>
        </section>
      )}

      {nav.length > 0 && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {reasons.length > 0 && (
        <section id="reasons" className="section">
          <div className="container">
            <Head f={reasonsSec} lead={reasonsSec.intro} />
            <div className="sk-cards">
              {reasons.map((r, i) => (
                <article className="sk-card nx-reveal" key={`${i}-${r.title}`} style={delay(i)}>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <p className="sk-card__text">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {cmpRows.length > 0 && (
        <section id="comparison" className="section section--white">
          <div className="container">
            <Head f={cmp} lead={cmp.intro} />
            <div className="why-table-wrap nx-reveal" data-allow-overflow>
              <table className="why-matrix">
                <caption className="nx-sr">Netofficials compared with typical large outsourcing firms and freelancers</caption>
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
            {hasNotes && (
              <div className="why-notes nx-reveal">
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
        <section id="not-a-fit" className="section">
          <div className="container">
            <Head f={fitSec} lead={fitSec.intro} />
            <div className="sk-cards">
              {fits.map((r, i) => (
                <article className="sk-card nx-reveal" key={`${i}-${r.title}`} style={delay(i)}>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <p className="sk-card__text">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section id="proof-testimonials" className="section section--white">
          <div className="container">
            <Head f={quoteSec} />
            <div className="why-quotes">
              {quotes.map((q, i) => (
                <figure className="why-quote nx-reveal" key={`${i}-${q.name}`} style={delay(i)}>
                  <blockquote>{q.text}</blockquote>
                  <figcaption>
                    <strong>{q.name}</strong>
                    {q.role && <span>, {q.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section id="routes" className="section">
          <div className="container">
            <Head f={routesSec} />
            <div className="more nx-reveal">
              {routes.map((r) => (
                <a key={r.name} href={go(r.url || "/services")}>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.body}</span>
                  </div>
                  <Icon name="arrow-right" size={20} />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="section section--white">
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
              {faq.heading && <h2 className="h-section">{faq.heading}</h2>}
            </div>
            <FaqList
              name="why-faq"
              items={faqPairs.map((k) => ({
                q: faq[k],
                a: <Prose value={faq[k.replace("q", "a")]} paths={paths} />,
              }))}
            />
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="section">
          <div className="container">
            <div className="nx-cta nx-cta--indigo nx-reveal">
              <div>
                {cta.heading && <h2 className="nx-cta__title">{cta.heading}</h2>}
                {cta.subheadline && <p className="nx-cta__desc">{cta.subheadline}</p>}
              </div>
              <div className="hero__actions">
                <Cta label={cta.cta_primary_label || "Start a conversation"} variant="lime" />
                {cta.cta_secondary_label && <ArrowLink href={go(cta.cta_secondary_url || "/how-we-work")}>{cta.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
