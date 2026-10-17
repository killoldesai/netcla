import { LeadForm } from "./render";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillars } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { V2Crumbs, V2Icon, V2Img, V2_VERSION } from "./site/v2/ui";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The Contact page is a conversion page on the v2 (monday-style) design: intro and the real enquiry form side by
// side above the fold, then reassurance. Markup follows html-prototype/v2/contact.html (styles: public/assets/v2/
// pages/contact.css). The form posts through LeadForm to /api/leads, unchanged; LeadForm renders the form.form
// element itself, so this file only supplies its fields.

/** True for Contact content generated from the contact spec; older accepted content keeps the legacy renderer. */
export function isContactContent(content: Content, path: string) {
  return path === "/contact" && !!content.pageSections?.some((s) => s.id === "next-steps" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** Suggestions for the service box; the visitor can still type anything (links add ?service=...). */
export const SERVICE_SUGGESTIONS = [...new Set([...pillars.map((p) => p.service), "Hire developers", "Digital marketing", "Something else"])];
export const TIMELINES = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just exploring"];

/** Prototype spot icons for the assurance cards, in content order (handover, named contact, change control). */
const ASSURANCE_SPOT = ["ic-handover", "ic-team", "ic-scope"];
const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
/** Line icons for the other-ways cards, by destination. */
const ROUTE_ICON: Record<string, "gear" | "layers" | "code" | "rocket"> = { "/how-we-work": "gear", "/engagement-models": "layers", "/hire-developers": "code", "/services": "rocket" };

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

/** Running text: plain text stays a paragraph, rich HTML is sanitised and wrapped in the prose wrapper. */
function Prose({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={`prose ${className ?? ""}`.trim()} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header (`.sec__head`), each part only when present. */
function Head({ label, fallback, heading }: { label?: string; fallback?: string; heading?: string }) {
  if (!label && !fallback && !heading) return null;
  return (
    <div className="sec__head rv">
      {(label || fallback) && <p className="label">{label || fallback}</p>}
      {heading && <h2 className="big">{heading}</h2>}
    </div>
  );
}

export function ContactSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const live = (url: string) => paths.includes(url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = f("hero");
  const form = f("contact-form");
  const trail = breadcrumbs(path, hero.h1 || content.title);
  const trust = [hero.trust_1, hero.trust_2, hero.trust_3].map((t) => t?.trim()).filter(Boolean);
  const next = f("next-steps");
  const steps = rows(next, "step", ["title", "body"], 3);
  const prepare = f("prepare");
  const items = rows(prepare, "item", ["title", "body"], 4);
  const assurance = f("assurances");
  const assurances = rows(assurance, "item", ["title", "body"], 3);
  const other = f("other-routes");
  const routes = rows(other, "route", ["name", "url", "body"], 3).filter((r) => !r.url || live(r.url));
  const offices = f("proof-offices");
  const places = rows(offices, "office", ["city", "address", "timezone"], 2).filter((r) => r.city);
  const direct = [offices.direct_email?.trim() && { href: "mailto:" + offices.direct_email.trim(), label: offices.direct_email.trim(), kind: "Email" }, offices.direct_phone?.trim() && { href: "tel:" + offices.direct_phone.replace(/[^+\d]/g, ""), label: offices.direct_phone.trim(), kind: "Phone" }].filter(Boolean) as { href: string; label: string; kind: string }[];
  const showOffices = direct.length > 0 || places.length > 0;
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);

  return (
    <>
      <link rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />
      <section id="hero" className="hero--form">
        <div className="wrap">
          <div>
            <V2Crumbs trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            {hero.tag_pill && <p className="eyebrow">{hero.tag_pill}</p>}
            <h1>{hero.h1 || content.title}</h1>
            {hero.subheadline && <p className="lead">{hero.subheadline}</p>}
            {trust.length > 0 && (
              <ul className="ticks">
                {trust.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className="ct-media rv">
              <V2Img name="scene-contact" width={800} height={600} alt="Illustrated character waving at a desk" />
            </div>
          </div>

          <div id="contact-form" className="ct-form-card">
            <LeadForm preview={preview}>
              <h2 className="form__title">{form.form_heading || "Tell us about your project"}</h2>
              {form.form_subheadline && <p className="form__req">{form.form_subheadline}</p>}
              <p className="form__req">Required: name, email, service and project goal.</p>
              <div className="fgrid">
                <div className="field">
                  <label htmlFor="contact-name">Your name</label>
                  <input id="contact-name" name="name" required maxLength={120} autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Work email</label>
                  <input id="contact-email" name="email" type="email" required autoComplete="email" />
                  <span className="help">We only use it to reply to you.</span>
                </div>
                <div className="field field--full">
                  <label htmlFor="contact-service">What do you need?</label>
                  <input id="contact-service" name="service" required maxLength={120} list="ct-services" data-service-context="true" defaultValue="" placeholder="e.g. Mobile app development" />
                  <datalist id="ct-services">
                    {SERVICE_SUGGESTIONS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div className="field">
                  <label htmlFor="contact-country">
                    Country <small>(optional)</small>
                  </label>
                  <input id="contact-country" name="country" autoComplete="country-name" maxLength={100} />
                </div>
                <div className="field">
                  <label htmlFor="contact-budget">
                    Budget <small>(optional)</small>
                  </label>
                  <input id="contact-budget" name="budget" maxLength={200} placeholder="A range, or still to be decided" />
                </div>
                <div className="field">
                  <label htmlFor="contact-website">
                    Website <small>(optional)</small>
                  </label>
                  <input id="contact-website" name="website" type="url" inputMode="url" placeholder="https://" />
                </div>
                <fieldset className="field field--full ct-choice">
                  <legend>
                    Timeline <small>(optional)</small>
                  </legend>
                  <div className="ct-chips">
                    {TIMELINES.map((t) => (
                      <label key={t} className="ct-chip">
                        <input type="radio" name="timeline" value={t} />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field field--full">
                  <label htmlFor="contact-goal">Your project or business goal</label>
                  <textarea id="contact-goal" name="goal" required minLength={10} maxLength={5000} rows={5} aria-describedby={form.goal_hint ? "contact-goal-hint" : undefined} />
                  {form.goal_hint && <span id="contact-goal-hint" className="help">{form.goal_hint}</span>}
                </div>
              </div>
              {/* Honeypot: people never see it; the API rejects submissions that fill it. */}
              <label className="ct-trap" aria-hidden="true">
                Company URL
                <input name="company_url" tabIndex={-1} autoComplete="off" />
              </label>
              <button className="btn btn--grad" type="submit">
                <span>{form.submit_label || "Send enquiry"}</span>
                <V2Icon name="arrow" />
              </button>
              {form.privacy_note && <p className="form__note">{form.privacy_note}</p>}
            </LeadForm>
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section id="next-steps" className="sec sec--cloud">
          <div className="wrap">
            <Head label={next.section_label || "What happens next"} heading={next.heading} />
            <ol className="kit-steps rv">
              {steps.map((r, i) => (
                <li key={r.title} className="kit-step">
                  <span className="kit-step__n" style={{ background: TINTS[i % TINTS.length] }}>
                    {i + 1}
                  </span>
                  <h3>{r.title}</h3>
                  {r.body && <p>{r.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section id="prepare" className="sec">
          <div className="wrap">
            <div className="band band--lavender rv">
              <div>
                <p className="eyebrow">{prepare.section_label || "What to include"}</p>
                {prepare.heading && <h2 className="h2">{prepare.heading}</h2>}
                {prepare.intro && <p className="lead">{prepare.intro}</p>}
              </div>
              <div className="fc ct-frame">
                <b>Brief checklist</b>
                <div className="fc__in">
                  {items.map((r) => (
                    <span className="fc__row" key={r.title}>
                      <i className="on">
                        <V2Icon name="check" />
                      </i>
                      <span className="ct-item">
                        <strong>{r.title}</strong>
                        {r.body && <span>{r.body}</span>}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {assurances.length > 0 && (
        <section id="assurances" className="sec">
          <div className="wrap">
            <Head label={assurance.section_label || "Assurances"} heading={assurance.heading} />
            <div className="kit-cards kit-cards--3">
              {assurances.map((r, i) => (
                <article className="kit-card rv" key={r.title} style={{ background: TINTS[(i + 1) % TINTS.length], transitionDelay: `${i * 0.08}s` }}>
                  <V2Img name={ASSURANCE_SPOT[i] ?? "ic-scope"} className="kit-card__ico" />
                  <h3>{r.title}</h3>
                  <Prose value={r.body} paths={paths} />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section id="other-routes" className="sec sec--cloud">
          <div className="wrap">
            <Head label={other.section_label || "Other ways in"} heading={other.heading} />
            <div className="kit-cards kit-cards--3">
              {routes.map((r, i) => (
                <a className="kit-card kit-card--plain kit-card--link rv" key={r.name} href={go(r.url || "/services")} style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className="ct-route-ico" style={{ background: TINTS[i % TINTS.length] }}>
                    <V2Icon name={ROUTE_ICON[r.url] ?? "chat"} />
                  </span>
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

      {showOffices && (
        <section id="proof-offices" className="sec">
          <div className="wrap">
            <Head label={offices.section_label} heading={offices.heading} />
            <div className="ct-direct rv">
              {direct.map((d) => (
                <p key={d.kind}>
                  <span>{d.kind}</span>
                  <a href={d.href}>{d.label}</a>
                </p>
              ))}
              {places.map((o) => (
                <p key={o.city} className="ct-office">
                  <span>{o.city}</span>
                  {[o.address, o.timezone].filter(Boolean).join(" · ")}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="sec sec--cloud">
          {faqPairs.length >= 4 ? (
            <div className="wrap sc-faq">
              <div className="sc-faq__head rv">
                {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
                {faq.heading && <h2 className="h2">{faq.heading}</h2>}
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
                <TrackedLink href={go("/contact") + "#contact-form"} event="consultation_click" service="Contact" className="btn btn--ghost">
                  <span>Back to the form</span>
                  <V2Icon name="arrow" />
                </TrackedLink>
              </p>
            </div>
          ) : (
            <div className="wrap faq">
              <div className="faq__aside rv">
                {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
                {faq.heading && <h2>{faq.heading}</h2>}
                <TrackedLink href={go("/contact") + "#contact-form"} event="consultation_click" service="Contact" className="btn btn--ghost">
                  <span>Back to the form</span>
                  <V2Icon name="arrow" />
                </TrackedLink>
              </div>
              <div className="acc rv">
                {faqPairs.map((k, i) => (
                  <details key={k} open={i === 0 || undefined}>
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
    </>
  );
}
