import { NewsletterForm } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { mediaPath } from "./media-path";
import { BLOG_TOPICS, topicFor } from "./blog-topics";
import { company, founderPage } from "./company";
import { V2Crumbs, V2Icon, v2img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { BlogPost } from "./blog-types";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The guides index (html-prototype/v2/blog.html): a featured latest guide, then every other guide in one grid that
// the topic filters narrow. The intro copy is generated, the guides come from the database so the page always matches
// what is published. Nothing is numbered. Styles: html-prototype/v2/css/pages/blog.css and css/live/blog.css.
// The closing CTA band comes from the V3Page shell, so the index does not render its own cta-banner.

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

/**
 * Shipped thumbnail (html-prototype/v2/img/th-*) for a guide without an image of its own, chosen by the first topic
 * keyword in its slug. A guide that matches none gets the neutral comparison thumbnail.
 */
const THUMBS: [RegExp, string][] = [
  [/cost|price|budget|fee/, "th-cost"],
  [/timeline|how-long|duration/, "th-timeline"],
  [/mvp|prototype/, "th-mvp"],
  [/saas/, "th-saas"],
  [/redesign|migration/, "th-redesign"],
  [/ecommerce|store/, "th-ecommerce"],
  [/ppc|google-ads|sem-/, "th-ppc"],
  [/seo/, "th-seo"],
  [/checklist|audit/, "th-checklist"],
  [/agency/, "th-agency"],
  [/wordpress|website|landing-page/, "th-website"],
];
const NEUTRAL_THUMB = "th-compare";
const thumbFor = (path: string) => v2img(THUMBS.find(([re]) => re.test(path.replace(/^\/blog\//, "")))?.[1] ?? NEUTRAL_THUMB);

/** Author, publication date and read time. The author is the company founder, as on the guide pages. */
function Byline({ post, go }: { post: BlogPost; go: (url: string) => string }) {
  const date = dateLabel(post.date);
  return (
    <p className="byline">
      By <a href={go(founderPage)} rel="author">{company.founder.name}</a>
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
  const trail = breadcrumbs(path, hero.h1 || content.title);

  const featured = posts[0];
  const rest = posts.slice(1);
  const groups = BLOG_TOPICS.map((t) => ({ topic: t, items: rest.filter((p) => topicFor(p.path).id === t.id) })).filter((g) => g.items.length > 0);
  // Topic blurbs are real copy: they sit above the filters, one per topic that has guides in the grid.
  const blurbs = groups.flatMap((g) => {
    const blurb = topics[`topic_${BLOG_TOPICS.indexOf(g.topic) + 1}_blurb`];
    return blurb ? [{ id: g.topic.id, name: g.topic.name, blurb }] : [];
  });

  return (
    <>
      <SceneHero
        labelId="guides-h1"
        trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))}
        eyebrow={hero.tag_pill || "Guides"}
        h1={hero.h1 || content.title}
        sub={hero.subheadline}
        actions={
          <a className="btn btn--grad" href="#topics">
            Browse by topic <V2Icon name="arrow" />
          </a>
        }
        scene={<HeroScene kind="gallery" title="Guides" items={[]} stack={BLOG_TOPICS.map((t) => t.name)} bubble="Guides for buyers" />}
      />

      {posts.length === 0 && (
        <section className="sec">
          <div className="wrap">
            <p className="lead gx-empty">New guides are being prepared. Check back soon, or subscribe below to be told when the first ones are published.</p>
          </div>
        </section>
      )}

      {featured && (
        <section id="featured" className="sec" aria-labelledby="feat-t">
          <div className="wrap">
            <div className="feature rv">
              <div>
                <p className="gx-tags">
                  <span className="bcard__tag">{topicFor(featured.path).name}</span>
                  {featured.tag && <span className="bcard__tag">{featured.tag}</span>}
                </p>
                <h2 id="feat-t">
                  <a href={go(featured.path)}>{featured.title}</a>
                </h2>
                {featured.description && <p className="lead feature__lead">{featured.description}</p>}
                <Byline post={featured} go={go} />
                <a className="btn btn--violet" href={go(featured.path)}>
                  Read the guide <V2Icon name="arrow" />
                </a>
              </div>
              <div className="feature__img">
                {featured.image ? (
                  <img src={mediaPath(featured.image)} alt={featured.image.alt} width={featured.image.width} height={featured.image.height} />
                ) : (
                  <img src={v2img("scene-blog")} alt="Illustrated character reading a giant book" loading="lazy" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section id="topics" className="sec sec--cloud" aria-labelledby={topics.heading ? "topics-h" : undefined}>
          <div className="wrap">
            {(topics.section_label || topics.heading || topics.intro) && (
              <div className="sec__head">
                {topics.section_label && <p className="label rv">{topics.section_label}</p>}
                {topics.heading && (
                  <h2 className="big rv" id="topics-h">
                    {topics.heading}
                  </h2>
                )}
                {topics.intro && <p className="lead rv">{topics.intro}</p>}
              </div>
            )}
            {blurbs.length > 0 && (
              <div className="gx-blurbs rv">
                {blurbs.map((b) => (
                  <div key={b.id}>
                    <h3>{b.name}</h3>
                    <p>{b.blurb}</p>
                  </div>
                ))}
              </div>
            )}
            {groups.length > 0 && (
              <div className="filters rv" data-filter aria-label="Filter guides">
                <button type="button" data-f="all" aria-pressed="true">
                  All
                </button>
                {groups.map((g) => (
                  <button key={g.topic.id} type="button" data-f={g.topic.id} aria-pressed="false">
                    {g.topic.name}
                  </button>
                ))}
              </div>
            )}
            <div className="bgrid" data-filter-items>
              {groups.flatMap((g) => g.items).map((p) => (
                <a key={p.path} className="bcard" data-cat={topicFor(p.path).id} href={go(p.path)}>
                  <span className="bcard__img">
                    {p.image ? (
                      <img src={mediaPath(p.image)} alt={p.image.alt} width={p.image.width} height={p.image.height} loading="lazy" decoding="async" />
                    ) : (
                      <img src={thumbFor(p.path)} alt="" loading="lazy" decoding="async" />
                    )}
                  </span>
                  <span className="bcard__tag">{topicFor(p.path).name}</span>
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  <span className="bcard__by">
                    By {company.founder.name}
                    {dateLabel(p.date) && (
                      <>
                        {" "}
                        <span aria-hidden="true">·</span> {dateLabel(p.date)}
                      </>
                    )}{" "}
                    <span aria-hidden="true">·</span> {p.readMinutes} min read
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {by("newsletter") && (
        <section id="newsletter" className="sec">
          <div className="wrap">
            <div className="band band--lavender news rv">
              <img className="band__char" src={v2img("char-design")} alt="" loading="lazy" />
              <div>
                {news.section_label && <p className="eyebrow">{news.section_label}</p>}
                {news.heading && (
                  <h2 className="h2" id="nl-h">
                    {news.heading}
                  </h2>
                )}
                {news.subheadline && <p className="lead">{news.subheadline}</p>}
              </div>
              <NewsletterForm enabled={newsletterEnabled && !preview} note={news.privacy_note} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
