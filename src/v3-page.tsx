import { siteUrl } from "./site-url";
import { mediaPath } from "./media-path";
import { ServiceTechnologyStack } from "./service-technology-stack";
import { iconFor } from "./icon-set";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";
import { StripeNavigation, StripeFooter } from "./stripe-home-chrome";
import { LeadForm } from "./render";
import { hubFor, hubChildren, serviceHubs } from "./service-hubs";
import { FAQList, Comparison, VerifiedEvidence, GenProse, GenIcon } from "./v3-sections";
import { sanitizeRichHTML } from "./rich-text";
import { breadcrumbs, pillarFor, sitePage } from "./site-structure";
import { pageGraph } from "./structured-data";
import { SkeletonSections, isSkeletonContent } from "./v3-skeleton";
import { AboutSections, isAboutContent } from "./about-page";
import { ContactSections, isContactContent } from "./contact-page";
import { EngagementSections, isEngagementContent } from "./engagement-page";
import { HowWorkSections, isHowWorkContent } from "./how-work-page";
import { WhyChooseSections, isWhyChooseContent } from "./why-choose-page";
import { BlogIndexSections, isBlogIndexContent } from "./blog-index-page";
import type { BlogPost } from "./blog-types";
import { RelatedGuides } from "./related-guides";
import { RelatedPages } from "./related-pages";
import { SiteStyles, IconSprite, Button, ArrowLink, Breadcrumbs, HeroArt, Icon as NxIcon } from "./site/ui";
import { SiteFooter } from "./site/footer";
import { SiteBehaviors } from "./site/behaviors";
import { PORTED, type Renderer } from "./site/ported";
import { ServicesDirectorySections, isServicesDirectoryPath } from "./services-directory-v3";
import {
  NewsletterForm,
  VacancyDirectory,
  TrackedLink,
} from "./v3-interactions";

type Props = {
  content: Content;
  path: string;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  vacancies?: {
    id: string;
    slug: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
  }[];
  newsletterEnabled?: boolean;
  /** Guides for the /blog index (the route supplies them; the owner preview includes drafts). */
  posts?: BlogPost[];
  /** Extra content placed before the closing CTA band, or at the end (e.g. the 404 sitemap). */
  afterContent?: React.ReactNode;
  published?: string | Date | null;
  modified?: string | Date | null;
};

/** Body copy may be limited HTML (generated or edited); plain text renders as one paragraph. */
export function Prose({ value, paths, className = "v3-intro" }: { value: string; paths: string[]; className?: string }) {
  if (!/<[a-z][\s\S]*>/i.test(value)) return <p className={className}>{value}</p>;
  return (
    <div
      className={"v3-prose " + className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(value, false, paths.length ? paths : undefined) }}
    />
  );
}
export function sectionGroups(fields: Record<string, string>) {
  const map = new Map<string, Record<string, string>>();
  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(/^([a-z]+)_?(\d+)_(.+)$/);
    if (match && !["stat", "field", "client"].includes(match[1])) {
      const id = match[1] + match[2];
      map.set(id, { ...(map.get(id) ?? {}), [match[3]]: value });
    }
  }
  for (const [key, value] of Object.entries(fields)) {
    const scenario = key.match(/^scenario_(\d+)$/);
    if (scenario && value)
      map.set("scenario" + scenario[1], {
        title: value,
        body: fields["recommendation_" + scenario[1]],
      });
  }
  if (fields.art_title)
    map.set("featuredArticle", {
      title: fields.art_title,
      body: fields.art_excerpt,
      url: fields.art_url,
    });
  return [...map.values()].filter(
    (g) =>
      g.title ||
      g.name ||
      g.heading ||
      g.question ||
      g.label ||
      g.attribute ||
      g.city,
  );
}
export function V3Page({
  content,
  path,
  paths,
  preview = false,
  linkMap = {},
  vacancies = [],
  newsletterEnabled = false,
  posts = [],
  afterContent,
  published,
  modified,
}: Props) {
  const destination = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const service = hubFor(path)?.service ?? (path === "/404" ? "Help defining the scope" : content.title);
  const parentHub = !hubFor(path)
    ? serviceHubs.find((hub) =>
        hubChildren(hub).some((child) => child.url === path),
      )
    : undefined;
  const serviceComposition =
    Boolean(hubFor(path) || parentHub) ||
    path === "/services" ||
    path === "/engagement-models" ||
    path === "/about" ||
    path === "/how-we-work" ||
    Boolean(
      content.pageSections?.some(
        (s) =>
          s.id === "what-we-deliver" ||
          s.id === "services-grid" ||
          s.id === "service-overview",
      ),
    );
  const servicePage = path !== "/" || serviceComposition;
  const contactPath = destination("/contact");
  const contact =
    contactPath +
    (contactPath.includes("?") ? "&" : "?") +
    "service=" +
    encodeURIComponent(service);
  const sections = content.pageSections ?? [];
  // Pages generated from the canonical skeleton share one designed layout (see v3-skeleton.tsx).
  const skeleton = isSkeletonContent(content, path);
  // The About page is a company profile with its own layout (see about-page.tsx).
  const aboutPage = isAboutContent(content, path);
  // The Contact page is a form-first conversion page with its own layout (see contact-page.tsx).
  const contactPage = isContactContent(content, path);
  // Engagement Models is a comparison-and-decision page with its own layout (see engagement-page.tsx).
  const engagePage = isEngagementContent(content, path);
  // How We Work explains the delivery method with its own layout (see how-work-page.tsx).
  const howPage = isHowWorkContent(content, path);
  // Why Choose Netofficials is an honest case with its own layout (see why-choose-page.tsx).
  const whyPage = isWhyChooseContent(content, path);
  // The guides index lists the guides from the database with its own layout (see blog-index-page.tsx).
  const blogPage = isBlogIndexContent(content, path);
  // Renderers move to the redesigned shell one at a time (src/site/ported.ts).
  const renderer: Renderer = skeleton ? (path.startsWith("/blog/") ? "guide" : "skeleton") : aboutPage ? "about" : contactPage ? "contact" : engagePage ? "engagement" : howPage ? "how-work" : whyPage ? "why-choose" : blogPage ? "blog-index" : isServicesDirectoryPath(path) && PORTED.services !== null ? "services" : "generic";
  const nxCss = PORTED[renderer];
  const nx = nxCss !== null;
  // A low-friction enquiry prompt after the second content section, on pages
  // that sell a service (not the contact page itself).
  const visible = sections.filter((s) => !s.omitted && s.id !== "hero");
  const midCtaAfter =
    servicePage && !sections.some((s) => s.id === "contact-form") && visible.length >= 4 ? visible[1]?.id : undefined;
  const ctaService = pillarFor(path)?.service ?? service;
  const ctaHref =
    contactPath + (contactPath.includes("?") ? "&" : "?") + "service=" + encodeURIComponent(ctaService);
  // Every hero carries the same eyebrow → H1 → intro → CTA rhythm, even when
  // the generated content omitted the tag pill or CTA labels.
  const heroEyebrow =
    pillarFor(path)?.label ??
    ({ company: "Company", guide: "Guide", pillar: "Services" } as Record<string, string>)[sitePage(path)?.type ?? ""] ??
    "Netofficials";
  const trail = breadcrumbs(path, path === "/404" ? "Page not found" : sections.find((s) => s.id === "hero")?.fields.h1 || content.title);
  const faqItems = sections
    .filter((s) => !s.omitted && /faq/.test(s.id))
    .flatMap((s) =>
      Object.keys(s.fields)
        .filter((k) => /^(?:q\d+|cat_\d+_q\d+)$/.test(k))
        .map((k) => ({
          "@type": "Question",
          name: s.fields[k],
          acceptedAnswer: {
            "@type": "Answer",
            text: s.fields[k.replace(/q(\d+)$/, "a$1")],
          },
        })),
    )
    .filter((q) => q.name && q.acceptedAnswer.text);
  const fallbackFaq =
    !faqItems.length && hubFor(path) && !sections.some((s) => /faq/.test(s.id));
  const fallbackFaqFields: Record<string, string> = {};
  if (fallbackFaq)
    for (const [i, [question, answer]] of hubFor(path)!.faqs.entries()) {
      fallbackFaqFields[`q${i + 1}`] = question;
      fallbackFaqFields[`a${i + 1}`] = answer;
      faqItems.push({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      });
    }
  // Generic sections. The frame (section, container, heading row) is shared; the body follows the section's layout
  // (see content.pageBlueprint). Every field read here is shown or omitted when empty; nothing is invented.
  const legalPage = /^\/(?:privacy-policy|terms)(?:\/|$)/.test(path);
  const legalDocIds = legalPage
    ? sections.filter((s) => !s.omitted && (/^editorial-/.test(s.id) || /faq/.test(s.id))).map((s) => s.id)
    : [];
  type Facts = {
    f: Record<string, string>;
    cards: Record<string, string>[];
    heading: string;
    main?: string;
    stats: string[];
    scalar: [string, string][];
    /** Array-valued copy (industry lists), never printed as text. */
    list: unknown[];
    /** Category names from the filter bar (category_N). */
    categories: string[];
  };
  // Stored copy that is a stringified object ("[object Object],...") is garbage: it is omitted rather than printed.
  const copy = (v: unknown) =>
    typeof v === "string" && v.trim() && !/\[object Object\]/.test(v) ? v : undefined;
  function facts(s: PageSection): Facts {
    const f = s.fields;
    const cards = sectionGroups(f);
    if (f.tech_names) cards.push({ name: "Technologies", items: f.tech_names });
    const priorities = [
      "/custom-software-development",
      "/mobile-app-development",
      "/ai-development-services",
      "/cloud-services",
    ];
    if ((path === "/" || path === "/services") && /services/.test(s.id))
      cards.sort(
        (a, b) =>
          (priorities.includes(a.url) ? priorities.indexOf(a.url) : 100) -
          (priorities.includes(b.url) ? priorities.indexOf(b.url) : 100),
      );
    const raw =
      f.heading ||
      f.mission_statement ||
      f.form_heading ||
      (path === "/how-we-work" && s.id === "faq" ? "Questions about working together." : "");
    return {
      f,
      cards,
      heading: path === "/react-development-services" ? raw.replace(/React and Flutter App/gi, "React Web Application") : raw,
      main:
        copy(f.body_paragraph) || copy(f.subheadline) || copy(f.mission_body) || copy(f.culture_paragraph) || copy(f.form_subheadline),
      stats: Object.keys(f).filter((k) => /^stat_\d+_number$/.test(k) && f[k]),
      scalar: Object.entries(f).filter(([k, v]) => v && /^(outcome|adv|culture|value|signal|trust)_\d+$/.test(k)),
      list: ([f.industries, f.body_paragraph, f.subheadline] as unknown[]).find((v) => Array.isArray(v)) as unknown[] ?? [],
      categories: Object.keys(f)
        .filter((k) => /^category_\d+$/.test(k) && f[k])
        .map((k) => f[k]),
    };
  }
  function isHeroSection(s: PageSection) {
    const layout = content.pageBlueprint?.[s.id];
    return s.id === "hero" || layout?.recommended_component === "HeroSplit" || layout?.recommended_component === "HeroFull";
  }
  function hasContentOf(s: PageSection) {
    const fx = facts(s);
    const { f, cards, heading, main, stats, scalar } = fx;
    // Proof blocks lose their items when evidence is unverified; a lone heading left behind reads as a broken section.
    const proofSection = /^(stats|testimonial|proof|case-stud|client|trust|logo)/.test(s.id);
    return Boolean(
      isHeroSection(s) ||
        (heading && !proofSection) ||
        main ||
        cards.length ||
        stats.length ||
        scalar.length ||
        fx.list.length ||
        fx.categories.length ||
        Object.keys(f).some((k) => /^(?:q\d+|cat_\d+)$/.test(k) && f[k]),
    );
  }
  /** Legal documents render as one contents rail plus numbered parts, drawn by the first part that has content. */
  const legalParts = legalDocIds.length
    ? sections.filter((s) => !s.omitted && legalDocIds.includes(s.id) && content.pageBlueprint?.[s.id] && hasContentOf(s))
    : [];
  const partTitle = (p: PageSection) => facts(p).heading || facts(p).f.section_label || "";
  const isShortText = (value?: string) => Boolean(value && !/<[a-z][\s\S]*>/i.test(value) && value.length <= 280);

  function Extras({ s, fx }: { s: PageSection; fx: Facts }) {
    const { f, stats, scalar, list, categories } = fx;
    const industries: unknown = f.industries;
    const isLink = (v: unknown) => typeof v === "string" && /^(\/|https?:)/.test(v);
    const chips = list.flatMap((item) => {
      if (typeof item === "string") return copy(item) ? [{ label: item.trim(), href: undefined as string | undefined }] : [];
      if (!item || typeof item !== "object") return [];
      const o = item as Record<string, unknown>;
      const label = ([o.name, o.label, o.title, o.industry].find((v) => copy(v)) as string | undefined) ??
        (Object.values(o).find((v) => copy(v) && !isLink(v)) as string | undefined);
      const url = [o.url, o.href].find((v) => isLink(v)) as string | undefined;
      return label ? [{ label: label.trim(), href: url ? destination(url) : undefined }] : [];
    });
    return (
      <>
        {stats.length > 0 && (
          <dl className="gen-stats">
            {stats.map((k) => (
              <div key={k}>
                <dt>{f[k.replace("number", "label")]}</dt>
                <dd>{f[k]}</dd>
              </div>
            ))}
          </dl>
        )}
        {scalar.length > 0 && (
          <ul className="gen-checks">
            {scalar.map(([key, value]) => (
              <li key={key}>
                {["why-netofficials", "service-overview"].includes(s.id) ? (
                  <span className="gen-check gen-check--icon">
                    <GenIcon name={iconFor(value)} />
                  </span>
                ) : (
                  <span className="gen-check" aria-hidden="true">
                    <NxIcon name="check" size={16} className="" />
                  </span>
                )}
                <span>{value}</span>
              </li>
            ))}
          </ul>
        )}
        {categories.length > 0 && (
          <div className="gen-categories">
            {f.filter_label && <p className="gen-meta">{f.filter_label}</p>}
            <ul className="svc__links gen-industries">
              {categories.map((c, i) => (
                <li key={i}>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {chips.length > 0 && (
          <ul className="svc__links gen-industries">
            {chips.map((c, i) => (
              <li key={i}>{c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}</li>
            ))}
          </ul>
        )}
        {copy(industries) && (
          <GenProse className="lead" value={copy(industries)} paths={paths} />
        )}
        {f.privacy_note && <p className="gen-note">{f.privacy_note}</p>}
        <VerifiedEvidence fields={f} />
      </>
    );
  }

  /** Clause list used by editorial parts: each card is one clause with a title and text. */
  function Clauses({ cards }: { cards: Record<string, string>[] }) {
    if (!cards.length) return null;
    return (
      <div className="gen-clauses">
        {cards.map((g, i) => {
          const text = g.body || g.bio || g.description || g.reason || g.usecase || g.excerpt || g.outcome;
          return (
            <article key={i} className="gen-clause">
              <h3>{g.title || g.name || g.heading || g.label}</h3>
              {text && <p>{text}</p>}
            </article>
          );
        })}
      </div>
    );
  }

  /** The section's own content: forms, listings, comparison, cards, steps. */
  function Body({ s, fx }: { s: PageSection; fx: Facts }) {
    const { f, cards } = fx;
    const layout = content.pageBlueprint?.[s.id];
    if (s.id === "contact-form")
      return (
        <div className="gen-form">
          <LeadForm preview={preview}>
            <label>
              Name
              <input name="name" required maxLength={120} autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Service
              <input name="service" required data-service-context="true" defaultValue="" />
            </label>
            <label>
              Project goal
              <textarea name="goal" required minLength={10} maxLength={5000} />
            </label>
            <label>
              Country <span>(optional)</span>
              <input name="country" autoComplete="country-name" />
            </label>
            <label>
              Timeline <span>(optional)</span>
              <input name="timeline" />
            </label>
            <button className="nx-btn nx-btn--primary" type="submit">
              <span>{f.submit_label || "Send project enquiry"}</span>
            </button>
          </LeadForm>
        </div>
      );
    if (s.id === "newsletter-cta")
      return (
        <div className="gen-newsletter">
          <NewsletterForm enabled={newsletterEnabled && !preview} />
        </div>
      );
    if (s.id === "open-roles") return <VacancyDirectory vacancies={vacancies} preview={preview} />;
    if (/comparison/.test(s.id) && cards.some((g) => g.attribute)) return <Comparison groups={cards} />;
    if (/related-hubs|related-services/.test(s.id))
      return (
        <div className="sk-cards gen-paired">
          {cards.map((g, i) => (
            <article key={g.url || i} className="sk-card nx-reveal">
              <span className="sk-card__icon" aria-hidden="true">
                <GenIcon name={iconFor(g.name || g.title || "", g.reason || g.body || "")} />
              </span>
              <h3 className="sk-card__title">{g.name || g.title}</h3>
              <p className="sk-card__text">{g.body || g.description || g.reason || g.outcome}</p>
              {g.url && (
                <TrackedLink href={destination(g.url)} event="hub_click" service={service} className="nx-arrowlink service-paired-link">
                  <span>Explore {g.name || g.title}</span>
                  <NxIcon name="arrow-right" size={18} />
                </TrackedLink>
              )}
            </article>
          ))}
        </div>
      );
    if (path === "/engagement-models" && s.id === "models-comparison")
      return (
        <div className="sk-cards engagement-models">
          {cards.map((g, i) => (
            <article className="sk-card nx-reveal engagement-model" key={g.name || i}>
              <span className="sk-card__icon" aria-hidden="true">
                <GenIcon name={iconFor(g.name || g.title || "", g.body || "")} />
              </span>
              <h3 className="sk-card__title">{g.name || g.title}</h3>
              {g.best_for && (
                <p className="sk-card__text">
                  <strong>Best suited to:</strong> {g.best_for}
                </p>
              )}
              <p className="sk-card__text">{g.body || g.description}</p>
              {(g.timeline || g.pricing) && (
                <dl className="gen-meta-list">
                  {g.timeline && (
                    <div>
                      <dt>Delivery approach</dt>
                      <dd>{g.timeline}</dd>
                    </div>
                  )}
                  {g.pricing && (
                    <div>
                      <dt>Commercial model</dt>
                      <dd>{g.pricing}</dd>
                    </div>
                  )}
                </dl>
              )}
            </article>
          ))}
        </div>
      );
    if (/technolog|tech-stack|tools-stack/.test(s.id) || layout?.recommended_component === "TechnologyGrid")
      return (
        <div className="gen-stack">
          <ServiceTechnologyStack
            groups={cards.map((g) => ({
              name: g.name || g.title || "Technology",
              items: (g.items || g.body || "")
                .split(/[,|;]/)
                .map((name) => name.trim())
                .filter(Boolean),
            }))}
          />
        </div>
      );
    const process = /process/.test(s.id);
    const editorial = /^editorial-/.test(s.id);
    return (
      <>
        {cards.length > 0 && editorial && <Clauses cards={cards} />}
        {cards.length > 0 && !editorial && process && (
          <ol className="nx-steps">
            {cards.map((g, i) => {
              const text = g.body || g.bio || g.description || g.reason || g.usecase || g.excerpt || g.outcome;
              return (
                <li key={i} className="nx-step nx-reveal">
                  <h3 className="nx-step__title">{g.title || g.name || g.heading || g.label}</h3>
                  {text && <p className="nx-step__desc">{text}</p>}
                  {g.timeline && <p className="gen-meta">Timeline: {g.timeline}</p>}
                  {g.pricing && <p className="gen-meta">Pricing approach: {g.pricing}</p>}
                </li>
              );
            })}
          </ol>
        )}
        {cards.length > 0 && !editorial && !process && (
          <div className="sk-cards">
            {cards.map((g, i) => {
              const text = g.body || g.bio || g.description || g.reason || g.usecase || g.excerpt || g.outcome;
              return (
                <article key={i} className="sk-card nx-reveal">
                  <span className="sk-card__icon" aria-hidden="true">
                    <GenIcon
                      name={iconFor(
                        g.title || g.name || g.heading || g.label || "",
                        [g.body, g.usecase, g.description, g.problem].filter(Boolean).join(" "),
                      )}
                    />
                  </span>
                  <h3 className="sk-card__title">{g.bio ? g.name : g.title || g.name || g.heading || g.label}</h3>
                  {g.bio && <p className="gen-meta">{g.title}</p>}
                  {g.problem && <p className="sk-card__text">{g.problem}</p>}
                  {text && <p className="sk-card__text">{text}</p>}
                  {g.timeline && (
                    <p className="gen-meta">
                      <strong>Timeline:</strong> {g.timeline}
                    </p>
                  )}
                  {g.pricing && (
                    <p className="gen-meta">
                      <strong>Pricing approach:</strong> {g.pricing}
                    </p>
                  )}
                  {g.expertise && <p className="gen-meta">{g.expertise}</p>}
                  {g.industry && <p className="gen-meta">{g.industry}</p>}
                  {g.tech && <p className="gen-meta">{g.tech}</p>}
                  {g.tag && <p className="gen-meta">{g.tag}</p>}
                  {g.best_for && <p className="gen-meta">Best for: {g.best_for}</p>}
                  {g.url && (
                    <TrackedLink href={destination(g.url)} event="hub_click" service={service} className="nx-arrowlink">
                      <span>{g.cta || "Explore " + (g.title || g.name || g.label)}</span>
                      <NxIcon name="arrow-right" size={18} />
                    </TrackedLink>
                  )}
                </article>
              );
            })}
          </div>
        )}
        {s.id === "services-grid" && hubFor(path) && (
          <div className="more gen-directory">
            <p className="more__head">All {hubFor(path)?.name.toLowerCase()} services</p>
            {hubChildren(hubFor(path)!).map((child) => (
              <TrackedLink event="hub_click" service={service} href={destination(child.url)} key={child.url}>
                <strong>{child.title.replace(/\s*[|–].*$/g, "")}</strong>
                <NxIcon name="arrow-right" size={18} />
              </TrackedLink>
            ))}
          </div>
        )}
      </>
    );
  }

  function Section({ section: s }: { section: PageSection }) {
    if (s.omitted) return null;
    const layout = content.pageBlueprint?.[s.id];
    if (!layout) return null;
    if (legalPage && legalDocIds.includes(s.id) && s.id !== legalParts[0]?.id) return null;
    if (!hasContentOf(s) && !["open-roles", "newsletter-cta"].includes(s.id)) return null;
    const fx = facts(s);
    const { f, heading, main } = fx;
    const hero = isHeroSection(s);

    if (hero)
      return (
        <section id={s.id} className="page-hero">
          <div className="container">
            {trail.length > 1 && (
              <Breadcrumbs
                items={trail.map((crumb, i) => ({
                  label: crumb.label,
                  href: i === trail.length - 1 ? undefined : destination(crumb.path),
                }))}
              />
            )}
            <div className={"hero__grid" + (s.asset ? "" : " gen-hero--text")}>
              <div>
                {(f.tag_pill || heroEyebrow) && <span className="tag-pill">{f.tag_pill || heroEyebrow}</span>}
                <h1>{f.h1 || content.title}</h1>
                <GenProse className="lead" value={main} paths={paths} />
                <div className="hero__actions">
                  <TrackedLink href={contact} event="consultation_click" service={service} className="nx-btn nx-btn--primary nx-btn--lg">
                    <span>{f.cta_primary_label || "Talk to an engineer"}</span>
                    <NxIcon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                  </TrackedLink>
                  {f.cta_secondary_label && f.cta_secondary_url && (
                    <ArrowLink href={destination(f.cta_secondary_url)}>{f.cta_secondary_label}</ArrowLink>
                  )}
                </div>
                <Extras s={s} fx={fx} />
              </div>
              <HeroArt asset={s.asset} priority />
            </div>
          </div>
        </section>
      );

    if (legalPage && legalDocIds.includes(s.id))
      return (
        <section className="section gen-legal-section">
          <div className="container">
            <div className="gen-legal">
              <nav className="gen-toc" aria-label="On this page">
                <p className="gen-toc__title">On this page</p>
                <ol className="gen-toc__list">
                  {legalParts.map((p) => (
                    <li key={p.id}>
                      <a href={"#" + p.id}>{partTitle(p) || p.id}</a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="gen-doc">
                {legalParts.map((p, i) => {
                  const px = facts(p);
                  return (
                    <section key={p.id} id={p.id} className="gen-part">
                      <h2>
                        <span className="gen-part__num" aria-hidden="true">
                          {i + 1}
                        </span>
                        {partTitle(p) || p.id}
                      </h2>
                      <GenProse className="gen-part__body" value={px.main} paths={paths} />
                      <Extras s={p} fx={px} />
                      {/faq/.test(p.id) ? <FAQList fields={px.f} /> : <Body s={p} fx={px} />}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      );

    if (s.id === "cta-banner")
      return (
        <section id={s.id} className="section band">
          <div className="container">
            <div className="gen-cta nx-reveal">
              <div>
                {f.section_label && <span className="eyebrow">{f.section_label}</span>}
                {heading && <h2 className="h-section">{heading}</h2>}
                <GenProse className="lead" value={main} paths={paths} />
              </div>
              <div className="gen-cta__actions">
                <TrackedLink href={contact} event="consultation_click" service={service} className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{f.cta_primary_label || "Discuss your project"}</span>
                  <NxIcon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                <ArrowLink href={destination(f.cta_secondary_url || "/how-we-work")}>
                  {f.cta_secondary_label || "How we work"}
                </ArrowLink>
              </div>
            </div>
            <Extras s={s} fx={fx} />
          </div>
        </section>
      );

    const dark = /^(process|engagement-models)$/.test(s.id);
    const soft = /^(services-grid|service-overview|technology-stack|who-its-for|related-hubs|related-services|faq|faqs)$/.test(s.id);
    const frame = "section" + (dark ? " band" : soft ? " section--white" : "");
    const shortMain = isShortText(main);
    const eyebrow = f.section_label ? <span className="eyebrow">{f.section_label}</span> : null;
    const title = heading ? <h2 className="h-section">{heading}</h2> : null;

    if (/faq/.test(s.id))
      return (
        <section id={s.id} className={frame}>
          <div className="container">
            <div className={"faq gen-faq" + (eyebrow || title || main ? "" : " gen-faq--solo")}>
              {(eyebrow || title || main) && (
                <div className="faq__aside nx-reveal">
                  {eyebrow}
                  {title}
                  <GenProse className="lead" value={main} paths={paths} />
                </div>
              )}
              <div className="gen-faq__body">
                <FAQList fields={f} />
              </div>
            </div>
            <Extras s={s} fx={fx} />
          </div>
        </section>
      );

    if (/^editorial-/.test(s.id))
      return (
        <section id={s.id} className={frame}>
          <div className="container">
            <div className="gen-split">
              <div className="gen-split__head nx-reveal">
                {eyebrow}
                {title}
              </div>
              <div className="gen-split__body">
                <GenProse className="gen-body" value={main} paths={paths} />
                {s.asset && (
                  <figure className="gen-figure nx-art--image">
                    <img
                      src={mediaPath(s.asset)}
                      alt={s.asset.alt}
                      width={s.asset.width}
                      height={s.asset.height}
                      loading="lazy"
                      decoding="async"
                    />
                    {s.asset.caption && <figcaption>{s.asset.caption}</figcaption>}
                  </figure>
                )}
                <Extras s={s} fx={fx} />
                <Body s={s} fx={fx} />
              </div>
            </div>
          </div>
        </section>
      );

    return (
      <section id={s.id} className={frame}>
        <div className="container">
          {(eyebrow || title || shortMain) && (
            <div className="section-head nx-reveal">
              <div>
                {eyebrow}
                {title}
              </div>
              {shortMain && <p className="lead">{main}</p>}
            </div>
          )}
          {main && !shortMain && <GenProse className="gen-body" value={main} paths={paths} />}
          {s.asset && (
            <figure className="gen-figure nx-art--image">
              <img
                src={mediaPath(s.asset)}
                alt={s.asset.alt}
                width={s.asset.width}
                height={s.asset.height}
                loading="lazy"
                decoding="async"
              />
              {s.asset.caption && <figcaption>{s.asset.caption}</figcaption>}
            </figure>
          )}
          <Extras s={s} fx={fx} />
          <Body s={s} fx={fx} />
        </div>
      </section>
    );
  }
  return (
    <div className={nx ? "nx v3-site" : "v3-site"}>
      {nx && (
        <>
          <SiteStyles page={nxCss ?? undefined} />
          <IconSprite />
        </>
      )}
      {!nx && (<>
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <link rel="stylesheet" href="/assets/v3-pages.css" />
      <link rel="stylesheet" href="/assets/service-template.css?v=20261007-unified" />
      <link rel="stylesheet" href="/assets/site-unified.css?v=20261008" />
      {skeleton && <link rel="stylesheet" href="/assets/skeleton.css?v=20261011" />}
      {aboutPage && <link rel="stylesheet" href="/assets/about.css?v=20261012" />}
      {contactPage && <link rel="stylesheet" href="/assets/contact.css?v=20261012" />}
      {engagePage && <link rel="stylesheet" href="/assets/engagement.css?v=20261013" />}
      {howPage && <link rel="stylesheet" href="/assets/how-work.css?v=20261015" />}
      {whyPage && <link rel="stylesheet" href="/assets/why-choose.css?v=20261015" />}
      {blogPage && <link rel="stylesheet" href="/assets/blog-index.css?v=20261016" />}
      </>)}
      {preview && (
        <div className="preview-banner">
          Private draft preview · forms disabled ·{" "}
          <a href="/admin/generation">Generation progress</a>
        </div>
      )}
      <StripeNavigation paths={paths} preview={preview} linkMap={linkMap} />
      <main id="main" className={blogPage ? "v3-blog" : whyPage ? "v3-why" : howPage ? "v3-how" : engagePage ? "v3-engage" : contactPage ? "v3-contact" : aboutPage ? "v3-about" : skeleton ? "v3-skeleton" : (servicePage ? "v3-service-page" : "") + (!hubFor(path) && content.pageSections?.some(s=>s.id==='service-overview') ? " v3-detail-page" : "") + (path === "/engagement-models" ? " v3-engagement-page" : "") + (path === "/about" ? " v3-about-page" : "") + (path === "/how-we-work" ? " v3-work-page" : "")}>
        {preview && content.unresolved.length > 0 && (
          <aside className="v3-wrap" role="alert">
            <p>Draft notes: {content.unresolved.join("; ")}.</p>
          </aside>
        )}
        {skeleton && <SkeletonSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} published={published} modified={modified} />}
        {aboutPage && <AboutSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {contactPage && <ContactSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {engagePage && <EngagementSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {howPage && <HowWorkSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {whyPage && <WhyChooseSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {blogPage && <BlogIndexSections content={content} path={path} paths={paths} posts={posts} preview={preview} linkMap={linkMap} newsletterEnabled={newsletterEnabled} />}
        {renderer === "services" && <ServicesDirectorySections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {!skeleton && !aboutPage && !contactPage && !engagePage && !howPage && !whyPage && !blogPage && renderer !== "services" && sections.map((s) => (
          <div key={s.id} className="v3-section-group">
            {s.id === "cta-banner" && !s.omitted && afterContent}
            {s.id === "cta-banner" && fallbackFaq && (
              <section id="faq" className="section">
                <div className="container">
                  <div className="faq gen-faq">
                    <div className="faq__aside nx-reveal">
                      <span className="eyebrow">Questions, answered</span>
                      <h2 className="h-section">Before you start.</h2>
                    </div>
                    <div className="gen-faq__body">
                      <FAQList fields={fallbackFaqFields} />
                    </div>
                  </div>
                </div>
              </section>
            )}
            <Section section={s} />
            {s.id === midCtaAfter && (
              <aside className="gen-midcta" aria-label="Start a project">
                <div className="container gen-panel">
                  <p>
                    <strong>Planning a {(sitePage(path)?.label ?? "software").toLowerCase()} project?</strong>{" "}
                    Share a short brief and get questions, an initial scope and the team it needs.
                  </p>
                  <TrackedLink href={ctaHref} event="consultation_click" service={ctaService} className="nx-btn nx-btn--primary">
                    <span>Get a scoped estimate</span>
                    <NxIcon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                  </TrackedLink>
                </div>
              </aside>
            )}
            {s.id === "why-netofficials" &&
              hubFor(path) &&
              !sections.some(
                (section) =>
                  !section.omitted &&
                  /technolog|tech-stack|tools-stack/.test(section.id),
              ) && (
                <section id="technology-stack" className="section section--white">
                  <div className="container">
                    <div className="section-head nx-reveal">
                      <div>
                        <span className="eyebrow">Technology stack</span>
                        <h2 className="h-section">The stack behind your application.</h2>
                      </div>
                      <p className="lead">
                        We choose the tools around your platform, existing systems
                        and release requirements.
                      </p>
                    </div>
                    <div className="gen-stack">
                    <ServiceTechnologyStack
                      groups={hubFor(path)!.technologies.map(
                        ([name, , items]) => ({ name, items }),
                      )}
                    />
                    </div>
                  </div>
                </section>
              )}
          </div>
        ))}
        {!sections.some((s) => s.id === "cta-banner" && !s.omitted) && afterContent}
        <RelatedPages path={path} paths={paths} />
        {path.startsWith("/blog/") && <RelatedGuides posts={posts} path={path} />}
      </main>
      {nx ? (
        <>
          <SiteFooter paths={paths} preview={preview} linkMap={linkMap} />
          <div className="mcta" data-mcta>
            <Button href={ctaHref} data-track="consultation_click">Start a project</Button>
          </div>
          <SiteBehaviors />
        </>
      ) : (
        <StripeFooter paths={paths} preview={preview} linkMap={linkMap} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            pageGraph({
              path,
              content: fallbackFaq
                ? {
                    ...content,
                    pageSections: [
                      ...sections,
                      { id: "faq-fallback", order: sections.length + 1, fields: fallbackFaqFields, evidenceIds: [], omitted: false },
                    ],
                  }
                : content,
              site: siteUrl(),
              published,
              modified,
              listing: blogPage ? posts : undefined,
            }),
          ).replaceAll("<", "\\u003c"),
        }}
      />
    </div>
  );
}
