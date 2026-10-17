import { type CSSProperties } from "react";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { V2Crumbs, V2Icon, V2Img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// Engagement Models is a comparison-and-decision page: three model cards, one comparison matrix, a situation
// accordion, what drives the price, and how an engagement starts. Markup follows
// html-prototype/v2/engagement-models.html; styles are public/assets/v2/pages/engagement-models.css.
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

const PLAN_ICONS = ["ic-scope", "ic-team", "ic-milestones"];
const PLAN_COLORS = ["var(--p-lavender)", "var(--p-pink)", "var(--p-lime)"];
const CHARACTERS = ["char-lead", "char-fullstack", "char-node"];
const FACTOR_SPOTS = ["ic-team", "ic-scope", "ic-milestones", "ic-security"];
const STEP_COLORS = ["var(--p-lime)", "var(--p-sky)", "var(--p-peach)", "var(--p-lavender)"];

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const stepDelay = (i: number, offset = 0) => ({ transitionDelay: `${(i * 0.2 + offset).toFixed(1)}s` }) as CSSProperties;

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
      {title && <h2 className="big" id={id}>{title}</h2>}
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

export function EngagementSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = by("hero");
  const h = f("hero");
  const heroTitle = h.h1 || content.title;
  const trail = breadcrumbs(path, heroTitle);
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
  // The middle model is the recommended card when there are three.
  const popAt = (i: number) => models.length === 3 && i === 1;
  const guide = f("decision-guide");
  const situations = rows(guide, "situation", ["scenario", "choice", "recommendation"], 3);
  const modelAnchor = (choice: string) => {
    const m = models.find((x) => x.name.toLowerCase() === choice.toLowerCase());
    return m ? `#model-tab-${m.n}` : "#models-comparison";
  };
  const pricing = f("pricing-factors");
  const factors = rows(pricing, "factor", ["title", "body"], 4);
  const process = f("process");
  const steps = rows(process, "step", ["title", "body"], 4);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");
  // A two-word heading takes the gradient accent on its last word; longer headings stay plain.
  const words = heroTitle.split(" ");
  const accent = words.length === 2 ? words.pop() : "";

  return (
    <>
      {hero && (
        <>
          <SceneHero
            labelId="em-h1"
            trail={trail.map((c) => ({ label: c.label, href: go(c.path) }))}
            eyebrow={h.tag_pill || "Engagement models"}
            h1={heroTitle}
            sub={h.subheadline}
            actions={
              <>
                <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="btn btn--grad">
                  {h.cta_primary_label || "Discuss which model fits"} <V2Icon name="arrow" />
                </TrackedLink>
                {h.cta_secondary_label && (
                  <a className="btn btn--ghost" href={go(h.cta_secondary_url || "/how-we-work")}>
                    {h.cta_secondary_label}
                  </a>
                )}
              </>
            }
            scene={<HeroScene kind="plans" title="Engagement models" items={factors.map((r) => r.title).filter(Boolean)} stack={models.map((m) => m.name)} />}
          />
        </>
      )}

      {models.length > 0 && (
        <section id="models-comparison" className="sec">
          <div className="wrap">
            <Head eyebrow={comparison.section_label || undefined} title={comparison.heading || undefined} id="models-h" />
            <div className="seg em-seg" role="tablist" aria-label="Engagement models" data-tabs>
              {models.map((m, i) => (
                <button key={m.n} type="button" role="tab" id={`model-tab-${m.n}`} aria-controls={`model-panel-${m.n}`} aria-selected={i === (models.length === 3 ? 1 : 0)} tabIndex={i === (models.length === 3 ? 1 : 0) ? 0 : -1}>
                  {m.name}
                </button>
              ))}
            </div>
            {models.map((m, i) => {
              const [lead, ...facts] = MATRIX_ROWS.map(([label, key]) => [label, key, m.cells[key]] as const).filter(([, , v]) => v);
              const first = i === (models.length === 3 ? 1 : 0);
              return (
                <div key={m.n} className="em-model" role="tabpanel" id={`model-panel-${m.n}`} aria-labelledby={`model-tab-${m.n}`} hidden={!first}>
                  <div className="em-model__side" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }}>
                    {popAt(i) && m.cells.best_for && <span className="em-model__ribbon">Often the best fit</span>}
                    <V2Img name={PLAN_ICONS[i % PLAN_ICONS.length]} className="em-model__ico" />
                    <h3>{m.name}</h3>
                    {m.tagline && <p>{m.tagline}</p>}
                    <TrackedLink href={contact} event="consultation_click" service="Engagement model" className={popAt(i) ? "btn btn--violet" : "btn btn--black"}>
                      Discuss this model <V2Icon name="arrow" />
                    </TrackedLink>
                  </div>
                  <div className="em-model__body">
                    {lead && (
                      <div className="em-model__lead">
                        <span className="em-model__k">{lead[0]}</span>
                        <Prose value={lead[2]} paths={paths} />
                      </div>
                    )}
                    <div className="em-model__facts">
                      {facts.map(([label, key, value], j) => (
                        <div key={key} className="em-fact" style={{ animationDelay: `${j * 0.06}s` }}>
                          <span className="em-model__k">{label}</span>
                          <Prose value={value} paths={paths} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <details className="em-compare rv">
              <summary>
                Compare all three side by side <V2Icon name="chev" />
              </summary>
              <div className="cmp__wrap">
                <table className="cmp" aria-label={comparison.heading || "Engagement models compared"}>
                  <thead>
                    <tr>
                      <td aria-hidden="true" />
                      {models.map((m, i) => (
                        <th key={m.n} id={`model-${m.n}`} scope="col" className={popAt(i) ? "on" : undefined}>
                          <strong>{m.name}</strong>
                          {m.tagline && <span>{m.tagline}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_ROWS.map(([label, key]) =>
                      models.some((m) => m.cells[key]) ? (
                        <tr key={key}>
                          <th scope="row">{label}</th>
                          {models.map((m, i) => (
                            <td key={m.n} data-label={m.name} className={popAt(i) ? "on" : undefined}>
                              <Prose value={m.cells[key]} paths={paths} />
                            </td>
                          ))}
                        </tr>
                      ) : null,
                    )}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>
      )}

      {situations.length > 0 && (
        <section id="decision-guide" className="sec sec--cloud">
          <div className="wrap">
            <Head eyebrow={guide.section_label || undefined} title={guide.heading || undefined} />
            <div className="accs rv" data-accs>
              <div className="accs__list">
                {situations.map((r, i) => (
                  <div className="accs__item" key={i}>
                    <button className="accs__btn" type="button">
                      {r.scenario || r.choice}
                      <V2Icon name="chev" />
                    </button>
                    <div className="accs__bar">
                      <i />
                    </div>
                    <div className="accs__body">
                      <div>
                        <p>
                          <b>Our recommendation: {r.choice}</b>
                        </p>
                        {r.recommendation && <p>{r.recommendation}</p>}
                        <div className="em-acts">
                          <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="btn btn--violet">
                            Discuss this model
                          </TrackedLink>
                          <a className="tlink" href={modelAnchor(r.choice)}>
                            See it in the comparison <V2Icon name="arrow" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="accs__vis" aria-hidden="true">
                {situations.map((r, i) => (
                  <div key={i} data-vis={i}>
                    <div className="mock">
                      <div className="mock__bar">
                        {r.choice}
                        <small>Recommended</small>
                      </div>
                      <div className="ct-pad">
                        <p className="pp__t">{r.scenario}</p>
                        <span className="flag">
                          <V2Icon name="check" />
                          {r.choice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ct-center rv">
              <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="btn btn--violet">
                Discuss which model fits <V2Icon name="arrow" />
              </TrackedLink>
            </div>
          </div>
        </section>
      )}

      {factors.length > 0 && (
        <section id="pricing-factors" className="feat em-feat">
          <div className="wrap">
            <div className="sec__head rv">
              <V2Img name="ic-cost" className="spot ct-spot-c" />
              {pricing.section_label && <p className="label">{pricing.section_label}</p>}
              {pricing.heading && <h2 className="big">{pricing.heading}</h2>}
              {pricing.intro && <p className="lead">{pricing.intro}</p>}
            </div>
            <div className="em-factors">
              {factors.map((r, i) => (
                <div key={`${i}-${r.title}`} className="em-factor rv" style={{ background: STEP_COLORS[i % STEP_COLORS.length], transitionDelay: `${i * 0.08}s` }}>
                  <V2Img name={FACTOR_SPOTS[i % FACTOR_SPOTS.length]} className="em-factor__ico" />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="process" className="flow" aria-labelledby="process-h">
          <div className="wrap">
            {process.section_label && <p className="label rv">{process.section_label}</p>}
            {process.heading && (
              <h2 className="big rv" id="process-h">
                {process.heading}
              </h2>
            )}
            <div className="em-trig rv">
              <span className="wf__bolt">
                <V2Icon name="bolt" />
              </span>
              <V2Icon name="brief" />
              When your brief arrives
            </div>
            <ol className="wf sc-wf em-wf" data-wf>
              {steps.map((r, i) => (
                <li key={`${i}-${r.title}`} className="sc-step">
                  {i > 0 && <span className="wf__ln" style={stepDelay(i)} />}
                  <div className="wf__step" style={stepDelay(i, 0.1)}>
                    <div>
                      <span className="n" style={{ background: STEP_COLORS[i % STEP_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span>
                        <h3>{r.title}</h3>
                        <p>{r.body}</p>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="sec sec--cloud" aria-labelledby="faq-h">
          {faqPairs.length >= 6 ? (
            <div className="wrap sc-faq">
              <div className="sc-faq__head rv">
                {faq.section_label && <p className="eyebrow">{faq.section_label}</p>}
                {faq.heading && <h2 className="h2" id="faq-h">{faq.heading}</h2>}
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
                {faq.section_label && <p className="eyebrow">{faq.section_label}</p>}
                {faq.heading && <h2 id="faq-h">{faq.heading}</h2>}
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
                <TrackedLink href={contact} event="consultation_click" service="Engagement model" className="btn btn--white">
                  {cta.cta_primary_label || "Discuss which model fits"} <V2Icon name="arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && (
                  <a className="btn btn--ghost-w" href={go(cta.cta_secondary_url || "/why-choose-netofficials")}>
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
