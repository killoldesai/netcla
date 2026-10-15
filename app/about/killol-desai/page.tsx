import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteUrl } from "@/site-url";
import { company, companyProfiles, founderPage } from "@/company";
import { blogPosts } from "@/blog-posts";
import { publishedPaths } from "@/pages";
import { defaultShareImage } from "@/seo-policy";
import { mediaPath } from "@/media-path";
import { topicFor } from "@/blog-topics";
import { NxShell } from "@/site/shell";
import { ArrowLink, Breadcrumbs, HeroArt, Icon, SectionHead } from "@/site/ui";
import { FounderArt } from "@/site/art/founder-art";

// Founder profile, redesigned from html-prototype/founder.html. Styles: public/assets/nx/pages/founder.css.

export const dynamic = "force-dynamic";

const founder = company.founder;
const title = `${founder.name}, Founder of Netofficials`;
const description = `${founder.name} founded Netofficials in ${company.foundingYear}. Read his background and the guides he has written on software development, cost and search marketing.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: founderPage },
  openGraph: {
    title,
    description,
    url: founderPage,
    siteName: "Netofficials",
    type: "profile",
    images: [defaultShareImage],
  },
  twitter: { card: "summary_large_image", title, description, images: [defaultShareImage.url] },
};

/** Fixed locale and zone so the server and the browser print the same date. */
const dateLabel = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

export default async function Page() {
  if (!process.env.DATABASE_URL) notFound();
  const base = siteUrl();
  const [paths, posts] = await Promise.all([publishedPaths().then((rows) => rows.map((r) => r.path)), blogPosts()]);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": base + founderPage + "#content",
        url: base + founderPage,
        name: title,
        description,
        inLanguage: "en",
        mainEntity: { "@id": base + "/#founder" },
        isPartOf: { "@id": base + "/#website" },
      },
      {
        "@type": "Person",
        "@id": base + "/#founder",
        name: founder.name,
        url: base + founderPage,
        jobTitle: founder.jobTitle,
        description: founder.summary,
        worksFor: { "@id": base + "/#organization" },
        knowsAbout: founder.knowsAbout,
        sameAs: founder.sameAs,
      },
      {
        "@type": "Organization",
        "@id": base + "/#organization",
        name: "Netofficials",
        url: base,
        foundingDate: company.foundingYear,
        founder: { "@id": base + "/#founder" },
        sameAs: companyProfiles(),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: "About", item: base + "/about" },
          { "@type": "ListItem", position: 3, name: founder.name, item: base + founderPage },
        ],
      },
      { "@type": "WebSite", "@id": base + "/#website", name: "Netofficials", url: base, inLanguage: "en" },
    ],
  };
  return (
    <NxShell page="founder" paths={paths}>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: founder.name }]} />
          <div className="hero__grid">
            <div>
              <span className="tag-pill">About</span>
              <p className="founder-role">{founder.jobTitle}, Netofficials</p>
              <h1>{founder.name}</h1>
              <p className="lead">{founder.summary}</p>
              <ul className="founder-facts">
                <li>
                  <Icon name="check" size={20} />
                  <span>Founded Netofficials in {company.foundingYear}</span>
                </li>
                <li>
                  <Icon name="user" size={20} />
                  <span>Expertise in {founder.knowsAbout.join(" and ")}</span>
                </li>
              </ul>
              <div className="hero__actions">
                {founder.sameAs.map((url) => (
                  <a key={url} className="nx-arrowlink" href={url} target="_blank" rel="me noopener noreferrer">
                    <span>{founder.name} on LinkedIn</span>
                    <Icon name="external" size={18} />
                  </a>
                ))}
                <ArrowLink href="/contact">Start a project</ArrowLink>
              </div>
            </div>
            <HeroArt fallback={<FounderArt />} priority className="hero__art founder-art" />
          </div>
        </div>
      </section>

      <section className="section" id="biography">
        <div className="container">
          <SectionHead eyebrow="Biography" title={`${founder.name}'s background`} />
          <div className="founder-bio nx-reveal">
            {founder.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white" id="expertise">
        <div className="container">
          <SectionHead eyebrow="Expertise" title="Areas of expertise" />
          <ul className="founder-chips nx-reveal" aria-label="Areas of expertise">
            {founder.knowsAbout.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section" id="guides">
          <div className="container">
            <SectionHead eyebrow="Guides" title={`Guides by ${founder.name}`} />
            <div className="sk-cards">
              {posts.map((post, i) => {
                const date = dateLabel(post.date);
                return (
                  <article key={post.path} className="sk-card nx-reveal" style={{ ["--nx-delay" as string]: `${(i % 3) * 100}ms` }}>
                    {post.image && (
                      <figure className="founder-guide__media">
                        <img
                          src={mediaPath(post.image)}
                          alt={post.image.alt}
                          width={post.image.width}
                          height={post.image.height}
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>
                    )}
                    <span className="nx-badge">
                      <span className="nx-badge__dot" aria-hidden="true" />
                      {topicFor(post.path).name}
                    </span>
                    <h3 className="sk-card__title">
                      <a href={post.path} className="founder-guide">
                        {post.title}
                      </a>
                    </h3>
                    <p className="sk-card__label">
                      {date && <time dateTime={post.date}>{date}</time>}
                      {date && " · "}
                      {post.readMinutes} min read
                    </p>
                  </article>
                );
              })}
            </div>
            <div className="founder-more nx-reveal">
              <ArrowLink href="/blog">See all guides</ArrowLink>
            </div>
          </div>
        </section>
      )}

      <section className="section section--white" id="work">
        <div className="container">
          <SectionHead eyebrow="Work with us" title="Work with Netofficials" />
          <div className="more nx-reveal">
            <a href="/about">
              <div>
                <strong>About</strong>
                <span>Read more about the company</span>
              </div>
              <Icon name="arrow-right" size={20} />
            </a>
            <a href="/contact">
              <div>
                <strong>Contact</strong>
                <span>Get in touch about your project</span>
              </div>
              <Icon name="arrow-right" size={20} />
            </a>
            {company.profiles.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <div>
                  <strong>Netofficials on LinkedIn</strong>
                  <span>Company profile</span>
                </div>
                <Icon name="external" size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }}
      />
    </NxShell>
  );
}
