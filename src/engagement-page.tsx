import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { mediaPath } from "./media-path";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Engagement Models is a comparison-and-decision page: one comparison matrix, a situation selector, what drives
// the price, and how an engagement starts. Own layout and stylesheet (/assets/engagement.css).
// Numbers appear only where the order is real (the steps of an engagement), never on the models or sections.

/** True for content generated from the engagement spec; older accepted content keeps the legacy renderer. */
export function isEngagementContent(content: Content, path: string) {
  return path === "/engagement-models" && !!content.pageSections?.some((s) => s.id === "pricing-factors" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** The rows of the comparison matrix: label on the left, field suffix per model. */
export const MATRIX_ROWS = [
  ["How it works", "body"],
  ["Who manages the work", "management"],
  ["Team", "team"],
  ["How it is billed", "pricing"],
  ["Duration", "timeline"],
  ["Handling changes", "changes"],
  ["Best for", "best_for"],
] as const;

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

function Prose({ value, paths }: { value?: string; paths: string[] }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p>{value}</p>;
  return <div className="en-prose" dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

export function EngagementSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = by("hero");
  const h = f("hero");
  const trail = breadcrumbs(path, h.h1 || content.title);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Engagement model");
  const comparison = f("models-comparison");
  const models = [1, 2, 3]
    .map((n) => ({
      n,
      name: comparison[`model_${n}_name`]?.trim() ?? "",
      tagline: comparison[`model_${n}_tagline`]?.trim() ?? "",
      cells: Object.fromEntries(MATRIX_ROWS.map(([, key]) => [key, comparison[`model_${n}_${key}`]?.trim() ?? ""])) as Record<string, string>,
    }))
    .filter((m) => m.name);
  const guide = f("decision-guide");
  const situations = rows(guide, "situation", ["scenario", "choice", "recommendation"], 3);
  const modelAnchor = (choice: string) => {
    const m = models.find((x) => x.name.toLowerCase() === choice.toLowerCase());
    return m ? `#model-${m.n}` : "#models-comparison";
  };
  const pricing = f("pricing-factors");
  const factors = rows(pricing, "factor", ["title", "body"], 4);
  const process = f("process");
  const steps = rows(process, "step", ["title", "body"], 4);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  return (
    <>
      {hero && (
        <section id="hero" className="en-hero">
          <div className="en-wrap">
            <nav className="en-crumbs" aria-label="Breadcrumb">
              <ol>
                {trail.map((c, i) =>
                  i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
                )}
              </ol>
            </nav>
            <div className={"en-hero-grid" + (hero.asset ? " has-art" : "")}>
              <div>
                <span className="en-tag">{h.tag_pill || "Engagement models"}</span>
                <h1 className="en-h1">{h.h1 || content.title}</h1>
                <p className="en-lead">{h.subheadline}</p>
                <div className="en-actions">
                  <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="en-btn">
                    {h.cta_primary_label || "Discuss which model fits"} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  {h.cta_secondary_label && <a className="en-link" href={go(h.cta_secondary_url || "/how-we-work")}>{h.cta_secondary_label} →</a>}
                </div>
              </div>
              {hero.asset && (
                <figure className="en-art">
                  <img src={mediaPath(hero.asset)} alt={hero.asset.alt} width={hero.asset.width} height={hero.asset.height} fetchPriority="high" />
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {models.length > 0 && (
        <section id="models-comparison" className="en-section is-tint">
          <div className="en-wrap">
            <header className="en-head">
              {comparison.section_label && <p className="en-eyebrow">{comparison.section_label}</p>}
              <h2 className="en-h2">{comparison.heading}</h2>
            </header>
            <div className="en-table-wrap">
              <table className="en-matrix">
                <caption className="en-sr">Fixed-price project, dedicated development team and staff augmentation compared</caption>
                <thead>
                  <tr>
                    <td aria-hidden="true" />
                    {models.map((m) => (
                      <th key={m.n} id={`model-${m.n}`} scope="col">
                        <strong>{m.name}</strong>
                        <span>{m.tagline}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX_ROWS.map(([label, key]) =>
                    models.some((m) => m.cells[key]) ? (
                      <tr key={key} className={key === "body" ? "is-lead" : undefined}>
                        <th scope="row">{label}</th>
                        {models.map((m) => (
                          <td key={m.n} data-label={m.name}>
                            <Prose value={m.cells[key]} paths={paths} />
                          </td>
                        ))}
                      </tr>
                    ) : null,
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {situations.length > 0 && (
        <section id="decision-guide" className="en-section">
          <div className="en-wrap">
            <header className="en-head">
              {guide.section_label && <p className="en-eyebrow">{guide.section_label}</p>}
              <h2 className="en-h2">{guide.heading}</h2>
            </header>
            {/* Pure CSS selector: the checked situation decides which recommendation shows. */}
            <div className="en-finder">
              <fieldset className="en-finder-q">
                <legend>Pick the situation closest to yours</legend>
                {situations.map((r, i) => (
                  <span key={r.scenario}>
                    <input type="radio" name="en-situation" id={`en-sit-${i + 1}`} defaultChecked={i === 0} />
                    <label htmlFor={`en-sit-${i + 1}`}>{r.scenario}</label>
                  </span>
                ))}
              </fieldset>
              <div className="en-finder-a" aria-live="polite">
                {situations.map((r, i) => (
                  <div key={r.scenario} className="en-result" data-for={i + 1}>
                    <span className="en-result-label">Our recommendation</span>
                    <h3>{r.choice}</h3>
                    <p>{r.recommendation}</p>
                    <div className="en-actions">
                      <a className="en-btn" href={modelAnchor(r.choice)}>See it in the comparison</a>
                      <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="en-link">
                        Discuss this model →
                      </TrackedLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {factors.length > 0 && (
        <section id="pricing-factors" className="en-section is-tint">
          <div className="en-wrap en-split">
            <header className="en-head">
              {pricing.section_label && <p className="en-eyebrow">{pricing.section_label}</p>}
              <h2 className="en-h2">{pricing.heading}</h2>
              {pricing.intro && <p className="en-lead">{pricing.intro}</p>}
            </header>
            <ul className="en-factors">
              {factors.map((r) => (
                <li key={r.title}>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="process" className="en-section is-dark">
          <div className="en-wrap">
            <header className="en-head">
              {process.section_label && <p className="en-eyebrow">{process.section_label}</p>}
              <h2 className="en-h2">{process.heading}</h2>
            </header>
            <ol className="en-steps">
              {steps.map((r, i) => (
                <li key={r.title}>
                  <span className="en-step-n" aria-hidden="true">{i + 1}</span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="en-section">
          <div className="en-wrap en-faq">
            <header className="en-head">
              {faq.section_label && <p className="en-eyebrow">{faq.section_label}</p>}
              <h2 className="en-h2">{faq.heading}</h2>
            </header>
            <div className="en-accordion">
              {faqPairs.map((k, i) => (
                <details key={k} name="en-faq" open={i === 0}>
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

      {by("cta-banner") && (
        <section id="cta-banner" className="en-cta">
          <div className="en-wrap en-cta-grid">
            <div>
              <h2>{cta.heading}</h2>
              <p>{cta.subheadline}</p>
            </div>
            <div className="en-actions">
              <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="en-btn is-lime">
                {cta.cta_primary_label || "Discuss which model fits"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {cta.cta_secondary_label && <a className="en-link is-light" href={go(cta.cta_secondary_url || "/why-choose-netofficials")}>{cta.cta_secondary_label} →</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
