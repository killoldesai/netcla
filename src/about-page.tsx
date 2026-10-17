import { company, founderPage } from "./company";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, sitePages } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { mediaPath } from "./media-path";
import { TechMark, V2Art, V2Crumbs, V2Icon, V2Img, v2img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The About page is a company profile on the v2 (monday-style) design. Markup follows html-prototype/v2/about.html
// (styles: public/assets/v2/pages/about.css). V3Page supplies the .v2 shell, header, footer and the closing CTA band;
// this renderer returns the sections that go inside <main>. Practice rows and sector cards come from the site
// structure so names and links are never invented.

/** True for About content generated from the company-profile spec; older accepted content keeps the legacy renderer. */
export function isAboutContent(content: Content, path: string) {
  return path === "/about" && !!content.pageSections?.some((s) => s.id === "company-story" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

/** The four core practices, in homepage order, with the services a buyer asks about first. */
export const PRACTICES = [
  { key: "software", spot: "ic-software", name: "Custom software", hub: "/custom-software-development", services: [["/saas-development-services", "SaaS development"], ["/enterprise-software-development", "Enterprise software"], ["/api-development-services", "API development"]] },
  { key: "ai", spot: "ic-ai", name: "AI and automation", hub: "/ai-development-services", services: [["/generative-ai-development", "Generative AI"], ["/ai-chatbot-development", "AI chatbots"], ["/ai-automation-services", "AI automation"]] },
  { key: "cloud", spot: "ic-cloud", name: "Cloud and DevOps", hub: "/cloud-services", services: [["/cloud-migration-services", "Cloud migration"], ["/devops-services", "DevOps and CI/CD"], ["/aws-services", "AWS"]] },
  { key: "mobile", spot: "ic-mobile", name: "Mobile apps", hub: "/mobile-app-development", services: [["/ios-app-development", "iOS apps"], ["/android-app-development", "Android apps"], ["/cross-platform-app-development", "Cross-platform"]] },
] as const;

/** Spot icon for each industry page (prototype icon set). Industries without an icon are shown as text only. */
const INDUSTRY_SPOT: Record<string, string> = {
  "/healthcare-software-development": "ic-healthcare",
  "/fintech-software-development": "ic-fintech",
  "/insurtech-software-development": "ic-insurance",
  "/edtech-software-development": "ic-edtech",
  "/real-estate-software-development": "ic-realestate",
  "/logistics-software-development": "ic-logistics",
  "/retail-software-development": "ic-retail",
  "/travel-software-development": "ic-travel",
  "/legaltech-software-development": "ic-legal",
  "/hrtech-software-development": "ic-hr",
  "/manufacturing-software-development": "ic-manufacturing",
};

/** Spot icons for the first three principles; the fourth uses the line document icon, as the prototype does. */
const PRINCIPLE_SPOT = ["ic-handover", "ic-scope", "ic-milestones", "ic-support"];
/** Colours of the process step numbers, in order (prototype). */
const STEP_TINT = ["var(--p-lime)", "var(--p-sky)", "var(--p-lavender)", "var(--p-peach)"];

/** Supporting practices shown as a single line under the core four. */
export const ALSO = [
  ["/web-development", "Web and eCommerce"],
  ["/digital-marketing-services", "Digital marketing"],
  ["/hire-developers", "Hire developers"],
  ["/industries", "Industries"],
] as const;

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);
const delay = (i: number) => ({ transitionDelay: `${(i % 3) * 0.1}s` });

/** Rows of a numbered field family: prefix_1_a, prefix_1_b ... */
function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** Running text: plain text becomes one paragraph, rich HTML is sanitised and wrapped in the prose wrapper. */
function Body({ value, paths, className }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <p className={className}>{value}</p>;
  return <div className={`prose ${className ?? ""}`.trim()} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header (`.sec__head`): eyebrow (the field's label or the fallback), a heading and a lead, each only when present. */
function Head({ label, fallback, heading, lead }: { label?: string; fallback?: string; heading?: string; lead?: string }) {
  if (!label && !fallback && !heading && !lead) return null;
  return (
    <div className="sec__head rv">
      {(label || fallback) && <span className="eyebrow">{label || fallback}</span>}
      {heading && <h2 className="h2">{heading}</h2>}
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

type OwnAsset = { id: string; name?: string; src?: string; alt: string; width: number; height: number };

/** A section's own generated image, shown only when the content has one, in a pastel frame (white picture backgrounds blend into it). */
function OwnImage({ asset, tint = "lavender" }: { asset?: OwnAsset | null; tint?: string }) {
  if (!asset) return null;
  return (
    <figure className={`about-frame about-frame--${tint} rv`}>
      <img className="media" src={mediaPath(asset)} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" />
    </figure>
  );
}

const TINT_VARS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
/** Spot icons for the trade-off cards (cost, quality, communication). */
const TRADE_SPOT = ["ic-cost", "ic-handover", "ic-timezone"];
/** Spot icons for the glance facts, in order. */
const GLANCE_SPOT = ["ic-timezone", "ic-milestones", "ic-software"];

/** "Four: custom software, AI and automation, cloud and DevOps, and mobile apps", built from the practice names. */
function practiceSummary() {
  const names = ["custom software", "AI and automation", "cloud and DevOps", "mobile apps"];
  return `Four: ${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function AboutSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const live = (url: string) => paths.includes(url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const contact = go("/contact") + "?service=" + encodeURIComponent("Help defining the scope");
  const hero = by("hero");
  const trail = breadcrumbs(path, hero?.fields.h1 || content.title);
  const year = company.foundingYear;

  const story = by("company-story");
  const glance = f("company-glance");
  const practices = f("practice-index");
  const principlesFields = f("principles");
  const principles = rows(principlesFields, "principle", ["title", "body"], 4);
  const timeline = by("delivery-timeline");
  const timelineFields = f("delivery-timeline");
  const steps = rows(timelineFields, "step", ["title", "body"], 5);
  const working = f("working-model");
  const tools = (working.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
  const sectors = sitePages.filter((p) => p.type === "industry" && live(p.path));
  const locations = sitePages.filter((p) => p.type === "location" && live(p.path));
  const sectorFields = f("industries-intro");
  const topicFields = f("india-partner");
  const topics = rows(topicFields, "topic", ["title", "benefit", "watch"], 3);
  const teamFields = f("proof-team");
  const team = rows(teamFields, "leader", ["name", "title", "bio"], 3).filter((r) => r.name);
  const clients = f("proof-clients");
  const awardFields = f("proof-awards");
  const awards = ["award_1", "award_2", "award_3"].map((k) => awardFields[k]?.trim()).filter(Boolean);
  const faq = f("faq");
  const faqPairs = Object.keys(faq).filter((k) => /^q\d+$/.test(k) && faq[k] && faq[k.replace("q", "a")]);
  const cta = f("cta-banner");

  const showPractice = !!by("practice-index");
  const showSectors = !!by("industries-intro") && sectors.length > 0;
  const showClients = !!(clients.client_count?.trim() || clients.client_note?.trim());
  const teamId = team.length ? "proof-team" : "team";
  // Facts with no approved value are left out; the founding year always comes from company.ts (owner-supplied).
  const glanceFacts = [
    ["Base city", glance.base_city],
    ["Delivery window", glance.delivery_window],
    ["Core practices", practiceSummary()],
  ].filter(([, v]) => v?.trim()) as [string, string][];

  return (
    <>
      {hero && (
        <SceneHero
          labelId="about-h1"
          trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))}
          eyebrow={hero.fields.tag_pill}
          h1={hero.fields.h1 || content.title}
          sub={hero.fields.subheadline}
          actions={
            <>
              <TrackedLink href={contact} event="consultation_click" service="About" className="btn btn--grad">
                <span>{hero.fields.cta_primary_label || "Start a conversation"}</span>
                <V2Icon name="arrow" />
              </TrackedLink>
              {hero.fields.cta_secondary_label && (
                <a className="btn btn--ghost" href={go(hero.fields.cta_secondary_url || "/services")}>
                  {hero.fields.cta_secondary_label}
                </a>
              )}
            </>
          }
          scene={<HeroScene kind="crew" title="Netofficials" items={steps.map((r) => r.title).filter(Boolean)} />}
        />
      )}

      {story && (
        <section id="company-story" className="sec about-story-sec">
          <div className="wrap">
            <div className="about-story-panel rv">
              <div className="about-story-panel__copy">
                <span className="eyebrow">{story.fields.section_label || "Who we are"}</span>
                {story.fields.heading && <h2 className="h2">{story.fields.heading}</h2>}
                {story.fields.pull_statement && <p className="lead about-pull">{story.fields.pull_statement}</p>}
              </div>
              <div className="about-story-panel__art" aria-hidden={story.asset ? undefined : true}>
                {story.asset ? (
                  <img src={mediaPath(story.asset)} alt={story.asset.alt} width={story.asset.width} height={story.asset.height} loading="lazy" decoding="async" />
                ) : (
                  <V2Art asset={hero?.asset} fallback="scene-about-team" fallbackAlt="Five illustrated team members working around a shared board" className="media" />
                )}
              </div>
            </div>
            <div className="about-story-text rv">
              <Body value={story.fields.body_paragraph} paths={paths} />
            </div>
          </div>
        </section>
      )}

      {story && (
        <section id="company-glance" className="sec sec--cloud">
          <div className="wrap">
            <Head label={glance.section_label} fallback="Company at a glance" heading={glance.heading} lead={glance.practices_note} />
            <div className="about-bento">
              <div className="about-bento__year rv" aria-label="Founded">
                <span className="about-bento__tag">Founded</span>
                <b data-count={year} data-from="1990">
                  {year}
                </b>
                <p>Founded by {company.founder.name}</p>
                <V2Img name="ic-milestones" className="about-bento__ico" />
              </div>
              <div className="about-bento__practices rv">
                <span className="about-bento__tag">Core practices</span>
                <ul>
                  {PRACTICES.map((pr) => (
                    <li key={pr.key}>
                      <V2Img name={pr.spot} className="spot" />
                      {live(pr.hub) ? <a href={go(pr.hub)}>{pr.name}</a> : <span>{pr.name}</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {glanceFacts
                .filter(([k]) => k !== "Core practices")
                .map(([k, v], i) => (
                  <div className="about-bento__fact rv" key={k} style={{ ...delay(i), background: TINT_VARS[(i + 1) % TINT_VARS.length] }}>
                    <V2Img name={GLANCE_SPOT[i] ?? "ic-scope"} className="spot" />
                    <span className="about-glance__k">{k}</span>
                    <p>{v}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {showPractice && (
        <section id="practice-index" className="sec">
          <div className="wrap">
            <Head label={practices.section_label} fallback="What we do" heading={practices.heading} lead={practices.intro} />
            <div className="catgrid catgrid--2">
              {PRACTICES.map((p, i) => (
                <article className="cat about-practice rv" key={p.key} style={{ ...delay(i), background: TINT_VARS[i % TINT_VARS.length] }}>
                  <V2Img name={p.spot} className="spot" />
                  <h3>{live(p.hub) ? <a href={go(p.hub)}>{p.name}</a> : p.name}</h3>
                  {practices[`practice_${i + 1}_summary`] && <p>{practices[`practice_${i + 1}_summary`]}</p>}
                  <ul className="about-subs">
                    {p.services.filter(([url]) => live(url)).map(([url, label]) => (
                      <li key={url}>
                        <a href={go(url)}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            {ALSO.some(([url]) => live(url)) && (
              <>
                <p className="label about-also-label">Also</p>
                <div className="skills about-also">
                  {ALSO.filter(([url]) => live(url)).map(([url, label]) => (
                    <span key={url}>
                      <a href={go(url)}>{label}</a>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {principles.length > 0 && (
        <section id="principles" className="sec">
          <div className="wrap">
            <Head label={principlesFields.section_label} fallback="How we work" heading={principlesFields.heading} />
            <div className="accs about-accs rv" data-accs>
              <div className="accs__list">
                {principles.map((r) => (
                  <div className="accs__item" key={r.title}>
                    <button className="accs__btn" type="button">
                      {r.title}
                      <V2Icon name="chev" />
                    </button>
                    <div className="accs__bar">
                      <i />
                    </div>
                    <div className="accs__body">
                      <div>{r.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="accs__vis" aria-hidden="true">
                {principles.map((r, i) => (
                  <div key={r.title} data-vis={i} style={{ background: TINT_VARS[i % TINT_VARS.length] }}>
                    <img className="accs__spot" src={v2img(PRINCIPLE_SPOT[i % PRINCIPLE_SPOT.length])} alt="" />
                    <span className="accs__cap">{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="delivery-timeline" className="flow">
          <div className="wrap">
            <p className="label rv">{timelineFields.section_label || "Process"}</p>
            {timelineFields.heading && <h2 className="big rv">{timelineFields.heading}</h2>}
            <ol className="wf sc-wf about-wf" data-wf>
              {steps.map((r, i) => (
                <li key={r.title} className="sc-step">
                  {i > 0 && <span className="wf__ln" style={{ transitionDelay: `${i * 0.1}s` }} />}
                  <div className="wf__step" style={{ transitionDelay: `${(i + 1) * 0.1}s` }}>
                    <div>
                      <span className="n" style={{ background: STEP_TINT[i % STEP_TINT.length] }}>
                        {i + 1}
                      </span>
                      <span>
                        <h3>{r.title}</h3>
                        {r.body && <p>{r.body}</p>}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {by("working-model") && (
        <section id="working-model" className="sec about-where">
          <div className="wrap about-where__top">
            <div className="rv">
              <span className="eyebrow">{working.section_label || "Where we work"}</span>
              {working.heading && <h2 className="h2">{working.heading}</h2>}
            </div>
            <div className="rv">
              <Body value={working.body_paragraph} paths={paths} />
            </div>
          </div>
          <div className="wrap">
            <div className="about-sites">
              <div className="about-site about-site--dark rv">
                <span className="tag">Delivery</span>
                <h3>India</h3>
                <p>Delivery team</p>
              </div>
              {[["United States", "var(--p-sky)"], ["United Kingdom", "var(--p-lime)"], ["Australia", "var(--p-lavender)"]].map(([name, bg], i) => (
                <div className="about-site rv" key={name} style={{ background: bg, transitionDelay: `${(i + 1) * 0.1}s` }}>
                  <span className="tag">Client</span>
                  <h3>{name}</h3>
                  <p>Client team</p>
                </div>
              ))}
            </div>
            {(tools.length > 0 || working.overlap_note) && (
              <div className="about-where__more">
                {tools.length > 0 && (
                  <div className="about-where__card rv">
                    <span className="cat__tag">
                      <i />
                      Tools
                    </span>
                    <ul className="about-tools" aria-label="Working tools">
                      {tools.map((t) => (
                        <li key={t}>
                          <TechMark name={t} size={22} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {working.overlap_note && (
                  <div className="about-where__card rv" style={delay(1)}>
                    <span className="cat__tag">
                      <i />
                      Communication
                    </span>
                    <p>{working.overlap_note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {showSectors && (
        <section id="industries-intro" className="ind" data-scroller>
          <div className="wrap ind__h">
            <div>
              <span className="eyebrow">{sectorFields.section_label || "Industries we know"}</span>
              {sectorFields.heading && <h2>{sectorFields.heading}</h2>}
              {sectorFields.intro && <p className="lead">{sectorFields.intro}</p>}
            </div>
          </div>
          <div className="irow">
            {sectors.map((sec, i) => (
              <a className="icard about-sector" key={sec.path} href={go(sec.path)} style={{ background: TINT_VARS[i % TINT_VARS.length] }}>
                {INDUSTRY_SPOT[sec.path] && <V2Img name={INDUSTRY_SPOT[sec.path]} className="spot" />}
                <h3>{sec.label}</h3>
                <span className="tlink">
                  Explore <V2Icon name="arrow" />
                </span>
              </a>
            ))}
          </div>
          <div className="wrap ind__nav">
            <button type="button" aria-label="Scroll left" data-scroll="-1">
              <V2Icon name="left" />
            </button>
            <button type="button" aria-label="Scroll right" data-scroll="1">
              <V2Icon name="arrow" />
            </button>
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <>
          <section id="india-partner" className="sec about-india">
            <div className="wrap about-india__grid">
              <div className="rv">
                {topicFields.section_label && <span className="eyebrow">{topicFields.section_label}</span>}
                <h2 className="h2">{topicFields.heading || "Why India"}</h2>
                {glance.delivery_window?.trim() && (
                  <div className="about-india__window">
                    <b>Delivery window</b>
                    <span>{glance.delivery_window}</span>
                  </div>
                )}
                <TrackedLink href={contact} event="consultation_click" service="About" className="btn btn--grad">
                  <span>{hero?.fields.cta_primary_label || "Start a conversation"}</span>
                  <V2Icon name="arrow" />
                </TrackedLink>
              </div>
              <div className="about-india__art rv" aria-hidden="true">
                <V2Img name="hero-crew" width={1200} height={900} alt="" />
              </div>
            </div>
          </section>
          <section className="sec sec--cloud" aria-label="What to compare with an India-based partner">
            <div className="wrap">
              <div className="catgrid about-tradeoffs">
                {topics.map((t, i) => (
                  <article className="cat rv" key={t.title} style={delay(i)}>
                    <V2Img name={TRADE_SPOT[i % TRADE_SPOT.length]} className="spot" />
                    <h3>{t.title}</h3>
                    {t.benefit && (
                      <p className="about-benefit">
                        <strong>What you gain</strong>
                        {t.benefit}
                      </p>
                    )}
                    {t.watch && (
                      <p className="about-watch">
                        <strong>What to check</strong>
                        {t.watch}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section id={teamId} className="sec sec--cloud">
        <div className="wrap">
          <Head label={teamFields.section_label} fallback="Team" heading={teamFields.heading} />
          <div className={team.length === 0 ? "about-founder-solo" : "catgrid catgrid--4"}>
            <a className="cat about-founder rv" href={go(founderPage)}>
              <span className="about-avatar" aria-hidden="true">
                {company.founder.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="about-founder__txt">
                <span className="cat__tag">
                  <i />
                  {company.founder.jobTitle}
                </span>
                <h3>{company.founder.name}</h3>
                <p>{company.founder.summary}</p>
                <small className="about-founder__since">Founded Netofficials in {year}</small>
                <span className="more">
                  Read the founder profile <V2Icon name="arrow" />
                </span>
              </span>
            </a>
            {team.map((r, i) => (
              <article className="cat rv" key={r.name} style={delay(i + 1)}>
                <h3>{r.name}</h3>
                {r.title && (
                  <span className="cat__tag">
                    <i />
                    {r.title}
                  </span>
                )}
                {r.bio && <p>{r.bio}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {showClients && (
        <section id="proof-clients" className="sec">
          <div className="wrap">
            <Head label={clients.section_label} fallback="Clients and work" heading={clients.heading} lead={clients.client_note} />
            {clients.client_count && <p className="about-proof-n">{clients.client_count}</p>}
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section id="proof-awards" className="sec sec--cloud">
          <div className="wrap">
            <Head label={awardFields.section_label} fallback="Recognition" heading={awardFields.heading} />
            <ul className="catgrid about-awards">
              {awards.map((a, i) => (
                <li className="cat rv" key={a} style={delay(i)}>
                  <p>{a}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="sec">
          {faqPairs.length >= 6 ? (
            <div className="wrap sc-faq">
              <div className="sc-faq__head rv">
                <span className="eyebrow">{faq.section_label || "Questions"}</span>
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
                        <Body value={faq[k.replace("q", "a")]} paths={paths} />
                      </details>
                    ))}
                  </div>
                ))}
              </div>
              <p className="sc-faq__ask rv">
                Not listed here?{" "}
                <a className="btn btn--ghost" href={contact}>
                  Ask us directly <V2Icon name="arrow" />
                </a>
              </p>
            </div>
          ) : (
            <div className="wrap faq">
              <div className="faq__aside rv">
                <span className="eyebrow">{faq.section_label || "Questions"}</span>
                {faq.heading && <h2>{faq.heading}</h2>}
                <a className="btn btn--ghost" href={contact}>
                  Ask us directly <V2Icon name="arrow" />
                </a>
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
                    <Body value={faq[k.replace("q", "a")]} paths={paths} />
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {locations.length > 0 && (
        <section id="locations" className="sec sec--cloud about-locations" aria-labelledby="about-loc-h">
          <div className="wrap">
            <div className="sec__head sec__head--left rv">
              <span className="eyebrow">Where we work</span>
              <h2 className="h2" id="about-loc-h">
                Software development by location
              </h2>
            </div>
            <ul className="about-pills rv">
              {locations.map((p) => (
                <li key={p.path}>
                  <a href={go(p.path)}>
                    <V2Icon name="pin" />
                    {p.label}
                    <V2Icon name="arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
                <TrackedLink href={contact} event="consultation_click" service="About" className="btn btn--white">
                  <span>{cta.cta_primary_label || "Start a conversation"}</span>
                  <V2Icon name="arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && (
                  <a className="btn btn--ghost-w" href={go(cta.cta_secondary_url || "/engagement-models")}>
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
