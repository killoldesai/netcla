import type { CSSProperties } from "react";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon, SectionHead } from "./site/ui";
import { EngagementArt } from "./site/art/engagement-art";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Engagement Models is a comparison-and-decision page: one comparison matrix, a situation selector, what drives
// the price, and how an engagement starts. Markup follows html-prototype/engagement-models.html; styles live in
// public/assets/nx/pages/engagement.css (shared model panels, nx-seg, steps and FAQ in public/assets/nx/site.css).
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
const delay = (i: number) => ({ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }) as CSSProperties;

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
  return <div className="nx-prose" dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
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

  // Sub-nav lists only the sections that render on this page.
  const subnav = [
    models.length > 0 && ["models-comparison", "The three models"],
    situations.length > 0 && ["decision-guide", "Which model fits"],
    factors.length > 0 && ["pricing-factors", "Price"],
    steps.length > 0 && ["process", "How it starts"],
    faqPairs.length > 0 && ["faq", "FAQ"],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      {hero && (
        <section id="hero" className="page-hero">
          <div className="container">
            <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            <div className="hero__grid">
              <div>
                <span className="tag-pill">{h.tag_pill || "Engagement models"}</span>
                <h1>{h.h1 || content.title}</h1>
                {h.subheadline && <p className="lead">{h.subheadline}</p>}
                <div className="hero__actions">
                  <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="nx-btn nx-btn--primary nx-btn--lg">
                    <span>{h.cta_primary_label || "Discuss which model fits"}</span>
                    <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                  </TrackedLink>
                  {h.cta_secondary_label && <ArrowLink href={go(h.cta_secondary_url || "/how-we-work")}>{h.cta_secondary_label}</ArrowLink>}
                </div>
              </div>
              <HeroArt asset={hero.asset} fallback={<EngagementArt />} priority />
            </div>
          </div>
        </section>
      )}

      {subnav.length > 0 && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {subnav.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {models.length > 0 && (
        <section id="models-comparison" className="section">
          <div className="container">
            <SectionHead eyebrow={comparison.section_label || undefined} title={comparison.heading} />
            <div className="em-table-wrap nx-reveal">
              <table className="em-matrix">
                <caption className="nx-sr">Fixed-price project, dedicated development team and staff augmentation compared</caption>
                <thead>
                  <tr>
                    <td aria-hidden="true" />
                    {models.map((m) => (
                      <th key={m.n} id={`model-${m.n}`} scope="col">
                        <strong>{m.name}</strong>
                        {m.tagline && <span>{m.tagline}</span>}
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
        <section id="decision-guide" className="section section--white">
          <div className="container">
            <div className="engage">
              <div className="nx-reveal">
                {guide.section_label && <span className="eyebrow">{guide.section_label}</span>}
                <h2 className="h-section">{guide.heading}</h2>
              </div>
              <div className="nx-reveal">
                {/* The segment picks the situation; its .model panel shows the recommendation (behaviors.tsx). */}
                <div className="nx-seg" role="radiogroup" aria-label="Pick the situation closest to yours" data-seg>
                  <span className="nx-seg__thumb" aria-hidden="true" />
                  {situations.map((r, i) => (
                    <button
                      type="button"
                      key={i}
                      className="nx-seg__opt"
                      role="radio"
                      aria-checked={i === 0}
                      tabIndex={i === 0 ? 0 : -1}
                      data-value={`situation-${i + 1}`}
                    >
                      {r.choice}
                    </button>
                  ))}
                </div>
                <div aria-live="polite">
                  {situations.map((r, i) => (
                    <div key={i} className="model" data-model={`situation-${i + 1}`} hidden={i !== 0}>
                      <p className="em-scenario">{r.scenario}</p>
                      <p className="quick__label">Our recommendation</p>
                      <h3>{r.choice}</h3>
                      <p>{r.recommendation}</p>
                      <div className="model__actions">
                        <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="nx-btn nx-btn--primary">
                          <span>Discuss this model</span>
                          <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                        </TrackedLink>
                        <ArrowLink href={modelAnchor(r.choice)}>See it in the comparison</ArrowLink>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {factors.length > 0 && (
        <section id="pricing-factors" className="section">
          <div className="container em-price">
            <div className="nx-reveal">
              {pricing.section_label && <span className="eyebrow">{pricing.section_label}</span>}
              <h2 className="h-section">{pricing.heading}</h2>
              {pricing.intro && <p className="lead">{pricing.intro}</p>}
            </div>
            <div className="em-factors">
              {factors.map((r, i) => (
                <article key={r.title} className="sk-card nx-reveal" style={delay(i)}>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <p className="sk-card__text">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="process" className="section band">
          <div className="container">
            <SectionHead eyebrow={process.section_label || undefined} title={process.heading} />
            <ol className="nx-steps" data-steps>
              {steps.map((r, i) => (
                <li key={r.title} className="nx-step nx-reveal" style={delay(i)}>
                  <h3 className="nx-step__title">{r.title}</h3>
                  <p className="nx-step__desc">{r.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="section section--white">
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
              <h2 className="h-section">{faq.heading}</h2>
            </div>
            <FaqList
              name="engagement-faq"
              items={faqPairs.map((k) => ({ q: faq[k], a: <Prose value={faq[k.replace("q", "a")]} paths={paths} /> }))}
            />
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="section">
          <div className="container">
            <div className="nx-cta nx-cta--indigo nx-reveal">
              <div>
                <h2 className="nx-cta__title">{cta.heading}</h2>
                <p className="nx-cta__desc">{cta.subheadline}</p>
              </div>
              <div className="em-cta-actions">
                <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{cta.cta_primary_label || "Discuss which model fits"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && <ArrowLink href={go(cta.cta_secondary_url || "/why-choose-netofficials")}>{cta.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
