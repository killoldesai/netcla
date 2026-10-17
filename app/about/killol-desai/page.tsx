import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteUrl } from "@/site-url";
import { company, companyProfiles, founderPage } from "@/company";
import { blogPosts } from "@/blog-posts";
import { publishedPaths } from "@/pages";
import { defaultShareImage } from "@/seo-policy";
import { mediaPath } from "@/media-path";
import { topicFor } from "@/blog-topics";
import { V2Shell } from "@/site/v2/shell";
import { V2Art, V2Crumbs, V2Icon, type V2IconName } from "@/site/v2/ui";

// Founder profile, redesigned from html-prototype/v2/founder.html. Styles: public/assets/v2/pages/founder.css.
// The founder photo slot is not shown: there is no approved photo field for it, and no likeness is generated.

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

/** Line icon for an area of expertise, by its topic. */
const topicIcon = (topic: string): V2IconName =>
  /search|seo/i.test(topic) ? "search" : /manage/i.test(topic) ? "users" : /develop|software|code/i.test(topic) ? "code" : /cost|plan|budget/i.test(topic) ? "calendar" : "spark";

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
    <V2Shell page="founder" paths={paths}>
      <section className="sec sec--tight" aria-labelledby="founder-h1">
        <div className="wrap">
          <V2Crumbs trail={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: founder.name }]} />
          <div className="feature about-founder-feature">
            <div>
              <p className="eyebrow">
                {founder.jobTitle}, Netofficials
              </p>
              <h1 id="founder-h1">{founder.name}</h1>
              <p className="lead">{founder.summary}</p>
              <ul className="ticks">
                <li>Founded Netofficials in {company.foundingYear}</li>
                <li>Expertise in {founder.knowsAbout.join(" and ")}</li>
              </ul>
              <div className="hero__acts about-founder-acts">
                {founder.sameAs.map((url) => (
                  <a key={url} className="btn btn--ghost" href={url} target="_blank" rel="me noopener noreferrer">
                    {founder.name} on LinkedIn <V2Icon name="linkedin" />
                  </a>
                ))}
                <a className="btn btn--grad" href="/contact">
                  Start a project <V2Icon name="arrow" />
                </a>
              </div>
            </div>
            <div className="feature__img">
              <V2Art fallback="scene-founder" fallbackAlt="Illustrated founder desk with no person at it" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--cloud" id="biography" aria-labelledby="bio-h">
        <div className="wrap">
          <div className="sec__head sec__head--left rv">
            <p className="eyebrow">Biography</p>
            <h2 className="h2" id="bio-h">{`${founder.name}'s background`}</h2>
          </div>
          <div className="prose about-bio rv">
            {founder.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="expertise" aria-labelledby="exp-h">
        <div className="wrap">
          <div className="sec__head rv">
            <p className="eyebrow">Expertise</p>
            <h2 className="h2" id="exp-h">Areas of expertise</h2>
          </div>
          <div className="skills about-chips rv" aria-label="Areas of expertise">
            {founder.knowsAbout.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
          <div className="catgrid catgrid--2 about-expertise">
            {founder.knowsAbout.map((topic, i) => (
              <div key={topic} className="cat rv" style={{ transitionDelay: `${(i % 4) * 0.1}s` }}>
                <span className="about-ico" aria-hidden="true">
                  <V2Icon name={topicIcon(topic)} size={28} />
                </span>
                <h3>{topic}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="sec sec--cloud" id="guides" aria-labelledby="gd-h">
          <div className="wrap">
            <div className="sec__head rv">
              <p className="eyebrow">Guides</p>
              <h2 className="h2" id="gd-h">{`Guides by ${founder.name}`}</h2>
            </div>
            <div className="bgrid">
              {posts.map((post, i) => {
                const date = dateLabel(post.date);
                return (
                  <a key={post.path} className="bcard rv" href={post.path} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                    {post.image && (
                      <span className="bcard__img">
                        <img src={mediaPath(post.image)} alt={post.image.alt} width={post.image.width} height={post.image.height} loading="lazy" decoding="async" />
                      </span>
                    )}
                    <span className="bcard__tag">{topicFor(post.path).name}</span>
                    <h3>{post.title}</h3>
                    <p>
                      {date && <time dateTime={post.date}>{date}</time>}
                      {date && " · "}
                      {post.readMinutes} min read
                    </p>
                  </a>
                );
              })}
            </div>
            <p className="about-more rv">
              <a className="tlink" href="/blog">
                <span>See all guides</span>
                <V2Icon name="arrow" />
              </a>
            </p>
          </div>
        </section>
      )}

      <section className="sec" id="work" aria-labelledby="wk-h">
        <div className="wrap">
          <div className="sec__head rv">
            <p className="eyebrow">Work with us</p>
            <h2 className="h2" id="wk-h">Work with Netofficials</h2>
          </div>
          <div className="catgrid">
            <a className="cat rv" href="/about">
              <h3>About</h3>
              <p>Read more about the company</p>
              <span className="more" aria-hidden="true">
                <V2Icon name="arrow" />
              </span>
            </a>
            <a className="cat rv" href="/contact" style={{ transitionDelay: "0.1s" }}>
              <h3>Contact</h3>
              <p>Get in touch about your project</p>
              <span className="more" aria-hidden="true">
                <V2Icon name="arrow" />
              </span>
            </a>
            {company.profiles.map((url) => (
              <a key={url} className="cat rv" href={url} target="_blank" rel="noopener noreferrer" style={{ transitionDelay: "0.2s" }}>
                <h3>Netofficials on LinkedIn</h3>
                <p>Company profile</p>
                <span className="more" aria-hidden="true">
                  <V2Icon name="external" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }}
      />
    </V2Shell>
  );
}
