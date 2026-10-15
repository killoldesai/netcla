import type { CSSProperties } from "react";
import { company, founderPage } from "./company";
import { TrackedLink } from "./v3-interactions";
import { breadcrumbs, sitePages } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { ArrowLink, Breadcrumbs, FaqList, HeroArt, Icon, ProductIcon } from "./site/ui";
import { AboutArt } from "./site/art/about-art";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The About page is a company profile, not a service page. Markup follows html-prototype/about.html (styles in
// public/assets/nx/pages/about.css, shared patterns in public/assets/nx/site.css). Practice rows and sector chips
// come from the site structure so names and links are never invented.

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

/** Product icon for each practice card (prototype icon set). */
const PRACTICE_ICON: Record<string, string> = { software: "code-brackets", ai: "brain-circuit", cloud: "cloud-upload", mobile: "mobile-device" };

/** One product icon per principle, in the order the spec asks for them: ownership, scoping, review, documentation. */
const PRINCIPLE_ICONS = ["shield-check", "chart-bar", "users-group", "document-text"];

/** Supporting practices shown as a single line under the core four. */
export const ALSO = [
  ["/web-development", "Web and eCommerce"],
  ["/digital-marketing-services", "Digital marketing"],
  ["/hire-developers", "Hire developers"],
  ["/industries", "Industries"],
] as const;

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);

/** Rows of a numbered field family: prefix_1_a, prefix_1_b ... */
function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** Staggered reveal delay for card N in a row of two or three, as the prototype does. */
const delay = (i: number) => ({ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }) as CSSProperties;

/** Running text: plain text becomes one paragraph, rich HTML is sanitised and wrapped in nx-prose. */
function Body({ value, paths, className = "" }: { value?: string; paths: string[]; className?: string }) {
  if (!value?.trim()) return null;
  if (!hasHtml(value)) return <div className={`about-body ${className}`.trim()}><p>{value}</p></div>;
  return <div className={`about-body nx-prose ${className}`.trim()} dangerouslySetInnerHTML={{ __html: clean(value, paths) }} />;
}

/** Section header: eyebrow and h2, each only when the content has it (the fallback eyebrow is the section's label). */
function Head({ label, heading, lead, fallback }: { label?: string; heading?: string; lead?: string; fallback?: string }) {
  if (!label && !fallback && !heading && !lead) return null;
  return (
    <div className="section-head nx-reveal">
      <div>
        {(label || fallback) && <span className="eyebrow">{label || fallback}</span>}
        {heading && <h2 className="h-section">{heading}</h2>}
      </div>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

export function AboutSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const live = (url: string) => paths.includes(url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const contact = go("/contact") + "?service=" + encodeURIComponent("Help defining the scope");
  const hero = by("hero");
  const trail = breadcrumbs(path, hero?.fields.h1 || content.title);

  const story = by("company-story");
  const glance = f("company-glance");
  const glanceRows = [
    ["Founded", glance.founded_year],
    ["Based in", glance.base_city],
    ["Delivery window", glance.delivery_window],
    ["Core practices", String(PRACTICES.length)],
  ].filter(([, v]) => v?.trim());
  const practices = f("practice-index");
  const principlesFields = f("principles");
  const principles = rows(principlesFields, "principle", ["title", "body"], 4);
  const timeline = by("delivery-timeline");
  const timelineFields = f("delivery-timeline");
  const steps = rows(timelineFields, "step", ["title", "body"], 5);
  const working = f("working-model");
  const tools = (working.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
  const sectors = sitePages.filter((p) => p.type === "industry" && live(p.path));
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

  // On-page navigation lists only the sections this page renders.
  const nav: [string, string][] = [];
  if (story) nav.push(["company-story", "Who we are"], ["company-glance", "At a glance"]);
  if (showPractice) nav.push(["practice-index", "What we do"]);
  if (principles.length) nav.push(["principles", "How we work"]);
  if (steps.length) nav.push(["delivery-timeline", "Process"]);
  if (by("working-model")) nav.push(["working-model", "Where we work"]);
  if (showSectors) nav.push(["industries-intro", "Industries"]);
  if (topics.length) nav.push(["india-partner", "Why India"]);
  nav.push([teamId, "Team"]);
  if (faqPairs.length) nav.push(["faq", "FAQ"]);

  return (
    <>
      {hero && (
        <section id="hero" className="page-hero about-hero">
          <div className="container">
            <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
            <div className="about-hero__text">
              <span className="tag-pill">{hero.fields.tag_pill || "About Netofficials"}</span>
              <h1>{hero.fields.h1 || content.title}</h1>
              {hero.fields.subheadline && <p className="lead">{hero.fields.subheadline}</p>}
              <div className="hero__actions">
                <TrackedLink href={contact} event="consultation_click" service="About" className="nx-btn nx-btn--primary nx-btn--lg">
                  <span>{hero.fields.cta_primary_label || "Start a conversation"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {hero.fields.cta_secondary_label && <ArrowLink href={go(hero.fields.cta_secondary_url || "/services")}>{hero.fields.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
            <HeroArt asset={hero.asset} fallback={<AboutArt />} priority className="about-art" />
          </div>
        </section>
      )}

      {nav.length > 0 && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {nav.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {story && (
        <section id="company-story" className="section">
          <div className="container about-story">
            <div className="nx-reveal">
              <span className="eyebrow">{story.fields.section_label || "Who we are"}</span>
              {story.fields.heading && <h2 className="h-section">{story.fields.heading}</h2>}
              {story.fields.pull_statement && <p className="about-pull">{story.fields.pull_statement}</p>}
            </div>
            <div className="nx-reveal">
              <Body value={story.fields.body_paragraph} paths={paths} />
              <HeroArt asset={story.asset} className="about-figure" />
            </div>
          </div>
        </section>
      )}

      {story && (
        <section id="company-glance" className="section section--white">
          <div className="container overview">
            <div className="nx-reveal">
              {(glance.section_label || glance.heading) && <span className="eyebrow">{glance.section_label || "Company at a glance"}</span>}
              {glance.heading && <h2 className="h-section">{glance.heading}</h2>}
            </div>
            <aside className="facts nx-reveal" aria-labelledby="about-glance-title">
              <p className="facts__title" id="about-glance-title">At a glance</p>
              <dl className="about-glance">
                {glanceRows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {glance.practices_note && <p className="about-note">{glance.practices_note}</p>}
            </aside>
          </div>
        </section>
      )}

      {showPractice && (
        <section id="practice-index" className="section">
          <div className="container">
            <Head label={practices.section_label} fallback="What we do" heading={practices.heading} lead={practices.intro} />
            <div className="sk-cards about-grid2">
              {PRACTICES.map((p, i) => (
                <article className="sk-card nx-reveal" key={p.key} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={PRACTICE_ICON[p.key]} size={26} />
                  </span>
                  <h3 className="sk-card__title">{live(p.hub) ? <a href={go(p.hub)}>{p.name}</a> : p.name}</h3>
                  {practices[`practice_${i + 1}_summary`] && <p className="sk-card__text">{practices[`practice_${i + 1}_summary`]}</p>}
                  <ul className="svc__links">
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
              <p className="about-also">
                <span>Also</span>
                {ALSO.filter(([url]) => live(url)).map(([url, label]) => (
                  <a key={url} href={go(url)}>
                    {label}
                  </a>
                ))}
              </p>
            )}
          </div>
        </section>
      )}

      {principles.length > 0 && (
        <section id="principles" className="section section--white">
          <div className="container">
            <Head label={principlesFields.section_label} fallback="How we work" heading={principlesFields.heading} />
            <div className="sk-cards about-grid2">
              {principles.map((r, i) => (
                <article className="sk-card nx-reveal" key={r.title} style={delay(i)}>
                  <span className="sk-card__icon" aria-hidden="true">
                    <ProductIcon name={PRINCIPLE_ICONS[i] ?? "layers-stack"} size={26} />
                  </span>
                  <h3 className="sk-card__title">{r.title}</h3>
                  {r.body && <p className="sk-card__text">{r.body}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="delivery-timeline" className="section band">
          <div className="container">
            <Head label={timelineFields.section_label} fallback="How a project runs" heading={timelineFields.heading} />
            <ol className={"nx-steps" + (steps.length === 5 ? " nx-steps--five" : "")} data-steps>
              {steps.map((r, i) => (
                <li className="nx-step nx-reveal" key={r.title} style={delay(i)}>
                  <h3 className="nx-step__title">{r.title}</h3>
                  {r.body && <p className="nx-step__desc">{r.body}</p>}
                </li>
              ))}
            </ol>
            <HeroArt asset={timeline?.asset} className="about-figure" />
          </div>
        </section>
      )}

      {by("working-model") && (
        <section id="working-model" className="section">
          <div className="container overview">
            <div className="nx-reveal">
              <span className="eyebrow">{working.section_label || "Where we work"}</span>
              {working.heading && <h2 className="h-section">{working.heading}</h2>}
              <div className="quick about-quick">
                <Body value={working.body_paragraph} paths={paths} />
                {tools.length > 0 && (
                  <>
                    <p className="quick__label">Tools</p>
                    <ul className="about-tools" aria-label="Working tools">
                      {tools.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </>
                )}
                {working.overlap_note && <p className="about-overlap">{working.overlap_note}</p>}
              </div>
            </div>
            <HeroArt asset={by("working-model")?.asset} className="about-figure" />
          </div>
        </section>
      )}

      {showSectors && (
        <section id="industries-intro" className="section section--white">
          <div className="container">
            <Head label={sectorFields.section_label} fallback="Industries we know" heading={sectorFields.heading} lead={sectorFields.intro} />
            <ul className="svc__links about-sectors">
              {sectors.map((s) => (
                <li key={s.path}>
                  <a href={go(s.path)}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {topics.length > 0 && (
        <section id="india-partner" className="section">
          <div className="container">
            <Head label={topicFields.section_label} fallback="Why India" heading={topicFields.heading} />
            <div className="about-tradeoffs">
              {topics.map((t, i) => (
                <article className="nx-reveal" key={t.title} style={delay(i)}>
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
      )}

      <section id={teamId} className="section section--white">
        <div className="container">
          <Head label={teamFields.section_label} fallback="Team" heading={teamFields.heading} />
          <div className="about-team">
            <article className="sk-card nx-reveal">
              <span className="sk-card__icon" aria-hidden="true">
                <Icon name="user" size={26} className="" />
              </span>
              <h3 className="sk-card__title">
                <a href={go(founderPage)}>{company.founder.name}</a>
              </h3>
              <p className="sk-card__label">{company.founder.jobTitle}</p>
              <p className="sk-card__text">{company.founder.summary}</p>
              <ArrowLink href={go(founderPage)}>Read the founder profile</ArrowLink>
            </article>
            {team.map((r, i) => (
              <article className="sk-card nx-reveal" key={r.name} style={delay(i + 1)}>
                <h3 className="sk-card__title">{r.name}</h3>
                {r.title && <p className="sk-card__label">{r.title}</p>}
                {r.bio && <p className="sk-card__text">{r.bio}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {showClients && (
        <section id="proof-clients" className="section">
          <div className="container">
            <Head label={clients.section_label} fallback="Clients and work" heading={clients.heading} lead={clients.client_note} />
            {clients.client_count && <p className="about-proof-n">{clients.client_count}</p>}
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section id="proof-awards" className="section section--white">
          <div className="container">
            <Head label={awardFields.section_label} fallback="Recognition" heading={awardFields.heading} />
            <ul className="about-awards">
              {awards.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {faqPairs.length > 0 && (
        <section id="faq" className="section">
          <div className="container faq">
            <div className="faq__aside nx-reveal">
              <span className="eyebrow">{faq.section_label || "Questions"}</span>
              {faq.heading && <h2 className="h-section">{faq.heading}</h2>}
              <ArrowLink href={contact}>Ask us directly</ArrowLink>
            </div>
            <div className="nx-reveal">
              <FaqList
                name="about-faq"
                items={faqPairs.map((k) => ({ q: faq[k], a: <Body value={faq[k.replace("q", "a")]} paths={paths} /> }))}
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
              <div className="about-cta-actions">
                <TrackedLink href={contact} event="consultation_click" service="About" className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{cta.cta_primary_label || "Start a conversation"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && <ArrowLink href={go(cta.cta_secondary_url || "/engagement-models")}>{cta.cta_secondary_label}</ArrowLink>}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
