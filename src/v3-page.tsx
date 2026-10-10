import { mediaPath } from "./media-path";
import { ServiceTechnologyStack } from "./service-technology-stack";
import { SiteIcon, iconFor, legacyIcon } from "./icon-set";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";
import { StripeNavigation, StripeFooter } from "./stripe-home-chrome";
import { LeadForm } from "./render";
import { hubFor, hubChildren, serviceHubs } from "./service-hubs";
import { FAQList, Comparison, VerifiedEvidence } from "./v3-sections";
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
  // Every icon comes from the shared line set; legacy sprite keys are mapped onto it.
  function Icon({ name }: { name?: string }) {
    return name ? <SiteIcon name={legacyIcon[name] ?? name} className="v3-icon" /> : null;
  }
  function Section({ section: s }: { section: PageSection }) {
    if (s.omitted) return null;
    const layout = content.pageBlueprint?.[s.id];
    if (!layout) return null;
    const f = s.fields,
      cards = sectionGroups(f),
      heading = (f.heading || f.mission_statement || f.form_heading || (path === "/how-we-work" && s.id === "faq" ? "Questions about working together." : "")).replace(path === "/react-development-services" ? /React and Flutter App/gi : /$^/, "React Web Application");
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
    const main =
      f.body_paragraph ||
      f.subheadline ||
      f.mission_body ||
      f.culture_paragraph ||
      f.form_subheadline;
    const stats = Object.keys(f).filter(
      (k) => /^stat_\d+_number$/.test(k) && f[k],
    );
    const scalar = Object.entries(f).filter(
      ([k, v]) => v && /^(outcome|adv|culture|value|signal|trust)_\d+$/.test(k),
    );
    const isHero =
      s.id === "hero" ||
      layout.recommended_component === "HeroSplit" ||
      layout.recommended_component === "HeroFull";
    const isCta = s.id === "cta-banner";
    const surface = isCta
      ? "#182138"
      : servicePage
        ? /^(process|engagement-models)$/.test(s.id)
          ? "#182138"
          : s.id === "industry-applications"
            ? "#e7edc5"
            : /^(services-grid|service-overview|technology-stack|who-its-for|related-hubs|related-services|faq|faqs)$/.test(
                  s.id,
                )
              ? "#f1f4f7"
              : "#ffffff"
        : (({ "#061b31": "#182138", "#533afd": "#4353b3", "#f8fafd": "#f1f4f7" } as Record<string, string>)[
            layout.background
          ] ?? layout.background);
    const onDark = ["#182138", "#4353b3"].includes(surface);
    // Proof blocks lose their items when evidence is unverified; a lone
    // heading left behind reads as a broken section, so drop it.
    const proofSection = /^(stats|testimonial|proof|case-stud|client|trust|logo)/.test(s.id);
    const hasContent =
      isHero ||
      (heading && !proofSection) ||
      main ||
      cards.length ||
      stats.length ||
      scalar.length ||
      Object.keys(f).some((k) => /^(?:q\d+|cat_\d+)$/.test(k) && f[k]);
    if (!hasContent && !["open-roles", "newsletter-cta"].includes(s.id))
      return null;
    return (
      <section
        id={s.id}
        className={
          "v3-section v3-" +
          layout.recommended_component +
          (onDark ? " v3-on-dark" : "") +
          (isCta ? " v3-dark" : "") +
          (isHero ? " v3-hero-section" : "") +
          " v3-section--" +
          s.id
        }
        style={{
          backgroundColor: surface,
          marginTop: servicePage ? 0 : layout.spacing_above,
          color: onDark ? "#ffffff" : "#182138",
        }}
      >
        <div
          className="v3-wrap"
          style={{
            maxWidth:
              isHero || layout.max_width === "100pct"
                ? 1320
                : Number.parseInt(layout.max_width),
          }}
        >
          {isHero ? (
            <>
              {trail.length > 1 && (
                <nav className="v3-hero-breadcrumb" aria-label="Breadcrumb">
                  <ol>
                    {trail.map((crumb, i) =>
                      i === trail.length - 1 ? (
                        <li key={crumb.path} aria-current="page">{crumb.label}</li>
                      ) : (
                        <li key={crumb.path}>
                          <a href={destination(crumb.path)}>{crumb.label}</a>
                        </li>
                      ),
                    )}
                  </ol>
                </nav>
              )}
              <div
                className={
                  "v3-hero-grid" +
                  (!s.asset ? " v3-hero-text" : "")
                }
              >
                <div>
                  {(f.tag_pill || heroEyebrow) && <span className="v3-tag">{f.tag_pill || heroEyebrow}</span>}
                  <h1>{f.h1 || content.title}</h1>
                  <p className="v3-intro">{main}</p>
                  {(

                    <div className="v3-actions">
                      <TrackedLink
                        href={contact}
                        event="consultation_click"
                        service={service}
                        className="v3-button"
                      >
                        {f.cta_primary_label || "Talk to an engineer"}
                        <span aria-hidden="true">↗</span>
                      </TrackedLink>
                      {f.cta_secondary_label && f.cta_secondary_url && (
                        <a
                          className="v3-link"
                          href={destination(f.cta_secondary_url)}
                        >
                          {f.cta_secondary_label} →
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {s.asset ? (
                  <figure>
                    <img
                      src={mediaPath(s.asset)}
                      alt={s.asset.alt}
                      title={s.asset.caption || undefined}
                      width={s.asset.width}
                      height={s.asset.height}
                      fetchPriority="high"
                    />
                  </figure>
                ) : null}
              </div>
            </>
          ) : (
            <>
              {f.section_label && (
                <p className="v3-eyebrow">{f.section_label}</p>
              )}
              {heading && <h2>{heading}</h2>}
              {main && <Prose value={main} paths={paths} />}
              {s.asset && (
                <figure className="v3-figure">
                  <img
                    src={mediaPath(s.asset)}
                    alt={s.asset.alt}
                    title={s.asset.caption || undefined}
                    width={s.asset.width}
                    height={s.asset.height}
                    loading="lazy"
                    decoding="async"
                  />
                  {s.asset.caption && <figcaption>{s.asset.caption}</figcaption>}
                </figure>
              )}
              {isCta && (
                <div className="v3-actions">
                  <TrackedLink
                    href={contact}
                    event="consultation_click"
                    service={service}
                    className="v3-button"
                  >
                    {f.cta_primary_label || "Discuss your project"}
                    <span aria-hidden="true">↗</span>
                  </TrackedLink>
                  <a
                    className="v3-link"
                    href={destination(f.cta_secondary_url || "/how-we-work")}
                  >
                    {f.cta_secondary_label || "How we work"} →
                  </a>
                </div>
              )}
            </>
          )}
          {stats.length > 0 && (
            <dl className="v3-stats">
              {stats.map((k) => (
                <div key={k}>
                  <dt>{f[k.replace("number", "label")]}</dt>
                  <dd>{f[k]}</dd>
                </div>
              ))}
            </dl>
          )}
          {scalar.length > 0 && (
            <ul className="v3-outcomes">
              {scalar.map(([key, value]) => (
                <li key={key}>
                  {["why-netofficials", "service-overview"].includes(s.id) ? (
                    <span className="service-reason-icon">
                      <Icon
                        name={
                          iconFor(value)
                        }
                      />
                    </span>
                  ) : (
                    <span aria-hidden="true">✓</span>
                  )}
                  <span className="service-reason-copy">{value}</span>
                </li>
              ))}
            </ul>
          )}
          {f.industries && <p className="v3-intro">{f.industries}</p>}
          {f.privacy_note && <p className="v3-caption">{f.privacy_note}</p>}
          <VerifiedEvidence fields={f} />
          {s.id === "contact-form" ? (
            <LeadForm preview={preview}>
              <label>
                Name
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Service
                <input
                  name="service"
                  required
                  data-service-context="true"
                  defaultValue=""
                />
              </label>
              <label>
                Project goal
                <textarea
                  name="goal"
                  required
                  minLength={10}
                  maxLength={5000}
                />
              </label>
              <label>
                Country <span>(optional)</span>
                <input name="country" autoComplete="country-name" />
              </label>
              <label>
                Timeline <span>(optional)</span>
                <input name="timeline" />
              </label>
              <button className="v3-button" type="submit">
                {f.submit_label || "Send project enquiry"}
              </button>
            </LeadForm>
          ) : s.id === "newsletter-cta" ? (
            <NewsletterForm enabled={newsletterEnabled && !preview} />
          ) : s.id === "open-roles" ? (
            <VacancyDirectory vacancies={vacancies} preview={preview} />
          ) : /comparison/.test(s.id) && cards.some((g) => g.attribute) ? (
            <Comparison groups={cards} />
          ) : /faq/.test(s.id) ? (
            <FAQList fields={f} />
          ) : /related-hubs|related-services/.test(s.id) ? (
            <div className="service-paired">
              {cards.map((g, i) => (
                <article key={g.url || i}>
                  <span className="service-paired-icon">
                    <Icon
                      name={iconFor(g.name || g.title || "", g.reason || g.body || "")}
                    />
                  </span>
                  <div>
                    <h3>{g.name || g.title}</h3>
                    <p>{g.body || g.description || g.reason || g.outcome}</p>
                  </div>
                  {g.url && (
                    <TrackedLink
                      className="service-paired-link"
                      href={destination(g.url)}
                      event="hub_click"
                      service={service}
                    >
                      <span className="service-paired-link-label">
                        Explore {g.name || g.title}
                      </span>
                      <span aria-hidden="true">↗</span>
                    </TrackedLink>
                  )}
                </article>
              ))}
            </div>
          ) : path === "/engagement-models" && s.id === "models-comparison" ? (
            <div className="engagement-models">
              {cards.map((g, i) => <article className="engagement-model" key={g.name || i}>
                <div className="engagement-model-heading">
                  <span className="engagement-model-icon"><Icon name={iconFor(g.name || g.title || "", g.body || "")} /></span>
                  <h3>{g.name || g.title}</h3>
                  {g.best_for && <p><strong>Best suited to</strong>{g.best_for}</p>}
                </div>
                <div className="engagement-model-content">
                  <p>{g.body || g.description}</p>
                  <dl>{g.timeline && <div><dt>Delivery approach</dt><dd>{g.timeline}</dd></div>}{g.pricing && <div><dt>Commercial model</dt><dd>{g.pricing}</dd></div>}</dl>
                </div>
              </article>)}
            </div>
          ) : /technolog|tech-stack|tools-stack/.test(s.id) ||
            layout.recommended_component === "TechnologyGrid" ? (
            <ServiceTechnologyStack
              groups={cards.map((g) => ({
                name: g.name || g.title || "Technology",
                items: (g.items || g.body || "")
                  .split(/[,|;]/)
                  .map((name) => name.trim())
                  .filter(Boolean),
              }))}
            />
          ) : (
            cards.length > 0 && (
              <div
                className={
                  "v3-cards" + (/process/.test(s.id) ? " v3-process" : "")
                }
              >
                {cards.map((g, i) => (
                  <article key={i}>
                    {/process/.test(s.id) ? (
                      <span className="v3-step">
                        <Icon
                          name={iconFor(g.title || g.name || "", g.body || "")}
                        />
                      </span>
                    ) : (
                      <span className="v3-icon-tile">
                        <Icon
                          name={
                            iconFor(
                              g.title || g.name || g.heading || g.label || "",
                              [g.body, g.usecase, g.description, g.problem].filter(Boolean).join(" "),
                            )
                          }
                        />
                      </span>
                    )}
                    <h3>
                      {g.bio
                        ? g.name
                        : g.title || g.name || g.heading || g.label}
                    </h3>
                    {g.bio && <p className="v3-caption">{g.title}</p>}
                    {g.problem && <p>{g.problem}</p>}
                    <p>
                      {g.body ||
                        g.bio ||
                        g.description ||
                        g.reason ||
                        g.usecase ||
                        g.excerpt ||
                        g.outcome}
                    </p>
                    {g.timeline && (
                      <p className="v3-caption">
                        <strong>Timeline:</strong> {g.timeline}
                      </p>
                    )}
                    {g.pricing && (
                      <p className="v3-caption">
                        <strong>Pricing approach:</strong> {g.pricing}
                      </p>
                    )}
                    {g.expertise && <p className="v3-caption">{g.expertise}</p>}
                    {g.industry && <p className="v3-caption">{g.industry}</p>}
                    {g.tech && <p className="v3-caption">{g.tech}</p>}
                    {g.tag && <p className="v3-caption">{g.tag}</p>}
                    {g.best_for && (
                      <p className="v3-caption">Best for: {g.best_for}</p>
                    )}
                    {g.url && (
                      <TrackedLink
                        href={destination(g.url)}
                        event="hub_click"
                        service={service}
                        className="v3-link"
                      >
                        {g.cta || "Explore " + (g.title || g.name || g.label)}{" "}
                        <span aria-hidden="true">↗</span>
                      </TrackedLink>
                    )}
                  </article>
                ))}
              </div>
            )
          )}
          {s.id === "services-grid" && hubFor(path) && (
            <div className="v3-directory">
              <h3>All {hubFor(path)?.name.toLowerCase()} services</h3>
              <div>
                {hubChildren(hubFor(path)!).map((child) => (
                  <TrackedLink
                    event="hub_click"
                    service={service}
                    href={destination(child.url)}
                    key={child.url}
                  >
                    {child.title.replace(/\s*[|–].*$/g, "")}{" "}
                    <span aria-hidden="true">↗</span>
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <div className="v3-site">
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <link rel="stylesheet" href="/assets/v3-pages.css" />
      <link rel="stylesheet" href="/assets/service-template.css?v=20261007-unified" />
      <link rel="stylesheet" href="/assets/site-unified.css?v=20261008" />
      {skeleton && <link rel="stylesheet" href="/assets/skeleton.css?v=20261011" />}
      {aboutPage && <link rel="stylesheet" href="/assets/about.css?v=20261012" />}
      {contactPage && <link rel="stylesheet" href="/assets/contact.css?v=20261012" />}
      {engagePage && <link rel="stylesheet" href="/assets/engagement.css?v=20261013" />}
      {howPage && <link rel="stylesheet" href="/assets/how-work.css?v=20261014" />}
      {whyPage && <link rel="stylesheet" href="/assets/why-choose.css?v=20261015" />}
      {blogPage && <link rel="stylesheet" href="/assets/blog-index.css?v=20261016" />}
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
        {skeleton && <SkeletonSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {aboutPage && <AboutSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {contactPage && <ContactSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {engagePage && <EngagementSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {howPage && <HowWorkSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {whyPage && <WhyChooseSections content={content} path={path} paths={paths} preview={preview} linkMap={linkMap} />}
        {blogPage && <BlogIndexSections content={content} path={path} paths={paths} posts={posts} preview={preview} linkMap={linkMap} newsletterEnabled={newsletterEnabled} />}
        {!skeleton && !aboutPage && !contactPage && !engagePage && !howPage && !whyPage && !blogPage && sections.map((s) => (
          <div key={s.id} className="v3-section-group">
            {s.id === "cta-banner" && !s.omitted && afterContent}
            {s.id === "cta-banner" && fallbackFaq && (
              <section id="faq" className="v3-section v3-section--faq">
                <div className="v3-wrap">
                  <p className="v3-eyebrow">Questions, answered</p>
                  <h2>Before you start.</h2>
                  <FAQList fields={fallbackFaqFields} />
                </div>
              </section>
            )}
            <Section section={s} />
            {s.id === midCtaAfter && (
              <aside className="v3-midcta" aria-label="Start a project">
                <div className="v3-wrap">
                  <p>
                    <strong>Planning a {(sitePage(path)?.label ?? "software").toLowerCase()} project?</strong>{" "}
                    Share a short brief and get questions, an initial scope and the team it needs.
                  </p>
                  <TrackedLink href={ctaHref} event="consultation_click" service={ctaService} className="v3-button">
                    Get a scoped estimate <span aria-hidden="true">→</span>
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
                <section
                  id="technology-stack"
                  className="v3-section v3-section--technology-stack"
                >
                  <div className="v3-wrap">
                    <p className="v3-eyebrow">Technology stack</p>
                    <h2>The stack behind your application.</h2>
                    <p className="v3-intro">
                      We choose the tools around your platform, existing systems
                      and release requirements.
                    </p>
                    <ServiceTechnologyStack
                      groups={hubFor(path)!.technologies.map(
                        ([name, , items]) => ({ name, items }),
                      )}
                    />
                  </div>
                </section>
              )}
          </div>
        ))}
        {!sections.some((s) => s.id === "cta-banner" && !s.omitted) && afterContent}
      </main>
      <StripeFooter paths={paths} preview={preview} linkMap={linkMap} />
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
              site: process.env.SITE_URL ?? "http://localhost:3000",
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
