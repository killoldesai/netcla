import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { mediaPath } from "./media-path";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// How We Work: the delivery method as a sequence of stages, a communication table, the tools and the commitments.
// Own layout and stylesheet (/assets/how-work.css). Numbers appear only on the stages, which are a real sequence.

/** True for content generated from the how-we-work spec; older accepted content keeps the legacy renderer. */
export function isHowWorkContent(content: Content, path: string) {
  return path === "/how-we-work" && !!content.pageSections?.some((s) => s.id === "stages" && !s.omitted);
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
  return <div className={"hw-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

export function HowWorkSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = by("hero");
  const h = f("hero");
  const signals = [h.signal_1, h.signal_2, h.signal_3].map((t) => t?.trim()).filter(Boolean);
  const trail = breadcrumbs(path, h.h1 || content.title);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Delivery process");
  const approach = f("approach");
  const stagesSec = f("stages");
  const stages = rows(stagesSec, "stage", ["title", "body", "receives"], 5);
  const comms = f("communication");
  const cadence = rows(comms, "cadence", ["name", "when", "who", "purpose"], 4);
  const tools = rows(f("tools"), "tool", ["name", "use"], 4);
  const commitments = rows(f("commitments"), "commit", ["title", "body"], 4);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  return (
    <>
      {hero && (
        <section id="hero" className="hw-hero">
          <div className="hw-wrap">
            <nav className="hw-crumbs" aria-label="Breadcrumb">
              <ol>
                {trail.map((c, i) =>
                  i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
                )}
              </ol>
            </nav>
            <div className={"hw-hero-grid" + (hero.asset ? " has-art" : "")}>
              <div>
                <span className="hw-tag">{h.tag_pill || "How we work"}</span>
                <h1 className="hw-h1">{h.h1 || content.title}</h1>
                <p className="hw-lead">{h.subheadline}</p>
                {signals.length > 0 && (
                  <ul className="hw-signals">
                    {signals.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                )}
                <div className="hw-actions">
                  <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="hw-btn">
                    {h.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  {h.cta_secondary_label && <a className="hw-link" href={go(h.cta_secondary_url || "/engagement-models")}>{h.cta_secondary_label} →</a>}
                </div>
              </div>
              {hero.asset && (
                <figure className="hw-art">
                  <img src={mediaPath(hero.asset)} alt={hero.asset.alt} width={hero.asset.width} height={hero.asset.height} fetchPriority="high" />
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {approach.body_paragraph && (
        <section id="approach" className="hw-section">
          <div className="hw-wrap hw-split">
            <header>
              {approach.section_label && <p className="hw-eyebrow">{approach.section_label}</p>}
              <h2 className="hw-h2">{approach.heading}</h2>
            </header>
            <Prose value={approach.body_paragraph} paths={paths} className="hw-body" />
          </div>
        </section>
      )}

      {stages.length > 0 && (
        <section id="stages" className="hw-section is-tint">
          <div className="hw-wrap">
            <header className="hw-head">
              {stagesSec.section_label && <p className="hw-eyebrow">{stagesSec.section_label}</p>}
              <h2 className="hw-h2">{stagesSec.heading}</h2>
              {stagesSec.intro && <p className="hw-intro">{stagesSec.intro}</p>}
            </header>
            <ol className="hw-stages">
              {stages.map((r, i) => (
                <li key={r.title}>
                  <span className="hw-stage-n">{i + 1}</span>
                  <div className="hw-stage-body">
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </div>
                  {r.receives && (
                    <p className="hw-stage-receives">
                      <strong>You receive</strong>
                      {r.receives}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {cadence.length > 0 && (
        <section id="communication" className="hw-section">
          <div className="hw-wrap">
            <header className="hw-head">
              {comms.section_label && <p className="hw-eyebrow">{comms.section_label}</p>}
              <h2 className="hw-h2">{comms.heading}</h2>
              {comms.intro && <p className="hw-intro">{comms.intro}</p>}
            </header>
            <div className="hw-table-wrap">
              <table className="hw-cadence">
                <thead>
                  <tr>
                    <th scope="col">Meeting or update</th>
                    <th scope="col">When</th>
                    <th scope="col">Who attends</th>
                    <th scope="col">What it settles</th>
                  </tr>
                </thead>
                <tbody>
                  {cadence.map((r) => (
                    <tr key={r.name}>
                      <th scope="row">{r.name}</th>
                      <td data-label="When">{r.when}</td>
                      <td data-label="Who attends">{r.who}</td>
                      <td data-label="What it settles">{r.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section id="tools" className="hw-section is-tint">
          <div className="hw-wrap hw-split">
            <header>
              {f("tools").section_label && <p className="hw-eyebrow">{f("tools").section_label}</p>}
              <h2 className="hw-h2">{f("tools").heading}</h2>
            </header>
            <dl className="hw-tools">
              {tools.map((t) => (
                <div key={t.name}>
                  <dt>{t.name}</dt>
                  <dd>{t.use}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {commitments.length > 0 && (
        <section id="commitments" className="hw-section">
          <div className="hw-wrap hw-split">
            <header>
              {f("commitments").section_label && <p className="hw-eyebrow">{f("commitments").section_label}</p>}
              <h2 className="hw-h2">{f("commitments").heading}</h2>
            </header>
            <ul className="hw-commits">
              {commitments.map((r) => (
                <li key={r.title}>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="hw-section is-tint">
          <div className="hw-wrap hw-split">
            <header>
              {faq.section_label && <p className="hw-eyebrow">{faq.section_label}</p>}
              <h2 className="hw-h2">{faq.heading}</h2>
            </header>
            <div className="hw-accordion">
              {faqPairs.map((k, i) => (
                <details key={k} name="hw-faq" open={i === 0}>
                  <summary>
                    {faq[k]}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <Prose value={faq[k.replace("q", "a")]} paths={paths} className="hw-answer" />
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="hw-cta">
          <div className="hw-wrap hw-cta-grid">
            <div>
              <h2>{cta.heading}</h2>
              <p>{cta.subheadline}</p>
            </div>
            <div className="hw-actions">
              <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="hw-btn is-lime">
                {cta.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {cta.cta_secondary_label && <a className="hw-link is-light" href={go(cta.cta_secondary_url || "/portfolio")}>{cta.cta_secondary_label} →</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
