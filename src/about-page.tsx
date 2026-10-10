import { SiteIcon, legacyIcon, iconFor } from "./icon-set";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, sitePages } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { mediaPath } from "./media-path";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The About page is a company profile, not a service page: its own layout language (a numbered margin
// column beside each block), its own components and its own stylesheet (/assets/about.css).
// Practice rows and sector chips come from the site structure so names and links are never invented.

/** True for About content generated from the company-profile spec; older accepted content keeps the legacy renderer. */
export function isAboutContent(content: Content, path: string) {
  return path === "/about" && !!content.pageSections?.some((s) => s.id === "company-story" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** The four core practices, in homepage order, with the services a buyer asks about first. */
export const PRACTICES = [
  { key: "software", icon: "code", name: "Custom software", hub: "/custom-software-development", services: [["/saas-development-services", "SaaS development"], ["/enterprise-software-development", "Enterprise software"], ["/api-development-services", "API development"]] },
  { key: "ai", icon: "ai", name: "AI and automation", hub: "/ai-development-services", services: [["/generative-ai-development", "Generative AI"], ["/ai-chatbot-development", "AI chatbots"], ["/ai-automation-services", "AI automation"]] },
  { key: "cloud", icon: "cloud", name: "Cloud and DevOps", hub: "/cloud-services", services: [["/cloud-migration-services", "Cloud migration"], ["/devops-services", "DevOps and CI/CD"], ["/aws-services", "AWS"]] },
  { key: "mobile", icon: "mobile", name: "Mobile apps", hub: "/mobile-app-development", services: [["/ios-app-development", "iOS apps"], ["/android-app-development", "Android apps"], ["/cross-platform-app-development", "Cross-platform"]] },
] as const;

/** One icon per principle, in the order the spec asks for them: ownership, scoping, review, documentation. */
const PRINCIPLE_ICONS = ["lock", "chart", "shield", "document"];

/** Supporting practices shown as a single line under the core four. */
export const ALSO = [
  ["/web-development", "Web and eCommerce"],
  ["/digital-marketing-services", "Digital marketing"],
  ["/hire-developers", "Hire developers"],
  ["/industries", "Industries"],
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

function Prose({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={"ab-prose " + (className ?? "")} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

export function AboutSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const live = (url: string) => paths.includes(url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const contact = go("/contact") + "?service=" + encodeURIComponent("Help defining the scope");
  const hero = by("hero");
  const trail = breadcrumbs(path, hero?.fields.h1 || content.title);

  const Label = ({ text }: { text?: string }) => <p className="ab-label">{text}</p>;
  const Icon = ({ name, text }: { name?: string; text?: string }) => (
    <span className="ab-icon" aria-hidden="true">
      <SiteIcon name={legacyIcon[name ?? ""] ?? (name || iconFor(text ?? ""))} className="ab-icon-svg" />
    </span>
  );

  const story = by("company-story");
  const glance = f("company-glance");
  const glanceRows = [
    ["Founded", glance.founded_year],
    ["Based in", glance.base_city],
    ["Delivery window", glance.delivery_window],
    ["Core practices", String(PRACTICES.length)],
  ].filter(([, v]) => v?.trim());
  const practices = f("practice-index");
  const principles = rows(f("principles"), "principle", ["title", "body"], 4);
  const steps = rows(f("delivery-timeline"), "step", ["title", "body"], 5);
  const working = f("working-model");
  const tools = (working.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
  const sectors = sitePages.filter((p) => p.type === "industry" && live(p.path));
  const topics = rows(f("india-partner"), "topic", ["title", "benefit", "watch"], 3);
  const team = rows(f("proof-team"), "leader", ["name", "title", "bio"], 3).filter((r) => r.name);
  const clients = f("proof-clients");
  const awards = ["award_1", "award_2", "award_3"].map((k) => f("proof-awards")[k]?.trim()).filter(Boolean);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  return (
    <>
      {hero && (
        <section id="hero" className="ab-hero">
          <div className="ab-wrap">
            <nav className="ab-crumbs" aria-label="Breadcrumb">
              <ol>
                {trail.map((c, i) =>
                  i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
                )}
              </ol>
            </nav>
            <div className="ab-hero-grid">
              <div className="ab-hero-head">
                <span className="ab-tag">{hero.fields.tag_pill || "About Netofficials"}</span>
                <h1 className="ab-h1">{hero.fields.h1 || content.title}</h1>
              </div>
              <div className="ab-hero-lede">
                <p>{hero.fields.subheadline}</p>
                <div className="ab-actions">
                  <TrackedLink href={contact} event="consultation_click" service="About" className="ab-btn">
                    {hero.fields.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  {hero.fields.cta_secondary_label && <a className="ab-link" href={go(hero.fields.cta_secondary_url || "/services")}>{hero.fields.cta_secondary_label} →</a>}
                </div>
              </div>
            </div>
            {hero.asset && (
              <figure className="ab-banner">
                <img src={mediaPath(hero.asset)} alt={hero.asset.alt} width={hero.asset.width} height={hero.asset.height} fetchPriority="high" />
              </figure>
            )}
          </div>
        </section>
      )}

      {story && (
        <section id="company-story" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={story.fields.section_label || "Who we are"} />
            <div className="ab-main">
              <h2 className="ab-h2">{story.fields.heading}</h2>
              {story.fields.pull_statement && <p className="ab-pull">{story.fields.pull_statement}</p>}
              <div className="ab-story-cols">
                <Prose value={story.fields.body_paragraph} paths={paths} className="ab-body" />
                <aside className="ab-glance" aria-label={glance.heading || "At a glance"}>
                  <h3>{glance.heading || "At a glance"}</h3>
                  <dl>
                    {glanceRows.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {glance.practices_note && <p className="ab-glance-note">{glance.practices_note}</p>}
                  {story.asset && (
                    <figure className="ab-figure">
                      <img src={mediaPath(story.asset)} alt={story.asset.alt} width={story.asset.width} height={story.asset.height} loading="lazy" />
                    </figure>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </section>
      )}

      {by("practice-index") && (
        <section id="practice-index" className="ab-section is-paper">
          <div className="ab-wrap ab-grid">
            <Label text={practices.section_label || "What we do"} />
            <div className="ab-main">
              <h2 className="ab-h2">{practices.heading}</h2>
              <p className="ab-intro">{practices.intro}</p>
              <ol className="ab-practices">
                {PRACTICES.map((p, i) => (
                  <li key={p.key}>
                    <div className="ab-practice-body">
                      <h3>
                        <Icon name={p.icon} />
                        {live(p.hub) ? <a href={go(p.hub)}>{p.name}</a> : p.name}
                      </h3>
                      <p>{practices[`practice_${i + 1}_summary`]}</p>
                      <ul>
                        {p.services.filter(([url]) => live(url)).map(([url, label]) => (
                          <li key={url}><a href={go(url)}>{label}</a></li>
                        ))}
                      </ul>
                    </div>
                    {live(p.hub) && (
                      <a className="ab-practice-go" href={go(p.hub)} aria-label={`Explore ${p.name}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    )}
                  </li>
                ))}
              </ol>
              <p className="ab-also">
                <span>Also</span>
                {ALSO.filter(([url]) => live(url)).map(([url, label]) => (
                  <a key={url} href={go(url)}>{label}</a>
                ))}
              </p>
            </div>
          </div>
        </section>
      )}

      {principles.length > 0 && (
        <section id="principles" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={f("principles").section_label || "How we work"} />
            <div className="ab-main">
              <h2 className="ab-h2">{f("principles").heading}</h2>
              <ul className="ab-principles">
                {principles.map((r, i) => (
                  <li key={r.title}>
                    <Icon name={PRINCIPLE_ICONS[i]} />
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="delivery-timeline" className="ab-section is-paper">
          <div className="ab-wrap ab-grid">
            <Label text={f("delivery-timeline").section_label || "How a project runs"} />
            <div className="ab-main ab-timeline-wrap">
              <div>
                <h2 className="ab-h2">{f("delivery-timeline").heading}</h2>
                <ol className="ab-timeline">
                  {steps.map((r, i) => (
                    <li key={r.title}>
                      <span className="ab-dot" aria-hidden="true">{i + 1}</span>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </li>
                  ))}
                </ol>
              </div>
              {by("delivery-timeline")?.asset && (
                <figure className="ab-figure ab-sticky">
                  <img src={mediaPath(by("delivery-timeline")!.asset!)} alt={by("delivery-timeline")!.asset!.alt} width={by("delivery-timeline")!.asset!.width} height={by("delivery-timeline")!.asset!.height} loading="lazy" />
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {by("working-model") && (
        <section id="working-model" className="ab-section is-dark">
          <div className="ab-wrap ab-grid">
            <Label text={working.section_label || "Where we work"} />
            <div className="ab-main ab-working">
              <div>
                <h2 className="ab-h2">{working.heading}</h2>
                <Prose value={working.body_paragraph} paths={paths} className="ab-body" />
                {tools.length > 0 && (
                  <ul className="ab-tools" aria-label="Working tools">
                    {tools.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                )}
                {working.overlap_note && <p className="ab-overlap">{working.overlap_note}</p>}
              </div>
              {by("working-model")?.asset && (
                <figure className="ab-figure is-card">
                  <img src={mediaPath(by("working-model")!.asset!)} alt={by("working-model")!.asset!.alt} width={by("working-model")!.asset!.width} height={by("working-model")!.asset!.height} loading="lazy" />
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {by("industries-intro") && sectors.length > 0 && (
        <section id="industries-intro" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={f("industries-intro").section_label || "Industries we know"} />
            <div className="ab-main">
              <h2 className="ab-h2">{f("industries-intro").heading}</h2>
              <p className="ab-intro">{f("industries-intro").intro}</p>
              <ul className="ab-sectors">
                {sectors.map((s) => (
                  <li key={s.path}>
                    <a href={go(s.path)}>
                      {s.label}
                      <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section id="india-partner" className="ab-section is-paper">
          <div className="ab-wrap ab-grid">
            <Label text={f("india-partner").section_label || "Why India"} />
            <div className="ab-main">
              <h2 className="ab-h2">{f("india-partner").heading}</h2>
              <div className="ab-tradeoffs">
                {topics.map((t) => (
                  <article key={t.title}>
                    <h3>{t.title}</h3>
                    <p className="ab-benefit"><strong>What you gain</strong>{t.benefit}</p>
                    <p className="ab-watch"><strong>What to check</strong>{t.watch}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section id="proof-team" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={f("proof-team").section_label || "Team"} />
            <div className="ab-main">
              <h2 className="ab-h2">{f("proof-team").heading}</h2>
              <ul className="ab-team">
                {team.map((r) => (
                  <li key={r.name}>
                    <h3>{r.name}</h3>
                    <p className="ab-role">{r.title}</p>
                    <p>{r.bio}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {(clients.client_count?.trim() || clients.client_note?.trim()) && (
        <section id="proof-clients" className="ab-section is-paper">
          <div className="ab-wrap ab-grid">
            <Label text={clients.section_label || "Clients and work"} />
            <div className="ab-main ab-proof">
              {clients.client_count && <p className="ab-proof-n">{clients.client_count}</p>}
              <div>
                <h2 className="ab-h2">{clients.heading}</h2>
                <p className="ab-intro">{clients.client_note}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section id="proof-awards" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={f("proof-awards").section_label || "Recognition"} />
            <div className="ab-main">
              <h2 className="ab-h2">{f("proof-awards").heading}</h2>
              <ul className="ab-awards">{awards.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="ab-section">
          <div className="ab-wrap ab-grid">
            <Label text={faq.section_label || "Questions"} />
            <div className="ab-main ab-faq">
              <h2 className="ab-h2">{faq.heading}</h2>
              <div className="ab-accordion">
                {faqPairs.map((k, i) => (
                  <details key={k} name="ab-faq" open={i === 0}>
                    <summary>
                      {faq[k]}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <Prose value={faq[k.replace("q", "a")]} paths={paths} className="ab-body" />
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="ab-cta">
          <div className="ab-wrap ab-cta-grid">
            <div>
              <h2>{cta.heading}</h2>
              <p>{cta.subheadline}</p>
            </div>
            <div className="ab-actions">
              <TrackedLink href={contact} event="consultation_click" service="About" className="ab-btn is-ink">
                {cta.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {cta.cta_secondary_label && <a className="ab-link is-ink" href={go(cta.cta_secondary_url || "/engagement-models")}>{cta.cta_secondary_label} →</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
