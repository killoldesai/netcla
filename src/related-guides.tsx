import type { BlogPost } from "./blog-types";
import { ArrowLink } from "./site/ui";
import { V2Icon } from "./site/v2/ui";
import { mediaPath } from "./media-path";

const stop = new Set(["the", "and", "for", "how", "what", "your", "with", "vs", "a", "to", "of", "in", "on", "guide", "checklist", "cost"]);
const words = (t: string) => new Set(t.toLowerCase().match(/[a-z0-9.+#]{3,}/g)?.filter((w) => !stop.has(w)) ?? []);

/**
 * Up to three other guides. Relevance (same topic tag, shared title words) decides first; ties go to the guides that follow
 * this one in the list, wrapping round, so inbound links spread across every guide instead of piling onto the newest few.
 */
export function relatedGuides(posts: BlogPost[], path: string, limit = 3): BlogPost[] {
  const at = posts.findIndex((p) => p.path === path);
  const here = posts[at];
  const mine = words(here ? here.title + " " + here.tag : "");
  return posts
    .map((p, i) => ({
      p,
      score:
        (here?.tag && p.tag === here.tag ? 2 : 0) + [...words(p.title + " " + p.tag)].filter((w) => mine.has(w)).length,
      distance: (i - at + posts.length) % posts.length,
    }))
    .filter((x) => x.p.path !== path)
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Keep reading block. `v2` renders the v2 bgrid of bcard cards; otherwise the legacy related markup. */
export function RelatedGuides({ posts, path, v2 = false }: { posts: BlogPost[]; path: string; v2?: boolean }) {
  const items = relatedGuides(posts, path);
  if (!items.length) return null;
  if (v2) {
    return (
      <section className="sec sec--cloud v3-related-guides" aria-labelledby="related-guides-title">
        <div className="wrap">
          <div className="sec__head rv">
            <h2 className="h2" id="related-guides-title">Keep reading</h2>
          </div>
          <div className="bgrid">
            {items.map((p, i) => (
              <a key={p.path} className="bcard rv" href={p.path} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                {p.image && (
                  <span className="bcard__img">
                    <img src={mediaPath(p.image)} alt="" loading="lazy" decoding="async" />
                  </span>
                )}
                {p.tag && <span className="bcard__tag">{p.tag}</span>}
                <h3>{p.title}</h3>
                {p.description && <p>{p.description}</p>}
              </a>
            ))}
          </div>
          <p className="rv" style={{ marginTop: 48, textAlign: "center" }}>
            <a className="tlink" href="/blog">
              <span>All Netofficials guides</span>
              <V2Icon name="arrow" />
            </a>
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="v3-related-guides gen-guides" aria-labelledby="related-guides-title">
      <link rel="stylesheet" href="/assets/nx/related.css?v=20261017" />
      <div className="v3-wrap container">
        <h2 id="related-guides-title" className="related__title">Keep reading</h2>
        <ul className="related__cards">
          {items.map((p) => (
            <li key={p.path}>
              <a className="related__card" href={p.path}>
                <strong>{p.title}</strong>
                {p.description && <span>{p.description}</span>}
              </a>
            </li>
          ))}
        </ul>
        <p className="related__more">
          <ArrowLink href="/blog">All Netofficials guides</ArrowLink>
        </p>
      </div>
    </section>
  );
}
