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
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import { AboutSections, isAboutContent } from "./about-page";
import { ContactSections, isContactContent } from "./contact-page";
import { EngagementSections, isEngagementContent } from "./engagement-page";
import { HowWorkSections, isHowWorkContent } from "./how-work-page";
import { WhyChooseSections, isWhyChooseContent } from "./why-choose-page";
import { BlogIndexSections, isBlogIndexContent } from "./blog-index-page";
import { CareersSections, isCareersContent } from "./careers-page";
import { FaqSections, isFaqContent } from "./faq-page";
import type { BlogPost } from "./blog-types";
import { RelatedGuides } from "./related-guides";
import { RelatedPages } from "./related-pages";
import { SiteStyles, IconSprite, Button, ArrowLink, Breadcrumbs, HeroArt, Icon as NxIcon } from "./site/ui";
import { SiteFooter } from "./site/footer";
import { SiteBehaviors } from "./site/behaviors";
import { V2_PORTED } from "./site/v2-ported";
import { V2Behaviors } from "./site/v2/behaviors";
import { V2Footer } from "./site/v2/footer";
import { V2CtaBand, V2Crumbs, V2Icon, V2IconSprite, V2Styles, V2_VERSION, v2img } from "./site/v2/ui";
import { TechIcon } from "./brand-icon";
import React, { Fragment } from "react";
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
  /** Case studies about this page. Rendered by the server route: this component is also bundled for the client preview. */
  relatedStudies?: React.ReactNode;
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
  relatedStudies,
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
  const careersPage = isCareersContent(content, path);
  const faqPage = isFaqContent(content, path);
  // Renderers move to the redesigned shell one at a time (src/site/ported.ts).
  const renderer: Renderer = skeleton ? (path.startsWith("/blog/") ? "guide" : "skeleton") : aboutPage ? "about" : contactPage ? "contact" : engagePage ? "engagement" : howPage ? "how-work" : whyPage ? "why-choose" : blogPage ? "blog-index" : careersPage ? "careers" : faqPage ? "faq" : isServicesDirectoryPath(path) && PORTED.services !== null ? "services" : "generic";
  // A renderer on the v2 (monday-style) design takes the .v2 shell; otherwise the .nx shell, otherwise the legacy one.
  const v2Css = V2_PORTED[renderer];
  const v2 = v2Css !== null;
  const nxCss = PORTED[renderer];
  const nx = !v2 && nxCss !== null;
  // Case studies: on skeleton pages with a closing CTA band they sit before it, so the page still ends on the call to action.
  const studiesNode = v2 && React.isValidElement(relatedStudies) ? React.cloneElement(relatedStudies as React.ReactElement<{ v2?: boolean }>, { v2: true }) : relatedStudies;
  const studiesBeforeCta = v2 && skeleton && sections.some((s) => s.id === "cta-banner" && !s.omitted);
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
    const iconList = ["why-netofficials", "service-overview"].includes(s.id);
    return (
      <>
        {stats.length > 0 && (
          <div className="stats gen-stats">
            <div className="stats__g">
              {stats.map((k) => (
                <div key={k}>
                  <b>{f[k]}</b>
                  <span>{f[k.replace("number", "label")]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {scalar.length > 0 &&
          (iconList ? (
            <ul className="gen-icon-list">
              {scalar.map(([key, value]) => (
                <li key={key} className="gen-check--icon">
                  <span className="ico-tile" aria-hidden="true">
                    <GenIcon name={iconFor(value)} />
                  </span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="ticks">
              {scalar.map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          ))}
        {categories.length > 0 && (
          <div className="gen-categories">
            {f.filter_label && <p className="gen-meta">{f.filter_label}</p>}
            <ul className="skills gen-industries">
              {categories.map((c, i) => (
                <li key={i}>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {chips.length > 0 && (
          <ul className="skills gen-industries">
            {chips.map((c, i) => (
              <li key={i}>{c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}</li>
            ))}
          </ul>
        )}
        {copy(industries) && <GenProse className="lead" value={copy(industries)} paths={paths} />}
        {f.privacy_note && <p className="gen-note">{f.privacy_note}</p>}
        <VerifiedEvidence fields={f} />
      </>
    );
  }

  /** Clause list used by editorial parts: each card is one clause with a title and text. */
  function Clauses({ cards }: { cards: Record<string, string>[] }) {
    if (!cards.length) return null;
    return (
      <div className="prose gen-clauses">
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
        <div className="form gen-form">
          <LeadForm preview={preview}>
            <div className="fgrid">
              <div className="field">
                <label>
                  Name
                  <input name="name" required maxLength={120} autoComplete="name" />
                </label>
              </div>
              <div className="field">
                <label>
                  Email
                  <input name="email" type="email" required autoComplete="email" />
                </label>
              </div>
              <div className="field">
                <label>
                  Service
                  <input name="service" required data-service-context="true" defaultValue="" />
                </label>
              </div>
              <div className="field field--full">
                <label>
                  Project goal
                  <textarea name="goal" required minLength={10} maxLength={5000} />
                </label>
              </div>
              <div className="field">
                <label>
                  Country <small>(optional)</small>
                  <input name="country" autoComplete="country-name" />
                </label>
              </div>
              <div className="field">
                <label>
                  Timeline <small>(optional)</small>
                  <input name="timeline" />
                </label>
              </div>
            </div>
            <button className="btn btn--violet" type="submit">
              <span>{f.submit_label || "Send project enquiry"}</span>
            </button>
          </LeadForm>
        </div>
      );
    if (s.id === "newsletter-cta")
      return (
        <div className="band band--lavender gen-newsletter">
          <NewsletterForm enabled={newsletterEnabled && !preview} />
        </div>
      );
    if (s.id === "open-roles") return <VacancyDirectory vacancies={vacancies} preview={preview} />;
    if (/comparison/.test(s.id) && cards.some((g) => g.attribute)) return <Comparison groups={cards} />;
    if (/related-hubs|related-services/.test(s.id))
      return (
        <div className="catgrid gen-paired">
          {cards.map((g, i) => (
            <div key={g.url || i} className="cat rv">
              <span className="ico-tile" aria-hidden="true">
                <GenIcon name={iconFor(g.name || g.title || "", g.reason || g.body || "")} />
              </span>
              <h3>{g.name || g.title}</h3>
              {(g.body || g.description || g.reason || g.outcome) && <p>{g.body || g.description || g.reason || g.outcome}</p>}
              {g.url && (
                <TrackedLink href={destination(g.url)} event="hub_click" service={service} className="more service-paired-link">
                  <span>Explore {g.name || g.title}</span>
                  <V2Icon name="arrow" />
                </TrackedLink>
              )}
            </div>
          ))}
        </div>
      );
    if (path === "/engagement-models" && s.id === "models-comparison")
      return (
        <div className="catgrid catgrid--2 engagement-models">
          {cards.map((g, i) => (
            <div className="cat rv engagement-model" key={g.name || i}>
              <span className="ico-tile" aria-hidden="true">
                <GenIcon name={iconFor(g.name || g.title || "", g.body || "")} />
              </span>
              <h3>{g.name || g.title}</h3>
              {g.best_for && (
                <p>
                  <strong>Best suited to:</strong> {g.best_for}
                </p>
              )}
              <p>{g.body || g.description}</p>
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
            </div>
          ))}
        </div>
      );
    if (/technolog|tech-stack|tools-stack/.test(s.id) || layout?.recommended_component === "TechnologyGrid")
      return (
        <div className="gen-stack">
          {cards.map((g, i) => {
            const name = g.name || g.title || "Technology";
            const items = (g.items || g.body || "")
              .split(/[,|;]/)
              .map((item) => item.trim())
              .filter(Boolean);
            return (
              <div key={i} className="gen-stack__group">
                <h3 className="gen-stack__title">{name}</h3>
                <ul className="gen-tools">
                  {items.map((item) => (
                    <li key={item}>
                      <TechIcon name={item} context={name} className="gen-tools__icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );
    const process = /process/.test(s.id);
    const editorial = /^editorial-/.test(s.id);
    const tints = ["var(--p-lime)", "var(--p-sky)", "var(--p-peach)", "var(--p-lavender)"];
    return (
      <>
        {cards.length > 0 && editorial && <Clauses cards={cards} />}
        {cards.length > 0 && !editorial && process && (
          <div className="wf" data-wf>
            {cards.map((g, i) => {
              const text = g.body || g.bio || g.description || g.reason || g.usecase || g.excerpt || g.outcome;
              return (
                <Fragment key={i}>
                  {i > 0 && <span className="wf__ln" />}
                  <div className="wf__step" style={{ transitionDelay: `${i * 0.1}s` }}>
                    <div>
                      <span className="n" style={{ background: tints[i % tints.length] }}>
                        {i + 1}
                      </span>
                      <span>
                        <h3>{g.title || g.name || g.heading || g.label}</h3>
                        {text && <p>{text}</p>}
                        {g.timeline && <p className="gen-meta">Timeline: {g.timeline}</p>}
                        {g.pricing && <p className="gen-meta">Pricing approach: {g.pricing}</p>}
                      </span>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
        {cards.length > 0 && !editorial && !process && (
          <div className="catgrid">
            {cards.map((g, i) => {
              const text = g.body || g.bio || g.description || g.reason || g.usecase || g.excerpt || g.outcome;
              const body = (
                <>
                  <span className="ico-tile" aria-hidden="true">
                    <GenIcon
                      name={iconFor(
                        g.title || g.name || g.heading || g.label || "",
                        [g.body, g.usecase, g.description, g.problem].filter(Boolean).join(" "),
                      )}
                    />
                  </span>
                  <h3>{g.bio ? g.name : g.title || g.name || g.heading || g.label}</h3>
                  {g.bio && <p className="gen-meta">{g.title}</p>}
                  {g.problem && <p>{g.problem}</p>}
                  {text && <p>{text}</p>}
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
                </>
              );
              return (
                <div key={i} className="cat rv">
                  {body}
                  {g.url && (
                    <TrackedLink href={destination(g.url)} event="hub_click" service={service} className="more">
                      <span>{g.cta || "Explore " + (g.title || g.name || g.label)}</span>
                      <V2Icon name="arrow" />
                    </TrackedLink>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {s.id === "services-grid" && hubFor(path) && (
          <div className="catgrid catgrid--2 gen-directory">
            <h3 className="gen-directory__title">All {hubFor(path)?.name.toLowerCase()} services</h3>
            {hubChildren(hubFor(path)!).map((child) => (
              <TrackedLink event="hub_click" service={service} href={destination(child.url)} key={child.url} className="cat rv">
                <h3>{child.title.replace(/\s*[|–].*$/g, "")}</h3>
                <span className="more">
                  Explore <V2Icon name="arrow" />
                </span>
              </TrackedLink>
            ))}
          </div>
        )}
      </>
    );
  }

  /** Page stylesheet for the layouts that have one (public/assets/v2/pages), loaded with the first section. */
  const pageCss = /^\/careers(?:\/|$)/.test(path)
    ? "careers"
    : legalPage
      ? "legal"
      : /^\/portfolio(?:\/|$)/.test(path)
        ? "portfolio"
        : /^\/case-studies(?:\/|$)/.test(path)
          ? "case-studies"
          : path === "/404"
            ? "404"
            : null;
  const firstSectionId = sections.find((s) => !s.omitted)?.id;
  /** Visible sections other than the hero, in page order: they alternate white and cloud backgrounds. */
  const bandIds = sections.filter((s) => !s.omitted && !isHeroSection(s)).map((s) => s.id);

  function SectionBody({ s }: { s: PageSection }) {
    if (s.omitted) return null;
    const layout = content.pageBlueprint?.[s.id];
    if (!layout) return null;
    if (legalPage && legalDocIds.includes(s.id) && s.id !== legalParts[0]?.id) return null;
    if (!hasContentOf(s) && !["open-roles", "newsletter-cta"].includes(s.id)) return null;
    // The closing band comes from the shell (V2CtaBand), so the section's own band is not drawn.
    if (s.id === "cta-banner") return null;
    const fx = facts(s);
    const { f, heading, main } = fx;
    const hero = isHeroSection(s);

    if (hero) {
      const noActions = pageCss === "legal";
      const heroArt = s.asset ? (
        <img src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} className="media rv" loading="eager" decoding="async" />
      ) : pageCss === "careers" ? (
        <img src={v2img("scene-careers")} alt="Three illustrated characters high five" className="media rv" loading="eager" decoding="async" />
      ) : pageCss === "404" ? (
        <img src={v2img("scene-404")} alt="Illustrated character holding a map upside down" width={220} height={220} loading="eager" decoding="async" />
      ) : null;
      // Careers, portfolio, case studies and the FAQ get the split hero with an animated scene (the same layout as the service pages).
      const sceneKind = path === "/faq" ? "faq" : pageCss === "careers" ? "crew" : pageCss === "portfolio" || pageCss === "case-studies" ? "gallery" : null;
      if (v2 && sceneKind)
        return (
          <>
          <SceneHero
            id={s.id}
            labelId={`${s.id}-h1`}
            trail={trail.map((crumb, i) => ({ label: crumb.label, href: i === trail.length - 1 ? undefined : destination(crumb.path) }))}
            eyebrow={f.tag_pill || heroEyebrow || undefined}
            h1={f.h1 || content.title}
            sub={(main ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined}
            actions={
              <>
                <TrackedLink href={contact} event="consultation_click" service={service} className="btn btn--grad">
                  <span>{f.cta_primary_label || "Talk to an engineer"}</span> <V2Icon name="arrow" />
                </TrackedLink>
                {f.cta_secondary_label && f.cta_secondary_url && (
                  <a className="btn btn--ghost" href={destination(f.cta_secondary_url)}>
                    {f.cta_secondary_label}
                  </a>
                )}
              </>
            }
            scene={<HeroScene kind={sceneKind} title={sceneKind === "crew" ? "Netofficials" : sceneKind === "faq" ? "Questions" : "Our work"} items={[]} stack={sceneKind === "gallery" ? ["All", "Software", "Mobile", "AI"] : []} />}
          />
          {s.asset && (
            <section className="sec sec--tight" aria-label="Illustration">
              <div className="wrap">{heroArt}</div>
            </section>
          )}
          </>
        );
      return (
        <section id={s.id} className={"hero--" + (pageCss === "careers" ? "statement careers-hero" : pageCss === "404" ? "404" : pageCss === "legal" ? "center legal-hero" : "center")}>
          <div className="wrap">
            {pageCss === "404" && <span className="ghost" aria-hidden="true">404</span>}
            {pageCss === "404" && heroArt}
            {trail.length > 1 && pageCss !== "404" && (
              <V2Crumbs trail={trail.map((crumb, i) => ({ label: crumb.label, href: i === trail.length - 1 ? undefined : destination(crumb.path) }))} />
            )}
            {pageCss !== "404" && (f.tag_pill || heroEyebrow) && <p className="eyebrow">{f.tag_pill || heroEyebrow}</p>}
            <h1 id={pageCss === "404" ? "nf-h" : undefined}>{f.h1 || content.title}</h1>
            <GenProse className="lead" value={main} paths={paths} />
            {!noActions && (
              <div className="hero__acts">
                {pageCss === "404" ? (
                  <a className="btn btn--grad" href={destination("/")}>
                    Back to the homepage <V2Icon name="arrow" />
                  </a>
                ) : (
                  <TrackedLink href={contact} event="consultation_click" service={service} className="btn btn--grad">
                    <span>{f.cta_primary_label || "Talk to an engineer"}</span> <V2Icon name="arrow" />
                  </TrackedLink>
                )}
                {pageCss !== "404" && f.cta_secondary_label && f.cta_secondary_url && (
                  <a className="btn btn--ghost" href={destination(f.cta_secondary_url)}>
                    {f.cta_secondary_label}
                  </a>
                )}
              </div>
            )}
            {pageCss !== "404" && heroArt}
            <Extras s={s} fx={fx} />
          </div>
        </section>
      );
    }

    if (legalPage && legalDocIds.includes(s.id))
      return (
        <section className="sec legal-page gen-legal-section">
          <div className="wrap">
            <div className="article">
              <nav className="toc" data-toc aria-label="On this page">
                <b>On this page</b>
                {legalParts.map((p) => (
                  <a key={p.id} href={"#" + p.id}>
                    {partTitle(p) || p.id}
                  </a>
                ))}
              </nav>
              <div className="prose legal-doc">
                {legalParts.map((p, i) => {
                  const px = facts(p);
                  return (
                    <section key={p.id} id={p.id} className="gen-part">
                      <h2>
                        {i + 1}. {partTitle(p) || p.id}
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

    const dark = /^(process|engagement-models)$/.test(s.id);
    const cloud = dark || bandIds.indexOf(s.id) % 2 === 1;
    const frame = "sec" + (cloud ? " sec--cloud" : "");
    const shortMain = isShortText(main);
    const eyebrow = f.section_label ? <p className="label">{f.section_label}</p> : null;
    const title = heading ? (
      <h2 className="big" id={`${s.id}-h`}>
        {heading}
      </h2>
    ) : null;

    if (/faq/.test(s.id))
      return (
        <section id={s.id} className={frame} aria-labelledby={heading ? `${s.id}-h` : undefined}>
          <div className="wrap">
            <div className={"faq gen-faq" + (eyebrow || title || main ? "" : " gen-faq--solo")}>
              {(eyebrow || title || main) && (
                <div className="faq__aside rv">
                  {eyebrow}
                  {title && (
                    <h2 className="h2" id={`${s.id}-h`}>
                      {heading}
                    </h2>
                  )}
                  <GenProse className="lead" value={main} paths={paths} />
                </div>
              )}
              <div className="rv">
                <FAQList fields={f} />
              </div>
            </div>
            <Extras s={s} fx={fx} />
          </div>
        </section>
      );

    if (/^editorial-/.test(s.id))
      return (
        <section id={s.id} className={frame} aria-labelledby={heading ? `${s.id}-h` : undefined}>
          <div className="wrap split">
            <div className="rv">
              {eyebrow}
              {heading && (
                <h2 className="h2" id={`${s.id}-h`}>
                  {heading}
                </h2>
              )}
            </div>
            <div className="rv">
              <GenProse className="gen-body" value={main} paths={paths} />
              {s.asset && (
                <figure className="gen-figure">
                  <img className="media" src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} loading="lazy" decoding="async" />
                  {s.asset.caption && <figcaption>{s.asset.caption}</figcaption>}
                </figure>
              )}
              <Extras s={s} fx={fx} />
              <Body s={s} fx={fx} />
            </div>
          </div>
        </section>
      );

    return (
      <section id={s.id} className={frame} aria-labelledby={heading ? `${s.id}-h` : undefined}>
        <div className="wrap">
          {(eyebrow || title || shortMain) && (
            <div className="sec__head rv">
              {eyebrow}
              {title}
              {shortMain && <p className="lead">{main}</p>}
            </div>
          )}
          {main && !shortMain && <GenProse className="gen-body" value={main} paths={paths} />}
          {s.asset && (
            <figure className="gen-figure">
              <img className="media" src={mediaPath(s.asset)} alt={s.asset.alt} width={s.asset.width} height={s.asset.height} loading="lazy" decoding="async" />
              {s.asset.caption && <figcaption>{s.asset.caption}</figcaption>}
            </figure>
          )}
          <Extras s={s} fx={fx} />
          <Body s={s} fx={fx} />
        </div>
      </section>
    );
  }

  function Section({ section: s }: { section: PageSection }) {
    return (
      <>
        {pageCss && s.id === firstSectionId && <link rel="stylesheet" href={`/assets/v2/pages/${pageCss}.css?v=${V2_VERSION}`} />}
        <SectionBody s={s} />
      </>
    );
  }
  return (
    <div className={v2 ? "v2 v3-site" : nx ? "nx v3-site" : "v3-site"}>
      {v2 && (
        <>
          <V2Styles page={v2Css ?? undefined} />
          <V2IconSprite />
        </>
      )}
      {nx && (
        <>
          <SiteStyles page={nxCss ?? undefined} />
          <IconSprite />
        </>
      )}
      {!nx && !v2 && (<>
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
        {skeleton && <SkeletonSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} published={published} modified={modified} studies={studiesBeforeCta ? studiesNode : undefined} />}
        {aboutPage && <AboutSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {contactPage && <ContactSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {engagePage && <EngagementSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {howPage && <HowWorkSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {whyPage && <WhyChooseSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {blogPage && <BlogIndexSections content={content} path={path} paths={paths} posts={posts} preview={preview} linkMap={linkMap} newsletterEnabled={newsletterEnabled} />}
        {careersPage && <CareersSections content={content} path={path} paths={paths} vacancies={vacancies} preview={preview} linkMap={linkMap} />}
        {faqPage && <FaqSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {renderer === "services" && <ServicesDirectorySections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {!skeleton && !aboutPage && !contactPage && !engagePage && !howPage && !whyPage && !blogPage && !careersPage && !faqPage && renderer !== "services" && sections.map((s) => (
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
        {!(v2 && skeleton && sections.some((s) => s.id === "related-services" && !s.omitted)) && !(v2 && renderer === "about") && <RelatedPages path={path} paths={paths} v2={v2} />}
        {!studiesBeforeCta && studiesNode}
        {path.startsWith("/blog/") && <RelatedGuides posts={posts} path={path} v2={v2} />}
        {v2 && renderer !== "contact" && !(["about", "skeleton", "guide", "engagement", "how-work", "why-choose"].includes(renderer) && sections.some((s) => s.id === "cta-banner" && !s.omitted)) && <V2CtaBand href={ctaHref} />}
      </main>
      {v2 ? (
        <>
          <V2Footer paths={paths} preview={preview} linkMap={linkMap} />
          <V2Behaviors />
        </>
      ) : nx ? (
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
