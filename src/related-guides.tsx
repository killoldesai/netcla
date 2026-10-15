import type { BlogPost } from "./blog-types";
import { ArrowLink } from "./site/ui";

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

export function RelatedGuides({ posts, path }: { posts: BlogPost[]; path: string }) {
  const items = relatedGuides(posts, path);
  if (!items.length) return null;
  return (
    <section className="v3-related-guides gen-guides" aria-labelledby="related-guides-title">
      <link rel="stylesheet" href="/assets/nx/related.css?v=20261015" />
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
