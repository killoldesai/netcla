import { siteUrl } from "./site-url";
import type { Content } from "./content";
import { RichContent } from "./rich-content";
import { StripeNavigation, StripeFooter } from "./stripe-home-chrome";
import { SharedProjectEnquiry } from "./shared-project-enquiry";
import { HubActivityPanel } from "./hub-activity-panel";
import { hubActivityContent } from "./hub-activity-content";
import { serviceDescriptions } from "./service-descriptions";
import {
  hubFor,
  hubChildren,
  plannedPage,
  technologyAsset,
} from "./service-hubs";

type Listing = {
  path: string;
  title: string;
  description?: string;
  kind?: string;
}[];
export function ServiceHubPage({
  path,
  content,
  preview = false,
  linkMap = {},
  paths = [],
  listing = [],
}: {
  path: string;
  content?: Content;
  preview?: boolean;
  linkMap?: Record<string, string>;
  paths?: string[];
  listing?: Listing;
}) {
  const defaults = hubFor(path);
  if (!defaults) return null;
  const searchHub = ["/seo-services", "/ppc-services"].includes(path);
  const href = (destination: string) => linkMap[destination] ?? destination;
  const children = hubChildren(defaults);
  const saved = (pattern: RegExp) =>
    content?.sections?.find((s) => pattern.test(s.heading));
  const audience = saved(/who.*for|who.*work with|buyer/i);
  const processSection = saved(/process/i);
  const processCards = processSection?.cards.length ? processSection.cards : [];
  const hub = {
    ...defaults,
    personas: audience?.cards.length
      ? audience.cards.map((c, i) => ({
          title: c.title,
          body: c.body,
          use:
            defaults.personas[i]?.use ?? "An agreed scope and delivery plan.",
        }))
      : defaults.personas,
    process: processCards.length
      ? processCards.map((c) => [c.title, c.body] as [string, string])
      : defaults.process,
  };
  const opening = content?.hero?.body || hub.intro;
  const title =
    content?.hero?.heading || plannedPage(path)?.h1 || `${hub.name} Services`;
  const copy = (field: string, text: string, block = false) =>
    content ? (
      <RichContent content={content} field={field} text={text} block={block} />
    ) : (
      text
    );
  const faqs = saved(/frequently|faq/i)?.faqs?.length
    ? saved(/frequently|faq/i)!.faqs.map((f) => [f.question, f.answer])
    : hub.faqs;
  const delivered = saved(/what we deliver|what you get/i);
  const relatedDefaults = (
    searchHub
      ? [
          "/web-development",
          "/seo-services",
          "/ppc-services",
          "/ui-ux-design",
          "/ecommerce-development",
        ]
      : [
          "/ui-ux-design",
          "/api-development-services",
          "/cloud-services",
          "/ai-development-services",
          "/mobile-app-development",
        ]
  )
    .filter((p) => p !== path)
    .slice(0, 4);
  const relatedCopy = saved(/related services|combined with/i);
  const related = relatedCopy?.links.length
    ? relatedCopy.links.map((l) => l.path)
    : relatedDefaults;
  const work = listing
    .filter(
      (p) =>
        p.kind === "case-study" &&
        `${p.title} ${p.description ?? ""}`
          .toLowerCase()
          .includes(hub.name.split(" ")[0].toLowerCase()),
    )
    .slice(0, 3);
  const industryPaths = [
    "/healthcare-software-development",
    "/fintech-software-development",
    "/logistics-software-development",
    "/retail-software-development",
  ];
  const application = [
    [
      "Healthcare",
      "Appointments, records and role-based access for care workflows.",
    ],
    [
      "Financial services",
      "Account workflows, reporting and controlled access to financial data.",
    ],
    [
      "Logistics",
      "Dispatch, status updates and operational visibility across teams.",
    ],
    [
      "Retail",
      "Customer journeys, stock information and connected order workflows.",
    ],
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      serviceType: hub.name,
      url:
        siteUrl("https://www.netofficials.com") + path,
      provider: {
        "@type": "Organization",
        name: "Netofficials",
        address: { "@type": "PostalAddress", addressCountry: "IN" },
      },
      description: opening,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];
  const sectionTitle = (label: string, heading: string, body?: string) => (
    <div className="hub-heading">
      <span className="hub-eyebrow">{label}</span>
      <h2>{heading}</h2>
      {body && <p>{body}</p>}
    </div>
  );
  return (
    <>
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <link rel="stylesheet" href="/assets/service-hub.css" />
      <link rel="stylesheet" href="/assets/hub-activity-panel.css" />
      <StripeNavigation
        paths={paths}
        preview={preview}
        linkMap={linkMap}
        homeHref={href("/")}
        contactHref="#contact"
      />
      <main id="main" className="service-hub">
        <section className="hub-hero">
          <div className="stripe-wrap">
            <nav className="hub-breadcrumb" aria-label="Breadcrumb">
              <a href={href("/")}>Home</a>
              <span>/</span>
              <a href={href("/services")}>Services</a>
              <span>/</span>
              <span>{hub.name}</span>
            </nav>
            <div className="hub-hero-grid">
              <div>
                <span className="hub-eyebrow">
                  Netofficials · Based in India
                </span>
                <h1>{copy("hero.heading", title)}</h1>
                <p>{copy("hero.body", opening)}</p>
                <div className="hub-actions">
                  <a className="hub-button" href="#contact">
                    Start a Project <span aria-hidden="true">↗</span>
                  </a>
                  <a className="hub-text-link" href="#hub-work">
                    View Related Work <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <HubActivityPanel
                name={hub.name}
                {...hubActivityContent[path]}
                servicesHref="#hub-services"
              />
            </div>
            <ul className="hub-facts">
              {hub.facts.map((f) => (
                <li key={f}>
                  <ServiceIcon variant={hub.facts.indexOf(f)} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="hub-jump">
          <nav className="stripe-wrap" aria-label="On this page">
            <span className="hub-jump-label">Explore this service</span>
            <a href="#hub-services">Services</a>
            <a href="#hub-deliverables">Deliverables</a>
            <a href="#hub-process">Process</a>
            <a href="#hub-stack">Technology</a>
            <a href="#hub-faq">FAQs</a>
          </nav>
        </div>
        <section id="hub-services" className="stripe-wrap hub-section">
          {sectionTitle(
            "Services in this category",
            "Explore our services.",
            "Compare the services below to decide what your project needs.",
          )}
          <div className="hub-directory">
            {children.map((child, i) => {
              const existing = listing.find((p) => p.path === child.url);
              const name = child.h1;
              const directoryCopy = saved(
                /services.*category|services.*offer|services.*provide|service index/i,
              );
              const cardCopy = directoryCopy?.cards.find(
                (c) => c.title === name,
              );
              const desc =
                cardCopy?.body ||
                existing?.description ||
                serviceDescription(child.url, hub.name);
              return (
                <article key={child.url}>
                  <div className="hub-service-icon">
                    <ServiceIcon variant={i % 4} />
                  </div>
                  <div>
                    <h3>
                      <a href={href(child.url)}>{name}</a>
                    </h3>
                    <p>{desc}</p>
                    <div className="hub-use">
                      <span>Typical use</span>
                      {serviceUse(child.url)}
                    </div>
                  </div>
                  <a
                    className="hub-learn"
                    href={href(child.url)}
                    aria-label={`Learn more about ${name}`}
                  >
                    Learn more <span aria-hidden="true">↗</span>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
        <section className="hub-audience">
          <div className="stripe-wrap hub-section">
            {sectionTitle("Who this is for", "Who we work with.")}
            <div className="hub-personas">
              {hub.personas.map((p) => (
                <article key={p.title}>
                  <ServiceIcon variant={1} />
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <div>
                    <span>What we deliver</span>
                    <p>{p.use}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="hub-deliverables"
          className="stripe-wrap hub-section hub-delivery"
        >
          {sectionTitle(
            "What you get",
            "What your team receives.",
            "Agree what will be delivered, how it will be reviewed and what your team needs to take ownership.",
          )}
          <div className="hub-deliverables">
            {(delivered?.items.length ? delivered.items : hub.deliverables).map(
              (d, i) => (
                <article key={d}>
                  <span aria-hidden="true">✓</span>
                  <p>
                    {delivered?.items.length
                      ? copy(`sections.${delivered.id}.items.${i}`, d)
                      : d}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
        <section id="hub-process" className="hub-process-band">
          <div className="stripe-wrap hub-section">
            {sectionTitle(
              "How the work moves",
              "How we deliver your project.",
              searchHub
                ? "Review findings, implementation and reporting with your project team."
                : "Review the scope, design, implementation and release with your project team.",
            )}
            <ol className="hub-process">
              {hub.process.map(([name, body], i) => (
                <li key={name}>
                  <span className="hub-step">
                    <span aria-hidden="true">→</span>
                  </span>
                  <div>
                    <h3>{name}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section id="hub-stack" className="stripe-wrap hub-section">
          {sectionTitle(
            "Technologies we use",
            "Technologies for your project.",
          )}
          <div className="hub-stack">
            {hub.technologies.map(([name, reason, tools]) => (
              <article key={name}>
                <div>
                  <h3>{name}</h3>
                  <p>{reason}</p>
                </div>
                <ul>
                  {tools.map((t) => (
                    <li key={t}>
                      {technologyAsset[t] && (
                        <img
                          src={`/assets/technologies/${technologyAsset[t]}.svg`}
                          alt=""
                          width="38"
                          height="38"
                          loading="lazy"
                        />
                      )}
                      {t !== "AWS" && <span>{t}</span>}
                      {t === "AWS" && <span className="hub-sr-only">AWS</span>}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="hub-engagement">
          <div className="stripe-wrap hub-section">
            {sectionTitle(
              "How to work with us",
              "Choose how we work together.",
            )}
            <div className="hub-models">
              {[
                [
                  "Project-based",
                  `Agree a defined ${hub.name.toLowerCase()} scope, review milestones and delivery responsibilities.`,
                  "A first release or a clearly bounded change.",
                ],
                [
                  "Dedicated team",
                  `Plan an ongoing team around your ${hub.name.toLowerCase()} roadmap and review cadence.`,
                  "A product with a sequence of releases.",
                ],
                [
                  "Staff augmentation",
                  searchHub
                    ? "Add search specialists to your existing marketing team, tools and reporting process."
                    : "Add specific development skills within your existing team, tools and delivery process.",
                  "An established team with a skills gap.",
                ],
              ].map(([name, body, best]) => (
                <article key={name}>
                  <h3>{name}</h3>
                  <p>{body}</p>
                  <div>
                    <span>Best for</span>
                    {best}
                  </div>
                </article>
              ))}
            </div>
            <a className="hub-text-link" href={href("/engagement-models")}>
              Compare engagement models <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
        <section className="stripe-wrap hub-section">
          {sectionTitle(
            "Industry applications",
            "Applications across industries.",
          )}
          <div className="stripe-home hub-common-industries">
            <div className="featured-industries">
              {application.map(([name, body], i) => (
                <a
                  className="industry-feature"
                  href={href(industryPaths[i])}
                  key={name}
                >
                  <ServiceIcon variant={i} />
                  <h3>{name}</h3>
                  <p>{body}</p>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section id="hub-work" className="hub-work-band">
          <div className="stripe-wrap hub-section">
            {sectionTitle(
              "Related work",
              work.length
                ? "Related projects."
                : "Discuss a relevant project example.",
              work.length
                ? "Explore published project information."
                : "Tell us what you are building and ask our team for relevant examples during your project discussion.",
            )}
            <div className="hub-work-grid">
              {work.length ? (
                work.map((w) => (
                  <article key={w.path}>
                    <span className="hub-eyebrow">{hub.name}</span>
                    <h3>{w.title}</h3>
                    <p>{w.description}</p>
                    <a href={href(w.path)}>View project →</a>
                  </article>
                ))
              ) : (
                <div className="hub-work-review">
                  <ServiceIcon variant={0} />
                  <div>
                    <h3>What to review with our team</h3>
                    <p>
                      {searchHub
                        ? "The business goals, changes made, measurement setup and the results available for review."
                        : "The original requirements, relevant integrations, technical decisions and how the application was delivered."}
                    </p>
                  </div>
                  <a href="#contact">
                    Include this in your enquiry{" "}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
        <section id="hub-faq" className="stripe-wrap hub-section hub-faq">
          {sectionTitle("Frequently asked questions", `${hub.name} FAQs.`)}
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="stripe-wrap hub-section hub-related">
          {sectionTitle(
            "Often combined with",
            searchHub
              ? "Related website and search services."
              : "Related development services.",
          )}
          <div>
            {related.map((p) => (
              <a href={href(p)} key={p}>
                <h3>{plannedPage(p)?.h1 || p.slice(1).replaceAll("-", " ")}</h3>
                <p>{relatedReason(p)}</p>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
        <SharedProjectEnquiry service={hub.service} preview={preview} />
      </main>
      <StripeFooter
        paths={paths}
        preview={preview}
        linkMap={linkMap}
        homeHref={href("/")}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
        }}
      />
    </>
  );
}
function ServiceIcon({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {variant === 0 ? (
        <>
          <rect x="6" y="8" width="28" height="24" rx="3" />
          <path d="M6 15h28M14 22l-4 4 4 4m12-8 4 4-4 4m-4-10-4 12" />
        </>
      ) : variant === 1 ? (
        <>
          <rect x="10" y="4" width="20" height="32" rx="4" />
          <path d="M17 9h6m-8 13 4 4 7-8m-9 13h6" />
        </>
      ) : variant === 2 ? (
        <>
          <rect x="13" y="13" width="14" height="14" rx="3" />
          <path d="M17 5v8m6-8v8M17 27v8m6-8v8M5 17h8m-8 6h8m14-6h8m-8 6h8" />
        </>
      ) : (
        <>
          <path d="M10 28h20a6 6 0 0 0 1-12 11 11 0 0 0-21-2 7 7 0 0 0 0 14Z" />
          <path d="M15 22h10m-5-5v10" />
        </>
      )}
    </svg>
  );
}
function serviceDescription(path: string, category: string) {
  if (serviceDescriptions[path]) return serviceDescriptions[path];
  const use = serviceUse(path);
  return `Plan ${
    plannedPage(path)
      ?.h1.toLowerCase()
      .replace(/ services$/, "") || category.toLowerCase()
  } around your users and existing systems. Define the scope, integrations and acceptance criteria for ${use.toLowerCase().replace(/\.$/, "")}.`;
}
function serviceUse(path: string) {
  if (/technical-seo/.test(path))
    return "Crawl, indexing and website structure issues.";
  if (/local-seo/.test(path)) return "Businesses serving specific locations.";
  if (/ecommerce-seo/.test(path))
    return "Product and category search visibility.";
  if (/google-ads/.test(path))
    return "Search campaigns and conversion measurement.";
  if (/ecommerce-development/.test(path))
    return "Product catalogues, checkout and order workflows.";
  if (/design/.test(path)) return "Website layouts and user experience.";
  if (/android/.test(path))
    return "Android devices and platform-specific features.";
  if (/ios|iphone|ipad/.test(path))
    return "Apple devices and platform-specific experiences.";
  if (/flutter|react-native|cross-platform|hybrid/.test(path))
    return "A shared application across multiple platforms.";
  if (/migration|legacy/.test(path))
    return "Moving or improving an existing system.";
  if (/chatbot|language|llm|generative/.test(path))
    return "Language-based search, assistance and content workflows.";
  if (/vision/.test(path)) return "Image and video processing workflows.";
  if (/analytics|science|learning/.test(path))
    return "Data analysis and model-driven workflows.";
  if (/devops|kubernetes|mlops/.test(path))
    return "Repeatable deployments and operational ownership.";
  if (/consult/.test(path)) return "Technical decisions before implementation.";
  if (/erp|crm/.test(path))
    return "Internal records, roles and business operations.";
  if (/api|integration/.test(path))
    return "Connecting applications and business data.";
  return "A focused product or business workflow.";
}
function relatedReason(path: string) {
  if (/seo/.test(path))
    return "Review search visibility, page relevance and indexing.";
  if (/ppc/.test(path))
    return "Connect paid-search campaigns to landing pages and enquiries.";
  if (/web-development/.test(path))
    return "Implement website and landing-page changes.";
  if (/ecommerce/.test(path))
    return "Build the storefront behind product campaigns.";
  if (/design/.test(path))
    return "Clarify user journeys and interfaces before the build.";
  if (/api/.test(path)) return "Connect accounts, data and existing systems.";
  if (/cloud/.test(path))
    return "Plan environments, releases and infrastructure.";
  if (/ai/.test(path))
    return "Add scoped automation with review and evaluation.";
  return "Extend the product into a mobile experience.";
}
