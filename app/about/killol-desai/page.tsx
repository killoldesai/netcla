import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteUrl } from "@/site-url";
import { company, companyProfiles, founderPage } from "@/company";
import { blogPosts } from "@/blog-posts";
import { publishedPaths } from "@/pages";
import { StripeNavigation, StripeFooter } from "@/stripe-home-chrome";
import { defaultShareImage } from "@/seo-policy";

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
    <div className="v3-site">
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <link rel="stylesheet" href="/assets/v3-pages.css" />
      <link rel="stylesheet" href="/assets/site-unified.css?v=20261008" />
      <StripeNavigation paths={paths} />
      <main id="main" className="author-page">
        <section className="v3-section">
          <div className="v3-wrap">
            <nav aria-label="Breadcrumb" className="author-crumbs">
              <a href="/">Home</a> / <a href="/about">About</a> / <span>{founder.name}</span>
            </nav>
            <p className="author-role">{founder.jobTitle}, Netofficials</p>
            <h1>{founder.name}</h1>
            {founder.bio.map((paragraph) => (
              <p key={paragraph} className="author-bio">
                {paragraph}
              </p>
            ))}
            <h2>Expertise</h2>
            <ul className="author-list">
              {founder.knowsAbout.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <h2>Find {founder.name.split(" ")[0]} online</h2>
            <ul className="author-list">
              {founder.sameAs.map((url) => (
                <li key={url}>
                  <a href={url} rel="me noopener noreferrer">
                    {founder.name} on LinkedIn
                  </a>
                </li>
              ))}
              {company.profiles.map((url) => (
                <li key={url}>
                  <a href={url} rel="noopener noreferrer">
                    Netofficials on LinkedIn
                  </a>
                </li>
              ))}
            </ul>
            {posts.length > 0 && (
              <>
                <h2>Guides by {founder.name}</h2>
                <ul className="author-list">
                  {posts.map((post) => (
                    <li key={post.path}>
                      <a href={post.path}>{post.title}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="author-more">
              Read more about <a href="/about">the company</a> or <a href="/contact">get in touch</a>.
            </p>
          </div>
        </section>
      </main>
      <StripeFooter paths={paths} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }}
      />
    </div>
  );
}
