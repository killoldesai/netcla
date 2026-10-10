// The page brief asks the model for Wikipedia/Wikidata `sameAs` URLs. Models invent some
// (roughly 1 in 12 in the pilot), and a dead URL in structured data is worse than none,
// so every URL is checked once and dropped unless it answers.

type About = { name: string; sameAs: string };
type Fetcher = (url: string, init: RequestInit) => Promise<{ ok: boolean }>;

const ALLOWED = /^https:\/\/(?:en\.wikipedia\.org\/wiki\/[^\s?#]+|www\.wikidata\.org\/wiki\/Q\d+)$/;
const cache = new Map<string, Promise<boolean>>();

function live(url: string, fetcher: Fetcher): Promise<boolean> {
  let known = cache.get(url);
  if (!known) {
    known = fetcher(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "netofficials-link-check" },
    })
      .then((res) => res.ok)
      .catch(() => false);
    cache.set(url, known);
  }
  return known;
}

/** Keeps `sameAs` only when it points at Wikipedia or Wikidata and the page exists. */
export async function verifySameAs(about: About[], fetcher: Fetcher = fetch): Promise<About[]> {
  return Promise.all(
    about.map(async (item) => {
      if (!item.sameAs) return item;
      const ok = ALLOWED.test(item.sameAs) && (await live(item.sameAs, fetcher));
      return ok ? item : { ...item, sameAs: "" };
    }),
  );
}
