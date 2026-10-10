import type { BlogPost } from "./blog-types";

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
    <section className="v3-related-guides" aria-labelledby="related-guides-title">
      <div className="v3-wrap">
        <h2 id="related-guides-title">Keep reading</h2>
        <ul>
          {items.map((p) => (
            <li key={p.path}>
              <a href={p.path}>{p.title}</a>
              {p.description && <p>{p.description}</p>}
            </li>
          ))}
        </ul>
        <p>
          <a href="/blog">All Netofficials guides</a>
        </p>
      </div>
    </section>
  );
}
