// The three topics the guides index is grouped into. A guide's topic comes from its slug, so a new guide lands in
// the right group without editing anything; anything unmatched falls under software development.
export type BlogTopic = { id: "marketing" | "web" | "software"; name: string; match: RegExp };

// Order matters: the first match wins ("website-redesign-seo-migration" is about search, so marketing is checked first).
export const BLOG_TOPICS: BlogTopic[] = [
  { id: "marketing", name: "Search and paid marketing", match: /seo|ppc|google-ads|sem-vs|paid-search/ },
  { id: "web", name: "Websites and eCommerce", match: /website|wordpress|ecommerce|landing-page/ },
  { id: "software", name: "Software development", match: /software|mvp|saas|build-vs|prototype|timeline/ },
];

export function topicFor(path: string): BlogTopic {
  const slug = path.replace(/^\/blog\//, "");
  return BLOG_TOPICS.find((t) => t.match.test(slug)) ?? BLOG_TOPICS[BLOG_TOPICS.length - 1];
}
