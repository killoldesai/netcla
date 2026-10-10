import { TrackedLink } from "./v3-interactions";
import { NewsletterForm } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { mediaPath } from "./media-path";
import { BLOG_TOPICS, topicFor } from "./blog-topics";
import type { BlogPost } from "./blog-types";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The guides index: the intro copy is generated, the guides themselves come from the database so the page always
// matches what is published. A featured latest guide, then the guides grouped by topic. Nothing is numbered.
// Own layout and stylesheet (/assets/blog-index.css).

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

function Meta({ post }: { post: BlogPost }) {
  const date = dateLabel(post.date);
  return (
    <p className="bi-meta">
      {date && <span>{date}</span>}
      <span>{post.readMinutes} min read</span>
    </p>
  );
}

function Thumb({ post, large = false }: { post: BlogPost; large?: boolean }) {
  if (!post.image) return <div className={"bi-thumb is-empty" + (large ? " is-large" : "")} aria-hidden="true" />;
  return (
    <div className={"bi-thumb" + (large ? " is-large" : "")}>
      <img src={mediaPath(post.image)} alt={post.image.alt} width={post.image.width} height={post.image.height} loading={large ? "eager" : "lazy"} />
    </div>
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
  const groups = BLOG_TOPICS.map((t, i) => ({ topic: t, blurb: topics[`topic_${i + 1}_blurb`] ?? "", items: rest.filter((p) => topicFor(p.path).id === t.id) })).filter((g) => g.items.length > 0);
  const counts = BLOG_TOPICS.map((t) => ({ topic: t, n: posts.filter((p) => topicFor(p.path).id === t.id).length })).filter((c) => c.n > 0);

  return (
    <>
      <section id="hero" className="bi-hero">
        <div className="bi-wrap">
          <nav className="bi-crumbs" aria-label="Breadcrumb">
            <ol>
              {trail.map((c, i) =>
                i === trail.length - 1 ? <li key={c.path} aria-current="page">{c.label}</li> : <li key={c.path}><a href={go(c.path)}>{c.label}</a></li>,
              )}
            </ol>
          </nav>
          <span className="bi-tag">{hero.tag_pill || "Guides"}</span>
          <h1 className="bi-h1">{hero.h1 || content.title}</h1>
          <p className="bi-lead">{hero.subheadline}</p>
          {counts.length > 1 && (
            <nav className="bi-topics-nav" aria-label="Topics">
              {counts.map((c) => (
                <a key={c.topic.id} href={`#topic-${c.topic.id}`}>
                  {c.topic.name}
                  <span>{c.n}</span>
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      {posts.length === 0 && (
        <section className="bi-section">
          <div className="bi-wrap">
            <p className="bi-empty">New guides are being prepared. Check back soon, or subscribe below to be told when the first ones are published.</p>
          </div>
        </section>
      )}

      {featured && (
        <section id="featured" className="bi-section bi-featured-band">
          <div className="bi-wrap">
            <a className="bi-featured" href={go(featured.path)}>
              <Thumb post={featured} large />
              <div className="bi-featured-copy">
                <span className="bi-kicker">Latest guide</span>
                {featured.tag && <span className="bi-pill">{featured.tag}</span>}
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <Meta post={featured} />
                <span className="bi-read">Read the guide <span aria-hidden="true">→</span></span>
              </div>
            </a>
          </div>
        </section>
      )}

      {groups.map((g, i) => (
        <section key={g.topic.id} id={`topic-${g.topic.id}`} className={"bi-section " + (i % 2 === 0 ? "is-tint" : "")}>
          <div className="bi-wrap">
            <header className="bi-head">
              {i === 0 && topics.section_label && <p className="bi-eyebrow">{topics.section_label}</p>}
              <h2 className="bi-h2">{g.topic.name}</h2>
              {g.blurb && <p className="bi-intro">{g.blurb}</p>}
            </header>
            <ul className="bi-grid">
              {g.items.map((p) => (
                <li key={p.path}>
                  <a className="bi-card" href={go(p.path)}>
                    <Thumb post={p} />
                    <div className="bi-card-copy">
                      {p.tag && <span className="bi-pill">{p.tag}</span>}
                      <h3>{p.title}</h3>
                      <p>{p.description}</p>
                      <Meta post={p} />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {by("newsletter") && (
        <section id="newsletter" className="bi-section">
          <div className="bi-wrap">
            <div className="bi-news">
              <div>
                {news.section_label && <p className="bi-eyebrow">{news.section_label}</p>}
                <h2 className="bi-h2">{news.heading}</h2>
                {news.subheadline && <p className="bi-intro">{news.subheadline}</p>}
              </div>
              <div className="bi-news-form">
                <NewsletterForm enabled={newsletterEnabled && !preview} />
                {news.privacy_note && <p className="bi-privacy">{news.privacy_note}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {by("cta-banner") && (
        <section id="cta-banner" className="bi-cta">
          <div className="bi-wrap bi-cta-grid">
            <div>
              <h2>{cta.heading}</h2>
              <p>{cta.subheadline}</p>
            </div>
            <div className="bi-actions">
              <TrackedLink href={contact} event="consultation_click" service="Guides" className="bi-btn">
                {cta.cta_primary_label || "Start a conversation"} <span aria-hidden="true">↗</span>
              </TrackedLink>
              {cta.cta_secondary_label && <a className="bi-link" href={go(cta.cta_secondary_url || "/how-we-work")}>{cta.cta_secondary_label} →</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
