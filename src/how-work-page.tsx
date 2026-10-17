import { type CSSProperties } from "react";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { TechMark, V2Icon, V2Img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// How We Work: the delivery method as a sequence of stages (with a detail tab per stage), the communication
// cadence as stacked cards, the tools and the commitments. Markup follows html-prototype/v2/how-we-work.html;
// styles are public/assets/v2/pages/how-we-work.css. Numbers appear only on the stages, which are a real sequence.

/** True for content generated from the how-we-work spec; older accepted content keeps the legacy renderer. */
export function isHowWorkContent(content: Content, path: string) {
  return path === "/how-we-work" && !!content.pageSections?.some((s) => s.id === "stages" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const stepDelay = (i: number, offset = 0) => ({ transitionDelay: `${(i * 0.2 + offset).toFixed(1)}s` }) as CSSProperties;
const STEP_COLORS = ["var(--p-lime)", "var(--p-sky)", "var(--p-lavender)", "var(--p-peach)", "var(--p-peri)"];
const CADENCE_ICONS = ["calendar", "chat", "clock", "users"] as const;
const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
const COMMIT_ICONS = ["ic-scope", "ic-milestones", "ic-timezone", "ic-handover"];

function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** Plain text becomes a paragraph; rich HTML goes through the sanitiser inside the .prose wrapper. */
function Prose({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={`prose ${className ?? ""}`.trim()} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

export function HowWorkSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = by("hero");
  const h = f("hero");
  const signals = [h.signal_1, h.signal_2, h.signal_3].map((t) => t?.trim()).filter(Boolean);
  const heroTitle = h.h1 || content.title;
  const trail = breadcrumbs(path, heroTitle);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Delivery process");
  const approach = f("approach");
  const stagesSec = f("stages");
  const stages = rows(stagesSec, "stage", ["title", "body", "receives"], 5);
  const comms = f("communication");
  const cadence = rows(comms, "cadence", ["name", "when", "who", "purpose"], 4);
  const toolsSec = f("tools");
  const tools = rows(toolsSec, "tool", ["name", "use"], 4);
  const commitSec = f("commitments");
  const commitments = rows(commitSec, "commit", ["title", "body"], 4);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  return (
    <>
      {hero && (
        <>
          <SceneHero
            labelId="hw-h1"
            trail={trail.map((c) => ({ label: c.label, href: go(c.path) }))}
            eyebrow={h.tag_pill}
            h1={heroTitle}
            sub={h.subheadline}
            signals={signals}
            actions={
              <>
                <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="btn btn--grad">
                  {h.cta_primary_label || "Start a conversation"} <V2Icon name="arrow" />
                </TrackedLink>
                {h.cta_secondary_label && (
                  <a className="btn btn--ghost" href={go(h.cta_secondary_url || "/engagement-models")}>
                    {h.cta_secondary_label}
                  </a>
                )}
              </>
            }
            scene={<HeroScene kind="stages" title="Delivery" items={[]} stack={stages.map((r) => r.title).filter(Boolean)} />}
          />
        </>
      )}

      {approach.body_paragraph && (
        <section id="approach" className="sec hw-approach" aria-labelledby={approach.heading ? "approach-t" : undefined}>
          <div className="wrap">
            <div className="hw-approach__top rv">
              <div>
                {approach.section_label && <span className="eyebrow">{approach.section_label}</span>}
                {approach.heading && (
                  <h2 className="h2" id="approach-t">
                    {approach.heading}
                  </h2>
                )}
              </div>
              <div className="hw-approach__art" aria-hidden="true">
                <V2Img name="scene-models" alt="" />
              </div>
            </div>
            <div className="kit-text rv">
              <Prose value={approach.body_paragraph} paths={paths} />
            </div>
          </div>
        </section>
      )}

      {stages.length > 0 && (
        <section id="stages" className="flow hw-stages" aria-labelledby="stages-t">
          <div className="wrap">
            {stagesSec.section_label && <p className="label rv">{stagesSec.section_label}</p>}
            {stagesSec.heading && (
              <h2 className="big rv" id="stages-t">
                {stagesSec.heading}
              </h2>
            )}
            {stagesSec.intro && <p className="lead hw-stages__lead rv">{stagesSec.intro}</p>}
            <div className="em-trig rv">
              <span className="wf__bolt">
                <V2Icon name="bolt" />
              </span>
              <V2Icon name="brief" />
              When your brief arrives
            </div>
            <ol className="wf sc-wf hw-wf" data-wf>
              {stages.map((r, i) => (
                <li key={`${i}-${r.title}`} className="sc-step">
                  {i > 0 && <span className="wf__ln" style={stepDelay(i)} />}
                  <div className="wf__step" style={stepDelay(i, 0.1)}>
                    <div>
                      <span className="n" style={{ background: STEP_COLORS[i % STEP_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <div>
                        <h3>{r.title}</h3>
                        {r.body && <p>{r.body}</p>}
                        {r.receives && (
                          <p className="hw-receives">
                            <span className="hw-recv">You receive</span> {r.receives}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {cadence.length > 0 && (
        <section id="communication" className="sec sec--cloud hw-comm" aria-labelledby={comms.heading ? "comm-t" : undefined}>
          <div className="wrap">
            {(comms.section_label || comms.heading || comms.intro) && (
              <div className="sec__head rv">
                {comms.section_label && <p className="eyebrow">{comms.section_label}</p>}
                {comms.heading && (
                  <h2 className="h2" id="comm-t">
                    {comms.heading}
                  </h2>
                )}
                {comms.intro && <p className="lead">{comms.intro}</p>}
              </div>
            )}
            <div className="kit-cards kit-cards--2">
              {cadence.map((r, i) => (
                <article className="kit-card kit-card--plain hw-cad rv" key={`${i}-${r.name}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className="hw-cad__ico" style={{ background: TINTS[i % TINTS.length] }}>
                    <V2Icon name={CADENCE_ICONS[i % CADENCE_ICONS.length]} />
                  </span>
                  <h3>{r.name}</h3>
                  {r.purpose && <p>{r.purpose}</p>}
                  <ul className="hw-cad__meta">
                    {r.when && (
                      <li>
                        <V2Icon name="clock" />
                        {r.when}
                      </li>
                    )}
                    {r.who && (
                      <li>
                        <V2Icon name="users" />
                        {r.who}
                      </li>
                    )}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section id="tools" className="sec hw-tools" aria-labelledby={toolsSec.heading ? "tools-t" : undefined}>
          <div className="wrap">
            {toolsSec.heading && (
              <div className="sec__head rv">
                <h2 className="h2" id="tools-t">
                  {toolsSec.heading}
                </h2>
              </div>
            )}
            <div className="kit-cards kit-cards--4">
              {tools.map((t, i) => (
                <article className="kit-card kit-card--plain hw-tool rv" key={`${i}-${t.name}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className="hw-tool__logo">
                    <TechMark name={t.name} size={40} />
                  </span>
                  <h3>{t.name}</h3>
                  {t.use && <p>{t.use}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {commitments.length > 0 && (
        <section id="commitments" className="sec sec--cloud hw-commit" aria-labelledby={commitSec.heading ? "commit-t" : undefined}>
          <div className="wrap">
            {(commitSec.section_label || commitSec.heading) && (
              <div className="sec__head rv">
                {commitSec.section_label && <p className="eyebrow">{commitSec.section_label}</p>}
                {commitSec.heading && (
                  <h2 className="h2" id="commit-t">
                    {commitSec.heading}
                  </h2>
                )}
              </div>
            )}
            <div className="kit-cards kit-cards--2">
              {commitments.map((r, i) => (
                <article className="kit-card rv" key={`${i}-${r.title}`} style={{ background: TINTS[i % TINTS.length], transitionDelay: `${i * 0.08}s` }}>
                  <V2Img name={COMMIT_ICONS[i % COMMIT_ICONS.length]} className="kit-card__ico" />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="sec hw-faq" aria-labelledby={faq.heading ? "faq-t" : undefined}>
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
                        <Prose value={faq[k.replace("q", "a")]} paths={paths} className="hw-answer" />
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
                    <Prose value={faq[k.replace("q", "a")]} paths={paths} className="hw-answer" />
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
                <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="btn btn--white">
                  {cta.cta_primary_label || "Start a conversation"} <V2Icon name="arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && (
                  <a className="btn btn--ghost-w" href={go(cta.cta_secondary_url || "/case-studies")}>
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
