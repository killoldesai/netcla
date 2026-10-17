import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { V2Icon, V2Img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Why Choose Netofficials: the reasons as checkable working practices, a category comparison that says when the
// alternatives are the better choice, who Netofficials is not right for, approved client feedback (only when it
// exists), and where to read next. Markup follows html-prototype/v2/why-choose.html; styles are
// public/assets/v2/pages/why-choose.css. Nothing is numbered: the reasons have no order.

/** True for content generated from the why-choose spec; older accepted content keeps the legacy renderer. */
export function isWhyChooseContent(content: Content, path: string) {
  return path === "/why-choose-netofficials" && !!content.pageSections?.some((s) => s.id === "not-a-fit" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
const REASON_ICONS = ["ic-scope", "ic-timezone", "ic-team", "ic-milestones", "ic-handover", "ic-cost"];

function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** Plain text becomes a paragraph; rich HTML goes through the sanitiser inside the .prose wrapper. */
function Prose({ value, paths }: { value?: string; paths: string[] }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p>{value}</p>;
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header (.sec__head): each part renders only when the content has it. */
function Head({ eyebrow, title, lead, id }: { eyebrow?: string; title?: string; lead?: string; id?: string }) {
  if (!eyebrow && !title && !lead) return null;
  return (
    <div className="sec__head rv">
      {eyebrow && <p className="label">{eyebrow}</p>}
      {title && (
        <h2 className="big" id={id}>
          {title}
        </h2>
      )}
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
  const heroTitle = h.h1 || content.title;
  const trail = breadcrumbs(path, heroTitle);
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

  return (
    <>
      {hero && (
        <SceneHero
          labelId="wc-h1"
          trail={trail.map((c) => ({ label: c.label, href: go(c.path) }))}
          eyebrow={h.tag_pill || "Why Netofficials"}
          h1={heroTitle}
          sub={h.subheadline}
          actions={
            <>
              <TrackedLink href={contact} event="consultation_click" service="Why choose" className="btn btn--grad">
                {h.cta_primary_label || "Start a conversation"} <V2Icon name="arrow" />
              </TrackedLink>
              {h.cta_secondary_label && (
                <a className="btn btn--ghost" href={go(h.cta_secondary_url || "/how-we-work")}>
                  {h.cta_secondary_label}
                </a>
              )}
            </>
          }
          scene={<HeroScene kind="checklist" title="Why Netofficials" items={reasons.map((r) => r.title).filter(Boolean)} stack={cmpRows.map((r) => r.attribute).filter(Boolean)} />}
        />
      )}
      {reasons.length > 0 && (
        <section id="reasons" className="sec wc-reasons" aria-labelledby={reasonsSec.heading ? "reasons-t" : undefined}>
          <div className="wrap">
            <Head eyebrow={reasonsSec.section_label || undefined} title={reasonsSec.heading || undefined} lead={reasonsSec.intro || undefined} id="reasons-t" />
            <div className="kit-cards kit-cards--3">
              {reasons.map((r, i) => (
                <article className="kit-card rv" key={`${i}-${r.title}`} style={{ background: TINTS[i % TINTS.length], transitionDelay: `${(i % 3) * 0.08}s` }}>
                  <V2Img name={REASON_ICONS[i % REASON_ICONS.length]} className="kit-card__ico" />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {cmpRows.length > 0 && (
        <section id="comparison" className="sec wc-compare" aria-labelledby={cmp.heading ? "comp-t" : undefined}>
          <div className="wrap">
            <Head eyebrow={cmp.section_label || undefined} title={cmp.heading || undefined} lead={cmp.intro || undefined} id="comp-t" />
            <div className="cmp__wrap rv">
              <table className="cmp" aria-label={cmp.heading || "Netofficials compared with typical large outsourcing firms and freelancers"}>
                <thead>
                  <tr>
                    <td aria-hidden="true" />
                    <th scope="col">Netofficials</th>
                    <th scope="col">Large outsourcing firm, typically</th>
                    <th scope="col">Freelancer, typically</th>
                  </tr>
                </thead>
                <tbody>
                  {cmpRows.map((r) => (
                    <tr key={r.attribute}>
                      <th scope="row">{r.attribute}</th>
                      <td data-label="Netofficials" className="on">
                        {r.us}
                      </td>
                      <td data-label="Large outsourcing firm">{r.firms}</td>
                      <td data-label="Freelancer">{r.freelancers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasNotes && (
              <div className="wc-notes rv">
                {cmp.firms_better && (
                  <div className="cat cat--fill" style={{ background: "var(--p-lavender)" }}>
                    <h3>When a large outsourcing firm is the better choice</h3>
                    <p>{cmp.firms_better}</p>
                  </div>
                )}
                {cmp.freelancers_better && (
                  <div className="cat cat--fill" style={{ background: "var(--p-lime)" }}>
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
        <section id="not-a-fit" className="sec sec--cloud wc-fit" aria-labelledby={fitSec.heading ? "fit-t" : undefined}>
          <div className="wrap">
            <Head eyebrow={fitSec.section_label || undefined} title={fitSec.heading || undefined} lead={fitSec.intro || undefined} id="fit-t" />
            <div className="catgrid catgrid--2">
              {fits.map((r, i) => (
                <div className="cat rv" key={`${i}-${r.title}`}>
                  <span className="cat__tag">
                    <V2Icon name="x" />
                    Not a fit
                  </span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section id="proof-testimonials" className="sec wc-proof" aria-labelledby="proof-t">
          <div className="wrap">
            <Head eyebrow={quoteSec.section_label || undefined} title={quoteSec.heading || undefined} id="proof-t" />
            <div className="wc-proof__grid">
              {quotes.map((q, i) => (
                <figure className="cat wc-quote rv" key={`${i}-${q.name}`}>
                  <blockquote>
                    <p>{q.text}</p>
                  </blockquote>
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
        <section id="routes" className="sec sec--cloud wc-routes" aria-labelledby={routesSec.heading ? "routes-t" : undefined}>
          <div className="wrap">
            <Head eyebrow={routesSec.section_label || undefined} title={routesSec.heading || undefined} id="routes-t" />
            <div className="kit-cards kit-cards--3">
              {routes.map((r, i) => (
                <a className="kit-card kit-card--link rv" key={r.name} href={go(r.url || "/services")} style={{ background: TINTS[(i + 1) % TINTS.length], transitionDelay: `${i * 0.08}s` }}>
                  <h3>{r.name}</h3>
                  {r.body && <p>{r.body}</p>}
                  <span className="kit-card__go">
                    Learn more <V2Icon name="arrow" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="sec wc-faq" aria-labelledby={faq.heading ? "faq-t" : undefined}>
          {faqPairs.length >= 4 ? (
            <div className="wrap sc-faq">
              <div className="sc-faq__head rv">
                {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
                {faq.heading && (
                  <h2 className="h2" id="faq-t">
                    {faq.heading}
                  </h2>
                )}
              </div>
              <div className="sc-faq__cols rv">
                {[faqPairs.slice(0, Math.ceil(faqPairs.length / 2)), faqPairs.slice(Math.ceil(faqPairs.length / 2))].map((col, c) => (
                  <div className="acc" key={c}>
                    {col.map((k) => (
                      <details key={k}>
                        <summary>
                          {faq[k]}
                          <i aria-hidden="true">
                            <V2Icon name="plus" />
                          </i>
                        </summary>
                        <Prose value={faq[k.replace("q", "a")]} paths={paths} />
                      </details>
                    ))}
                  </div>
                ))}
              </div>
              <p className="sc-faq__ask rv">
                Not listed here?{" "}
                <a className="btn btn--ghost" href={go("/contact")}>
                  Ask us directly <V2Icon name="arrow" />
                </a>
              </p>
            </div>
          ) : (
            <div className="wrap faq">
              <div className="faq__aside rv">
                {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
                {faq.heading && <h2 id="faq-t">{faq.heading}</h2>}
                <a className="btn btn--ghost" href={go("/contact")}>
                  Ask us directly <V2Icon name="arrow" />
                </a>
              </div>
              <div className="acc rv">
                {faqPairs.map((k, i) => (
                  <details key={k} open={i === 0}>
                    <summary>
                      {faq[k]}
                      <i aria-hidden="true">
                        <V2Icon name="plus" />
                      </i>
                    </summary>
                    <Prose value={faq[k.replace("q", "a")]} paths={paths} />
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="cta-band">
          <div className="wrap">
            <div className="cta-band__in rv">
              <div>
                {cta.heading && <h2>{cta.heading}</h2>}
                {cta.subheadline && <p>{cta.subheadline}</p>}
              </div>
              <div className="cta-band__acts">
                <TrackedLink href={contact} event="consultation_click" service="Why choose" className="btn btn--white">
                  {cta.cta_primary_label || "Start a conversation"} <V2Icon name="arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && (
                  <a className="btn btn--ghost-w" href={go(cta.cta_secondary_url || "/how-we-work")}>
                    {cta.cta_secondary_label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
