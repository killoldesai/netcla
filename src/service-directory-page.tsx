import type { ReactNode } from "react";
import { StripeNavigation, StripeFooter } from "./stripe-home-chrome";
import { SharedProjectEnquiry } from "./shared-project-enquiry";
import { ServiceDirectoryLink } from "./service-directory-link";
import { technologyAsset } from "./service-hubs";
import {
  buildServices,
  technologyGroups,
  engagementModels,
  developerRoles,
  solutions,
  marketingServices,
  industries,
  serviceDirectorySchema,
} from "./service-directory-data";

const iconPaths: Record<string, ReactNode> = {
  software: (
    <>
      <rect x="4" y="7" width="32" height="26" rx="3" />
      <path d="M4 14h32M9 10h1m4 0h1M15 20l-4 4 4 4m10-8 4 4-4 4M22 18l-4 12" />
    </>
  ),
  mobile: (
    <>
      <rect x="11" y="3" width="18" height="34" rx="4" />
      <path d="M17 7h6m-5 26h4M15 15h10v11H15z" />
    </>
  ),
  ai: (
    <>
      <rect x="10" y="10" width="20" height="20" rx="4" />
      <path d="M15 3v7m10-7v7m-10 20v7m10-7v7M3 15h7m-7 10h7m20-10h7m-7 10h7m-20-5 5-7 5 7-5 7z" />
    </>
  ),
  cloud: (
    <>
      <path d="M10 25a8 8 0 1 1 1-16 10 10 0 0 1 19 3 6 6 0 1 1 0 13H10Z" />
      <path d="M20 25v6M10 31h20M10 31v6m10-6v6m10-6v6" />
    </>
  ),
  design: (
    <>
      <rect x="5" y="5" width="30" height="30" rx="3" />
      <path d="M5 14h30M14 14v21M23 20h7m-7 6h7M9 9h1m4 0h1" />
    </>
  ),
  specialist: (
    <>
      <path d="m20 3 15 9v16l-15 9-15-9V12l15-9ZM5 12l15 9 15-9M20 21v16" />
      <path d="m12 8 15 9" />
    </>
  ),
  web: (
    <>
      <rect x="4" y="7" width="32" height="26" rx="3" />
      <path d="M4 14h32M9 10h1m4 0h1M9 20h12v8H9zm17 0h5m-5 5h5" />
    </>
  ),
  commerce: (
    <>
      <path d="M7 13h26l-3 17H10L7 13ZM13 13V9a7 7 0 0 1 14 0v4" />
      <circle cx="14" cy="35" r="1" />
      <circle cx="27" cy="35" r="1" />
    </>
  ),
  team: (
    <>
      <circle cx="20" cy="11" r="5" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="33" cy="17" r="3" />
      <path d="M10 34v-5a10 10 0 0 1 20 0v5M3 32v-4a6 6 0 0 1 5-6m29 10v-4a6 6 0 0 0-5-6" />
    </>
  ),
  office: (
    <>
      <path d="M9 36V5h22v31M5 36h30M15 11h2m6 0h2m-10 7h2m6 0h2m-10 7h2m6 0h2M17 36v-6h6v6" />
    </>
  ),
  search: (
    <>
      <circle cx="17" cy="17" r="11" />
      <path d="m25 25 10 10M11 21l4-7 5 4 4-8" />
    </>
  ),
  healthcare: (
    <>
      <path d="M14 5h12v9h9v12h-9v9H14v-9H5V14h9V5Z" />
    </>
  ),
  fintech: (
    <>
      <rect x="5" y="9" width="30" height="23" rx="4" />
      <path d="M5 17h30M11 25h8m9 0h2" />
    </>
  ),
  education: (
    <>
      <path d="m3 14 17-9 17 9-17 9-17-9ZM9 18v11c7 5 15 5 22 0V18M37 14v15" />
    </>
  ),
  property: (
    <>
      <path d="m4 18 16-13 16 13M9 16v20h22V16M16 36V25h8v11" />
    </>
  ),
  logistics: (
    <>
      <path d="M3 11h21v20H3V11Zm21 7h8l5 7v6H24M28 18v7h9" />
      <circle cx="10" cy="32" r="4" />
      <circle cx="30" cy="32" r="4" />
    </>
  ),
  demand: (
    <>
      <circle cx="20" cy="20" r="15" />
      <path d="M20 9v11l8 5M4 6h9M4 6v9" />
    </>
  ),
  travel: (
    <>
      <path d="m4 24 12-5V6l4-3 4 3v13l12 5v5l-12-3v9l-4-2-4 2v-9L4 29v-5Z" />
    </>
  ),
  legal: (
    <>
      <path d="M20 6v29M10 35h20M7 12h26M9 12l-6 12h12L9 12Zm22 0-6 12h12l-6-12Z" />
      <circle cx="20" cy="8" r="2" />
    </>
  ),
  insurance: (
    <>
      <path d="M20 4 34 9v11c0 8-8 14-14 17C14 34 6 28 6 20V9l14-5Z" />
      <path d="m13 20 5 5 10-11" />
    </>
  ),
  manufacturing: (
    <>
      <path d="M4 36V16l10 6V12l10 6V6h10v30H4ZM24 6h10M10 29h3m5 0h3m5 0h3" />
    </>
  ),
};
function DirectoryIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {iconPaths[name] ?? iconPaths.software}
    </svg>
  );
}
function SectionHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="index-heading">
      <div>
        <span className="hub-eyebrow">{label}</span>
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </div>
  );
}
const industryIcons = [
  "healthcare",
  "fintech",
  "education",
  "property",
  "logistics",
  "demand",
  "commerce",
  "travel",
  "legal",
  "team",
  "insurance",
  "manufacturing",
];
export function ServiceDirectoryPage({
  preview = false,
  linkMap = {},
  paths = [],
}: {
  preview?: boolean;
  linkMap?: Record<string, string>;
  paths?: string[];
}) {
  const href = (path: string) => {
    const [page, fragment] = path.split("#");
    return (linkMap[page] ?? page) + (fragment ? `#${fragment}` : "");
  };
  return (
    <>
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <link rel="stylesheet" href="/assets/service-hub.css" />
      <link rel="stylesheet" href="/assets/service-directory.css" />
      <StripeNavigation
        paths={paths}
        preview={preview}
        linkMap={linkMap}
        homeHref={href("/")}
        contactHref="#contact"
      />
      <main id="main" className="service-hub services-index">
        <section className="index-hero">
          <div className="stripe-wrap">
            <nav className="hub-breadcrumb" aria-label="Breadcrumb">
              <a href={href("/")}>Home</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Services</span>
            </nav>
            <div className="index-hero-copy">
              <span className="hub-eyebrow">
                Netofficials · Service directory
              </span>
              <h1>
                Software Development,
                <br />
                <span>Mobile, AI</span> and
                <br />
                Digital Marketing Services
              </h1>
              <p>
                Every service Netofficials offers — from custom software and
                mobile apps to AI automation, cloud infrastructure and SEO — in
                one place.
              </p>
              <nav className="index-jumps" aria-label="Service groups">
                <a href="#build">
                  Build & Engineer <span aria-hidden="true">↓</span>
                </a>
                <a href="#hire">
                  Hire Developers <span aria-hidden="true">↓</span>
                </a>
                <a href="#market">
                  Grow & Market <span aria-hidden="true">↓</span>
                </a>
              </nav>
            </div>
          </div>
        </section>
        <section
          className="index-intro"
          aria-label="Service directory at a glance"
        >
          <div className="stripe-wrap index-intro-grid">
            {[
              {
                target: "build",
                icon: "software",
                count: `${buildServices.length} service areas`,
                name: "Build & Engineer",
                body: "Software, mobile, AI, cloud and specialist development.",
              },
              {
                target: "hire",
                icon: "team",
                count: `${developerRoles.length} role pages`,
                name: "Hire Developers",
                body: "Explore engineering, design and infrastructure roles.",
              },
              {
                target: "market",
                icon: "search",
                count: `${marketingServices.length} service pages`,
                name: "Grow & Market",
                body: "Organic search, Google Ads and eCommerce SEO.",
              },
            ].map((group) => (
              <a key={group.target} href={`#${group.target}`}>
                <DirectoryIcon name={group.icon} />
                <div>
                  <span className="index-count">{group.count}</span>
                  <h2>
                    {group.name} <span aria-hidden="true">↗</span>
                  </h2>
                  <p>{group.body}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
        <section id="build" className="index-section stripe-wrap">
          <SectionHeading label="Build & Engineer" title="What we build">
            Explore development services for a new product, an existing
            application or the infrastructure behind it.
          </SectionHeading>
          <div className="index-build-grid">
            {buildServices.map((service, i) => (
              <article
                key={service.name}
                className={`index-service ${i < 4 ? "index-service-featured" : "index-service-supporting"} index-service-${i}`}
              >
                <div className="index-card-top">
                  <span className="index-tag">{service.tag}</span>
                  <div className="index-icon">
                    <DirectoryIcon name={service.icon} />
                  </div>
                </div>
                <h3>
                  <ServiceDirectoryLink
                    href={href(service.path)}
                    service={service.path}
                    preview={preview}
                  >
                    {service.name}
                  </ServiceDirectoryLink>
                </h3>
                <p>{service.description}</p>
                <ul>
                  {service.links.map((child) => (
                    <li key={child.path}>
                      <a href={href(child.path)}>{child.name}</a>
                    </li>
                  ))}
                </ul>
                <ServiceDirectoryLink
                  className="index-explore"
                  href={href(service.path)}
                  service={service.path}
                  preview={preview}
                  label={`Explore ${service.name}`}
                >
                  Explore <span aria-hidden="true">↗</span>
                </ServiceDirectoryLink>
              </article>
            ))}
          </div>
        </section>
        <section id="technologies" className="index-technology index-section">
          <div className="stripe-wrap">
            <SectionHeading label="Tech stack" title="Find your technology.">
              Browse dedicated development pages by language, framework,
              platform or infrastructure tool.
            </SectionHeading>
            <div className="index-tech-groups">
              {technologyGroups.map((group, i) => (
                <div className="index-tech-group" key={group.name}>
                  <h3>
                    <DirectoryIcon
                      name={
                        ["web", "software", "mobile", "commerce", "cloud"][i]
                      }
                    />
                    {group.name}
                  </h3>
                  <ul>
                    {group.links.map((tech) => {
                      const asset =
                        technologyAsset[
                          tech.name === "React.js" ? "React" : tech.name
                        ];
                      return (
                        <li key={tech.path}>
                          <a href={href(tech.path)}>
                            {asset && (
                              <img
                                src={`/assets/technologies/${asset}.svg`}
                                alt=""
                                width="23"
                                height="23"
                                loading="lazy"
                              />
                            )}
                            {tech.name}
                            <span aria-hidden="true">↗</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="hire" className="index-hire index-section">
          <div className="stripe-wrap">
            <SectionHeading
              label="Hire Developers"
              title="Add the skills your team needs."
            >
              Choose an engagement model, then explore the engineering and
              design roles relevant to your project.
            </SectionHeading>
            <div className="index-engagements">
              {engagementModels.map((model) => (
                <article key={model.path}>
                  <div className="index-icon">
                    <DirectoryIcon name={model.icon} />
                  </div>
                  <h3>
                    <a href={href(model.path)}>{model.name}</a>
                  </h3>
                  <p>{model.description}</p>
                  <div className="index-fit">
                    <span>Consider for</span>
                    {model.fit}
                  </div>
                  <a
                    className="index-explore"
                    href={href(model.path)}
                    aria-label={`Explore ${model.name}`}
                  >
                    Explore model <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
            <div className="index-roles-heading">
              <h3>Browse developer roles</h3>
              <a href={href("/hire-developers")}>
                View all roles with details <span aria-hidden="true">↗</span>
              </a>
            </div>
            <ul className="index-role-grid">
              {developerRoles.map((role) => (
                <li key={role.path}>
                  <a href={href(role.path)}>
                    {role.name}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section id="solutions" className="index-section stripe-wrap">
          <SectionHeading
            label="Software solutions"
            title="Start with your business goal."
          >
            You don’t need to choose a technology first. Find a starting point
            for the product or business problem you’re working on.
          </SectionHeading>
          <div className="index-solutions">
            {solutions.map((solution) => (
              <a href={href(solution.path)} key={solution.path}>
                <h3>
                  {solution.name}
                  <span aria-hidden="true">↗</span>
                </h3>
                <p>{solution.description}</p>
              </a>
            ))}
          </div>
        </section>
        <section id="market" className="index-market index-section">
          <div className="stripe-wrap">
            <SectionHeading
              label="Grow & Market"
              title="Search services for your business."
            >
              Explore organic search and paid campaigns alongside the
              development work your website may need.
            </SectionHeading>
            <div className="index-marketing-grid">
              {marketingServices.map((service) => (
                <a key={service.path} href={href(service.path)}>
                  <span className="index-small-arrow" aria-hidden="true">
                    ↗
                  </span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section id="industries" className="index-section stripe-wrap">
          <SectionHeading
            label="Industries"
            title="Explore software for your sector."
          >
            Find application ideas and service pages organised around your
            industry’s workflows.
          </SectionHeading>
          <div className="index-industry-grid">
            {industries.map((industry, i) => (
              <a href={href(industry.path)} key={industry.path}>
                <DirectoryIcon name={industryIcons[i]} />
                <div>
                  <h3>
                    {industry.name}
                    <span aria-hidden="true">↗</span>
                  </h3>
                  <p>{industry.description}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="index-delivery-link">
            Want to understand the delivery process?{" "}
            <a href={href("/how-we-work")}>
              See how we work <span aria-hidden="true">↗</span>
            </a>
          </p>
        </section>
        <SharedProjectEnquiry
          service="Help defining the scope"
          preview={preview}
        />
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
          __html: JSON.stringify(
            serviceDirectorySchema(
              process.env.SITE_URL ?? "https://netofficials.com",
            ),
          ).replaceAll("<", "\\u003c"),
        }}
      />
    </>
  );
}
