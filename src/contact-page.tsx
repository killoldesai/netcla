import type { CSSProperties } from "react";
import { LeadForm } from "./render";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillars } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { FaqList, Icon, ProductIcon, SectionHead, Breadcrumbs } from "./site/ui";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The Contact page is a conversion page: intro and enquiry form side by side above the fold, then reassurance.
// Markup follows html-prototype/contact.html; styles in public/assets/nx/pages/contact.css.
// The form posts through LeadForm to /api/leads, unchanged.

/** True for Contact content generated from the contact spec; older accepted content keeps the legacy renderer. */
export function isContactContent(content: Content, path: string) {
  return path === "/contact" && !!content.pageSections?.some((s) => s.id === "next-steps" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** Suggestions for the service box; the visitor can still type anything (links add ?service=...). */
export const SERVICE_SUGGESTIONS = [...new Set([...pillars.map((p) => p.service), "Hire developers", "Digital marketing", "Something else"])];
export const TIMELINES = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just exploring"];

/** Prototype icons for the assurance cards, in content order (handover, named contact, change control). */
const ASSURANCE_ICONS = ["document-text", "users-group", "shield-check"];
/** Prototype icons for the other-ways cards, by destination. */
const ROUTE_ICONS: Record<string, string> = { "/how-we-work": "settings-gear", "/engagement-models": "layers-stack", "/hire-developers": "code-brackets", "/services": "rocket-launch" };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const delay = (i: number) => ({ "--nx-delay": `${i * 100}ms` }) as CSSProperties;

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
  // Sections after the dark band alternate white and paper; omitted sections drop out of the rhythm.
  const after = [items.length > 0 && "prepare", assurances.length > 0 && "assurances", routes.length > 0 && "other-routes", showOffices && "proof-offices", faqPairs.length > 0 && "faq"].filter(Boolean) as string[];
  const tone = (id: string) => "section" + (after.indexOf(id) % 2 === 0 ? " section--white" : "");

  return (
    <>
      <section id="hero" className="page-hero ct-hero">
        <div className="container">
          <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
          <div className="contact ct-grid">
            <div className="ct-intro">
              <span className="tag-pill">{hero.tag_pill || "Contact us"}</span>
              <h1>{hero.h1 || content.title}</h1>
              {hero.subheadline && <p className="lead">{hero.subheadline}</p>}
              {trust.length > 0 && (
                <ul className="ct-trust">
                  {trust.map((t) => (
                    <li key={t}>
                      <Icon name="check" size={18} className="nx-icon" />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div id="contact-form" className="ct-form-card">
              <LeadForm preview={preview}>
                <div className="ct-fields">
                  <div>
                    <h2 className="form__title">{form.form_heading || "Tell us about your project"}</h2>
                    {form.form_subheadline && <p className="form__sub">{form.form_subheadline}</p>}
                  </div>
                  <div className="form__row">
                    <div className="nx-field">
                      <label htmlFor="contact-name">Name</label>
                      <input id="contact-name" className="nx-field__control" name="name" required maxLength={120} autoComplete="name" />
                    </div>
                    <div className="nx-field">
                      <label htmlFor="contact-email">Work email</label>
                      <input id="contact-email" className="nx-field__control" name="email" type="email" required autoComplete="email" />
                    </div>
                  </div>
                  <div className="nx-field">
                    <label htmlFor="contact-service">What do you need?</label>
                    <input id="contact-service" className="nx-field__control" name="service" required maxLength={120} list="ct-services" data-service-context="true" defaultValue="" placeholder="e.g. Mobile app development" />
                    <datalist id="ct-services">
                      {SERVICE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div className="nx-field">
                    <label htmlFor="contact-goal">Project goal</label>
                    <textarea id="contact-goal" className="nx-field__control" name="goal" required minLength={10} maxLength={5000} rows={5} aria-describedby={form.goal_hint ? "contact-goal-hint" : undefined} />
                    {form.goal_hint && <span id="contact-goal-hint" className="nx-field__hint">{form.goal_hint}</span>}
                  </div>
                  <fieldset className="ct-choice">
                    <legend>
                      Timeline <span className="form__opt">(optional)</span>
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
                  <div className="form__row">
                    <div className="nx-field">
                      <label htmlFor="contact-country">Country <span className="form__opt">(optional)</span></label>
                      <input id="contact-country" className="nx-field__control" name="country" autoComplete="country-name" maxLength={100} />
                    </div>
                    <div className="nx-field">
                      <label htmlFor="contact-budget">Budget <span className="form__opt">(optional)</span></label>
                      <input id="contact-budget" className="nx-field__control" name="budget" maxLength={200} placeholder="A range, or still to be decided" />
                    </div>
                  </div>
                  <div className="nx-field">
                    <label htmlFor="contact-website">Website <span className="form__opt">(optional)</span></label>
                    <input id="contact-website" className="nx-field__control" name="website" type="url" inputMode="url" placeholder="https://" />
                  </div>
                  {/* Honeypot: people never see it; the API rejects submissions that fill it. */}
                  <label className="ct-trap" aria-hidden="true">
                    Company URL
                    <input name="company_url" tabIndex={-1} autoComplete="off" />
                  </label>
                  <button className="nx-btn nx-btn--primary nx-btn--lg ct-submit" type="submit">
                    <span>{form.submit_label || "Send enquiry"}</span>
                    <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                  </button>
                  {form.privacy_note && <p className="form__legal">{form.privacy_note}</p>}
                </div>
              </LeadForm>
            </div>
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section id="next-steps" className="section band">
          <div className="container">
            <SectionHead eyebrow={next.section_label} title={next.heading} />
            <ol className="nx-steps">
              {steps.map((r, i) => (
                <li className="nx-step nx-reveal" key={r.title} style={delay(i)}>
                  <h3 className="nx-step__title">{r.title}</h3>
                  <p className="nx-step__desc">{r.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section id="prepare" className={tone("prepare")}>
          <div className="container ct-split">
            <div className="nx-reveal">
              {prepare.section_label && <span className="eyebrow">{prepare.section_label}</span>}
              <h2 className="h-section">{prepare.heading}</h2>
              {prepare.intro && <p className="lead">{prepare.intro}</p>}
            </div>
            <ul className="ct-checklist">
              {items.map((r, i) => (
                <li className="nx-reveal" key={r.title} style={delay(i)}>
                  <Icon name="check" size={20} className="nx-icon" />
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {assurances.length > 0 && (
        <section id="assurances" className={tone("assurances")}>
          <div className="container">
            <SectionHead eyebrow={assurance.section_label} title={assurance.heading} />
            <div className="sk-cards">
              {assurances.map((r, i) => (
                <article className="sk-card nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={ASSURANCE_ICONS[i] ?? "shield-check"} size={26} />
                  </span>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <Prose value={r.body} paths={paths} className="sk-card__text" />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section id="other-routes" className={tone("other-routes")}>
          <div className="container">
            <SectionHead eyebrow={other.section_label} title={other.heading} />
            <div className="sk-cards ct-routes">
              {routes.map((r, i) => (
                <a className="sk-card nx-reveal" key={r.name} href={go(r.url || "/services")} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={ROUTE_ICONS[r.url] ?? "document-text"} size={26} />
                  </span>
                  <h3 className="sk-card__title">{r.name}</h3>
                  <p className="sk-card__text">{r.body}</p>
                  <span className="ct-route-arrow" aria-hidden="true">
                    <Icon name="arrow-right" size={20} className="nx-icon" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {showOffices && (
        <section id="proof-offices" className={tone("proof-offices")}>
          <div className="container">
            {(offices.heading || offices.section_label) && (
              <div className="section-head nx-reveal">
                <div>
                  {offices.section_label && <span className="eyebrow">{offices.section_label}</span>}
                  {offices.heading && <h2 className="h-section">{offices.heading}</h2>}
                </div>
              </div>
            )}
            <div className="ct-direct nx-reveal">
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
        <section id="faq" className={tone("faq")}>
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
              <h2 className="h-section">{faq.heading}</h2>
              <TrackedLink href={go("/contact") + "#contact-form"} event="consultation_click" service="Contact" className="nx-btn nx-btn--secondary">
                <span>Back to the form</span>
                <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
              </TrackedLink>
            </div>
            <div className="nx-reveal">
              <FaqList
                name="ct-faq"
                items={faqPairs.map((k) => ({ q: faq[k], a: <Prose value={faq[k.replace("q", "a")]} paths={paths} /> }))}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
