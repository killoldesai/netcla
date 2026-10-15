import { NewsletterForm, TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { mediaPath } from "./media-path";
import { BLOG_TOPICS, topicFor } from "./blog-topics";
import { company, founderPage } from "./company";
import { Breadcrumbs, Icon } from "./site/ui";
import type { BlogPost } from "./blog-types";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The guides index: the intro copy is generated, the guides themselves come from the database so the page always
// matches what is published. A featured latest guide, then the guides grouped by topic. Nothing is numbered.
// Markup follows html-prototype/blog.html; styles live in public/assets/nx/pages/blog-index.css.

/** True for content generated from the guides-index spec; the older article-style draft keeps the legacy renderer. */
export function isBlogIndexContent(content: Content, path: string) {
  return path === "/blog" && !!content.pageSections?.some((s) => s.id === "topics" && !s.omitted);
}

type Props = {
  content: Content;
  path: string;
  paths: string[];
  posts?: BlogPost[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  newsletterEnabled?: boolean;
};

/** Fixed locale and zone so the server and the browser print the same date. */
const dateLabel = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

/** Hero image of a guide, the image's own width and height so it is never stretched. Nothing is drawn when a guide has none. */
function Media({ post, large = false }: { post: BlogPost; large?: boolean }) {
  if (!post.image) return null;
  return (
    <figure className={"gx-media" + (large ? " gx-media--large" : "")}>
      <img
        src={mediaPath(post.image)}
        alt={post.image.alt}
        width={post.image.width}
        height={post.image.height}
        loading={large ? "eager" : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

/** Topic badge, then the guide's own tag pill when it has one. */
function Badges({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <div className="gx-badges">
      <span className={"nx-badge" + (large ? " nx-badge--indigo" : "")}>{topicFor(post.path).name}</span>
      {post.tag && <span className="nx-badge nx-badge--outline">{post.tag}</span>}
    </div>
  );
}

/** Author, publication date and read time. The author is the company founder, as on the guide pages. */
function Byline({ post, go }: { post: BlogPost; go: (url: string) => string }) {
  const date = dateLabel(post.date);
  return (
    <p className="gx-byline">
      By <a href={go(founderPage)}>{company.founder.name}</a>
      {date && (
        <>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.date}>{date}</time>
        </>
      )}
      <span aria-hidden="true"> · </span>
      {post.readMinutes} min read
    </p>
  );
}

export function BlogIndexSections({ content, path, posts = [], preview = false, linkMap = {}, newsletterEnabled = false }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const hero = f("hero");
  const topics = f("topics");
  const news = f("newsletter");
  const cta = f("cta-banner");
  const trail = breadcrumbs(path, hero.h1 || content.title);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Help defining the scope");

  const featured = posts[0];
  const rest = posts.slice(1);
  const countFor = (id: string) => posts.filter((p) => topicFor(p.path).id === id).length;
  const groups = BLOG_TOPICS.map((t, i) => ({ topic: t, blurb: topics[`topic_${i + 1}_blurb`] ?? "", items: rest.filter((p) => topicFor(p.path).id === t.id) })).filter((g) => g.items.length > 0);

  // Sub-nav: the featured guide, each topic that has cards (with every guide of that topic counted), the newsletter.
  const navLinks = [
    ...(featured ? [{ href: "#featured", label: "Featured guide", count: undefined as number | undefined }] : []),
    ...groups.map((g) => ({ href: `#topic-${g.topic.id}`, label: g.topic.name, count: countFor(g.topic.id) as number | undefined })),
    ...(by("newsletter") ? [{ href: "#newsletter", label: "Newsletter", count: undefined as number | undefined }] : []),
  ];

  return (
    <>
      <section id="hero" className="page-hero gx-hero">
        <div className="container">
          <Breadcrumbs items={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))} />
          <div className="gx-hero__copy">
            <span className="tag-pill">{hero.tag_pill || "Guides"}</span>
            <h1>{hero.h1 || content.title}</h1>
            {hero.subheadline && <p className="lead">{hero.subheadline}</p>}
          </div>
        </div>
      </section>

      {navLinks.length > 0 && (
        <nav className="subnav" aria-label="On this page" data-subnav>
          <div className="container">
            <ul className="subnav__list">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>
                    {l.label}
                    {l.count !== undefined && <span className="gx-count">{l.count}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {posts.length === 0 && (
        <section className="section">
          <div className="container">
            <p className="lead gx-empty">New guides are being prepared. Check back soon, or subscribe below to be told when the first ones are published.</p>
          </div>
        </section>
      )}

      {featured && (
        <section id="featured" className="section">
          <div className="container">
            <article className="gx-featured nx-reveal">
              <Media post={featured} large />
              <div className="gx-featured__copy">
                <span className="eyebrow">Latest guide</span>
                <Badges post={featured} large />
                <h2 className="gx-featured__title">
                  <a href={go(featured.path)}>{featured.title}</a>
                </h2>
                <p className="gx-featured__text">{featured.description}</p>
                <Byline post={featured} go={go} />
                <span className="gx-read">
                  Read the guide <Icon name="arrow-right" size={18} className="nx-icon" />
                </span>
              </div>
            </article>
          </div>
        </section>
      )}

      {groups.length > 0 && (
        <section id="topics" className="section section--white">
          <div className="container">
            {(topics.section_label || topics.heading || topics.intro) && (
              <div className="section-head nx-reveal">
                <div>
                  {topics.section_label && <span className="eyebrow">{topics.section_label}</span>}
                  {topics.heading && <h2 className="h-section">{topics.heading}</h2>}
                </div>
                {topics.intro && <p className="lead">{topics.intro}</p>}
              </div>
            )}
            {groups.map((g) => (
              <div key={g.topic.id} className="gx-group" id={`topic-${g.topic.id}`}>
                <header className="gx-group__head">
                  <h2 className="gx-group__title">{g.topic.name}</h2>
                  {g.blurb && <p className="gx-group__intro">{g.blurb}</p>}
                </header>
                <ul className="gx-grid">
                  {g.items.map((p) => (
                    <li key={p.path}>
                      <article className="gx-card nx-reveal">
                        <Media post={p} />
                        <Badges post={p} />
                        <h3 className="gx-card__title">
                          <a href={go(p.path)}>{p.title}</a>
                        </h3>
                        <p className="gx-card__text">{p.description}</p>
                        <Byline post={p} go={go} />
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {by("newsletter") && (
        <section id="newsletter" className="section">
          <div className="container">
            <div className="gx-news nx-reveal">
              <div>
                {news.section_label && <span className="eyebrow">{news.section_label}</span>}
                {news.heading && <h2 className="h-section">{news.heading}</h2>}
                {news.subheadline && <p className="lead">{news.subheadline}</p>}
              </div>
              <div className="gx-form">
                <NewsletterForm enabled={newsletterEnabled && !preview} />
                {news.privacy_note && <p className="gx-privacy">{news.privacy_note}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="section">
          <div className="container">
            <div className="nx-cta nx-cta--indigo gx-cta nx-reveal">
              <div>
                <h2 className="nx-cta__title">{cta.heading}</h2>
                <p className="nx-cta__desc">{cta.subheadline}</p>
              </div>
              <div className="gx-cta__actions">
                <TrackedLink href={contact} event="consultation_click" service="Guides" className="nx-btn nx-btn--lime nx-btn--lg">
                  <span>{cta.cta_primary_label || "Start a conversation"}</span>
                  <Icon name="arrow-right" size={18} className="nx-icon nx-btn__arrow" />
                </TrackedLink>
                {cta.cta_secondary_label && (
                  <a className="gx-cta__link" href={go(cta.cta_secondary_url || "/how-we-work")}>
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
