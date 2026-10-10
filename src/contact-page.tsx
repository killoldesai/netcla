import { SiteIcon, legacyIcon } from "./icon-set";
import { LeadForm } from "./render";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, pillars } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The Contact page is a conversion page: intro and form side by side above the fold, then reassurance.
// Own layout and stylesheet (/assets/contact.css). The form posts through LeadForm to /api/leads, unchanged.

/** True for Contact content generated from the contact spec; older accepted content keeps the legacy renderer. */
export function isContactContent(content: Content, path: string) {
  return path === "/contact" && !!content.pageSections?.some((s) => s.id === "next-steps" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** Suggestions for the service box; the visitor can still type anything (links add ?service=...). */
export const SERVICE_SUGGESTIONS = [...new Set([...pillars.map((p) => p.service), "Hire developers", "Digital marketing", "Something else"])];
export const TIMELINES = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just exploring"];

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
  return <div className={"ct-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
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
  const steps = rows(f("next-steps"), "step", ["title", "body"], 3);
  const prepare = f("prepare");
  const items = rows(prepare, "item", ["title", "body"], 4);
  const assurances = rows(f("assurances"), "item", ["title", "body"], 3);
  const routes = rows(f("other-routes"), "route", ["name", "url", "body"], 3).filter((r) => !r.url || live(r.url));
  const offices = f("proof-offices");
  const places = rows(offices, "office", ["city", "address", "timezone"], 2).filter((r) => r.city);
  const direct = [offices.direct_email?.trim() && { href: "mailto:" + offices.direct_email.trim(), label: offices.direct_email.trim(), kind: "Email" }, offices.direct_phone?.trim() && { href: "tel:" + offices.direct_phone.replace(/[^+\d]/g, ""), label: offices.direct_phone.trim(), kind: "Phone" }].filter(Boolean) as { href: string; label: string; kind: string }[];
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const Icon = ({ name }: { name: string }) => (
    <span className="ct-icon" aria-hidden="true">
      <SiteIcon name={legacyIcon[name] ?? name} className="ct-icon-svg" />
    </span>
  );

  return (
    <>
      <section id="hero" className="ct-top">
        <div className="ct-wrap">
          <nav className="ct-crumbs" aria-label="Breadcrumb">
            <ol>
              {trail.map((c, i) =>
                i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
              )}
            </ol>
          </nav>
          <div className="ct-top-grid">
            <div className="ct-intro">
              <span className="ct-tag">{hero.tag_pill || "Contact us"}</span>
              <h1 className="ct-h1">{hero.h1 || content.title}</h1>
              <p className="ct-lead">{hero.subheadline}</p>
              {trust.length > 0 && (
                <ul className="ct-trust">
                  {trust.map((t) => (
                    <li key={t}>
                      <span aria-hidden="true">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              {(direct.length > 0 || places.length > 0) && (
                <div id="proof-offices" className="ct-direct">
                  {offices.heading && <h2>{offices.heading}</h2>}
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
              )}
            </div>

            <div id="contact-form" className="ct-form-card">
              <h2>{form.form_heading || "Tell us about your project"}</h2>
              {form.form_subheadline && <p className="ct-form-sub">{form.form_subheadline}</p>}
              <LeadForm preview={preview}>
                <div className="ct-fields">
                  <label>
                    <span className="ct-label">Name</span>
                    <input name="name" required maxLength={120} autoComplete="name" />
                  </label>
                  <label>
                    <span className="ct-label">Work email</span>
                    <input name="email" type="email" required autoComplete="email" />
                  </label>
                  <label className="is-wide">
                    <span className="ct-label">What do you need?</span>
                    <input name="service" required maxLength={120} list="ct-services" data-service-context="true" defaultValue="" placeholder="e.g. Mobile app development" />
                    <datalist id="ct-services">
                      {SERVICE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </label>
                  <label className="is-wide">
                    <span className="ct-label">Project goal</span>
                    <textarea name="goal" required minLength={10} maxLength={5000} rows={5} />
                    {form.goal_hint && <span className="ct-hint">{form.goal_hint}</span>}
                  </label>
                  <fieldset className="is-wide">
                    <legend className="ct-label">Timeline <em>(optional)</em></legend>
                    <div className="ct-chips">
                      {TIMELINES.map((t) => (
                        <label key={t} className="ct-chip">
                          <input type="radio" name="timeline" value={t} />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label>
                    <span className="ct-label">Country <em>(optional)</em></span>
                    <input name="country" autoComplete="country-name" maxLength={100} />
                  </label>
                  <label>
                    <span className="ct-label">Budget <em>(optional)</em></span>
                    <input name="budget" maxLength={200} placeholder="A range, or still to be decided" />
                  </label>
                  <label>
                    <span className="ct-label">Website <em>(optional)</em></span>
                    <input name="website" type="url" inputMode="url" placeholder="https://" />
                  </label>
                  {/* Honeypot: people never see it; the API rejects submissions that fill it. */}
                  <label className="ct-trap" aria-hidden="true">
                    Company URL
                    <input name="company_url" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <button className="ct-submit" type="submit">
                  {form.submit_label || "Send enquiry"} <span aria-hidden="true">↗</span>
                </button>
              </LeadForm>
              {form.privacy_note && <p className="ct-privacy">{form.privacy_note}</p>}
            </div>
          </div>
        </div>
      </section>

      {steps.length > 0 && (
        <section id="next-steps" className="ct-section is-dark">
          <div className="ct-wrap">
            <header className="ct-head">
              {f("next-steps").section_label && <p className="ct-eyebrow">{f("next-steps").section_label}</p>}
              <h2 className="ct-h2">{f("next-steps").heading}</h2>
            </header>
            <ol className="ct-steps">
              {steps.map((r, i) => (
                <li key={r.title}>
                  <span className="ct-step-n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section id="prepare" className="ct-section">
          <div className="ct-wrap ct-split">
            <header className="ct-head">
              {prepare.section_label && <p className="ct-eyebrow">{prepare.section_label}</p>}
              <h2 className="ct-h2">{prepare.heading}</h2>
              {prepare.intro && <p className="ct-lead">{prepare.intro}</p>}
            </header>
            <ul className="ct-checklist">
              {items.map((r) => (
                <li key={r.title}>
                  <span aria-hidden="true">✓</span>
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
        <section id="assurances" className="ct-section is-paper">
          <div className="ct-wrap">
            <header className="ct-head">
              {f("assurances").section_label && <p className="ct-eyebrow">{f("assurances").section_label}</p>}
              <h2 className="ct-h2">{f("assurances").heading}</h2>
            </header>
            <div className="ct-assure">
              {assurances.map((r, i) => (
                <article key={r.title}>
                  <Icon name={["lock", "chat", "puzzle"][i] ?? "shield"} />
                  <h3>{r.title}</h3>
                  <Prose value={r.body} paths={paths} />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section id="other-routes" className="ct-section">
          <div className="ct-wrap">
            <header className="ct-head">
              {f("other-routes").section_label && <p className="ct-eyebrow">{f("other-routes").section_label}</p>}
              <h2 className="ct-h2">{f("other-routes").heading}</h2>
            </header>
            <div className="ct-routes">
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
        <section id="faq" className="ct-section is-paper">
          <div className="ct-wrap ct-split">
            <header className="ct-head">
              {faq.section_label && <p className="ct-eyebrow">{faq.section_label}</p>}
              <h2 className="ct-h2">{faq.heading}</h2>
              <TrackedLink href={go("/contact") + "#contact-form"} event="consultation_click" service="Contact" className="ct-link">
                Back to the form →
              </TrackedLink>
            </header>
            <div className="ct-accordion">
              {faqPairs.map((k, i) => (
                <details key={k} name="ct-faq" open={i === 0}>
                  <summary>
                    {faq[k]}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <Prose value={faq[k.replace("q", "a")]} paths={paths} />
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
