import type { CSSProperties } from "react";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon } from "./site/ui";
import { HowWorkArt } from "./site/art/how-work-art";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// How We Work: the delivery method as a sequence of stages, a communication table, the tools and the commitments.
// Markup follows html-prototype/how-we-work.html (styles: public/assets/nx/pages/how-work.css). Numbers appear only
// on the stages, which are a real sequence (the nx-steps counter).

/** True for content generated from the how-we-work spec; older accepted content keeps the legacy renderer. */
export function isHowWorkContent(content: Content, path: string) {
  return path === "/how-we-work" && !!content.pageSections?.some((s) => s.id === "stages" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const delay = (i: number) => ({ ["--nx-delay" as string]: `${i * 100}ms` }) as CSSProperties;

function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** Plain text becomes a paragraph; rich HTML goes through the sanitiser inside .nx-prose. */
function Prose({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"nx-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
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
  const toolsSec = f("tools");
  const tools = rows(toolsSec, "tool", ["name", "use"], 4);
  const commitSec = f("commitments");
  const commitments = rows(commitSec, "commit", ["title", "body"], 4);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  const navItems = (
    [
      approach.body_paragraph && { id: "approach", label: "Approach" },
      stages.length > 0 && { id: "stages", label: "Stages" },
      cadence.length > 0 && { id: "communication", label: "Communication" },
      tools.length > 0 && { id: "tools", label: "Tools" },
      commitments.length > 0 && { id: "commitments", label: "Commitments" },
      faqPairs.length > 0 && { id: "faq", label: "FAQ" },
    ] as (false | { id: string; label: string })[]
  ).filter((n): n is { id: string; label: string } => !!n);

  return (
    <>
      {hero && (
        <section id="hero" className="page-hero">
          <div className="container">
            <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            <div className="hero__grid">
              <div>
                <span className="tag-pill">{h.tag_pill || "How we work"}</span>
                <h1>{h.h1 || content.title}</h1>
                {h.subheadline && <p className="lead">{h.subheadline}</p>}
                {signals.length > 0 && (
                  <ul className="hw-signals">
                    {signals.map((s) => (
                      <li key={s}>
                        <Icon name="check" size={18} />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="hero__actions">
                  <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="nx-btn nx-btn--primary nx-btn--lg">
                    <span>{h.cta_primary_label || "Start a conversation"}</span>
                    <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                  </TrackedLink>
                  {h.cta_secondary_label && <ArrowLink href={go(h.cta_secondary_url || "/engagement-models")}>{h.cta_secondary_label}</ArrowLink>}
                </div>
              </div>
              <HeroArt asset={hero.asset} fallback={<HowWorkArt />} priority />
            </div>
          </div>
        </section>
      )}

      {navItems.length > 0 && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {approach.body_paragraph && (
        <section id="approach" className="section">
          <div className="container engage">
            <div className="nx-reveal">
              {approach.section_label && <span className="eyebrow">{approach.section_label}</span>}
              <h2 className="h-section">{approach.heading}</h2>
            </div>
            <div className="nx-reveal">
              <Prose value={approach.body_paragraph} paths={paths} className="lead" />
            </div>
          </div>
        </section>
      )}

      {stages.length > 0 && (
        <section id="stages" className="section band">
          <div className="container hw-stages-grid">
            <div className="hw-stages-head nx-reveal">
              {stagesSec.section_label && <span className="eyebrow">{stagesSec.section_label}</span>}
              <h2 className="h-section">{stagesSec.heading}</h2>
              {stagesSec.intro && <p className="lead">{stagesSec.intro}</p>}
            </div>
            <ol className="nx-steps nx-steps--vertical hw-timeline" data-steps>
              {stages.map((r, i) => (
                <li className="nx-step nx-reveal" key={`${i}-${r.title}`} style={delay(i)}>
                  <h3 className="nx-step__title">{r.title}</h3>
                  <p className="nx-step__desc">{r.body}</p>
                  {r.receives && (
                    <>
                      <p className="deliver-label">You receive</p>
                      <p className="hw-receives">{r.receives}</p>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {cadence.length > 0 && (
        <section id="communication" className="section section--white">
          <div className="container">
            <header className="hw-head nx-reveal">
              {comms.section_label && <span className="eyebrow">{comms.section_label}</span>}
              <h2 className="h-section">{comms.heading}</h2>
              {comms.intro && <p className="lead">{comms.intro}</p>}
            </header>
            <div className="hw-table-wrap nx-reveal" data-allow-overflow tabIndex={0} role="region" aria-label={comms.heading || "Communication cadence"}>
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
                  {cadence.map((r, i) => (
                    <tr key={`${i}-${r.name}`}>
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
        <section id="tools" className="section">
          <div className="container">
            <header className="hw-head nx-reveal">
              {toolsSec.section_label && <span className="eyebrow">{toolsSec.section_label}</span>}
              <h2 className="h-section">{toolsSec.heading}</h2>
            </header>
            <dl className="sk-stack hw-tools nx-reveal">
              {tools.map((t, i) => (
                <div className="sk-stack__group" key={`${i}-${t.name}`}>
                  <dt className="sk-stack__name">{t.name}</dt>
                  <dd className="sk-card__text">{t.use}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {commitments.length > 0 && (
        <section id="commitments" className="section section--white">
          <div className="container">
            <header className="hw-head nx-reveal">
              {commitSec.section_label && <span className="eyebrow">{commitSec.section_label}</span>}
              <h2 className="h-section">{commitSec.heading}</h2>
            </header>
            <div className="hw-commits nx-reveal">
              {commitments.map((r, i) => (
                <article className="sk-card" key={`${i}-${r.title}`}>
                  <h3 className="sk-card__title">{r.title}</h3>
                  <p className="sk-card__text">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="section">
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              {faq.section_label && <span className="eyebrow">{faq.section_label}</span>}
              <h2 className="h-section">{faq.heading}</h2>
            </div>
            <div className="nx-reveal">
              <FaqList
                name="hw-faq"
                items={faqPairs.map((k) => ({ q: faq[k], a: <Prose value={faq[k.replace("q", "a")]} paths={paths} className="hw-answer" /> }))}
              />
            </div>
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
              <div className="hw-cta-actions">
                <TrackedLink href={contact} event="consultation_click" service="Delivery process" className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{cta.cta_primary_label || "Start a conversation"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && <ArrowLink href={go(cta.cta_secondary_url || "/portfolio")}>{cta.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
