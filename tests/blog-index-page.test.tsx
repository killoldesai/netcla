import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { contentSchema } from "../src/content";
import { runContentQA } from "../src/content-qa";
import { pageGraph } from "../src/structured-data";
import { blogIndexBand, blogIndexSections, effectiveSpec, imageSectionIds, pageBand } from "../src/prompts/templates";
import { rulesFor } from "../src/prompts/sections";
import { templateBlueprint } from "../src/page-template";
import { BLOG_TOPICS, topicFor } from "../src/blog-topics";
import { isBlogIndexContent } from "../src/blog-index-page";
import { V3Page } from "../src/v3-page";
import type { BlogPost } from "../src/blog-types";
import type { PageSpecification } from "../src/page-spec-schema";

// The guides that exist today, so a new slug that falls outside every topic is noticed here.
const SLUGS = [
  "b2b-website-conversion-checklist", "choosing-an-seo-agency", "custom-software-development-cost", "custom-software-vs-off-the-shelf",
  "ecommerce-development-cost", "google-ads-management-cost", "google-ads-not-generating-leads", "how-long-does-seo-take",
  "mvp-development-cost", "mvp-vs-prototype", "ppc-audit-checklist", "ppc-landing-page-checklist", "saas-development-cost",
  "sem-vs-seo-vs-ppc", "seo-audit-checklist", "seo-cost-india", "seo-for-small-business", "seo-vs-ppc",
  "software-development-project-checklist", "software-development-timeline", "website-development-cost-india",
  "website-redesign-checklist", "website-redesign-seo-migration", "wordpress-vs-custom-website",
];

const base = { path: "/blog", title: "Guides", databaseId: "00000000-0000-0000-0000-000000000000", source: "x", blueprintPrompt: "", originalRows: [], sections: [] } as unknown as PageSpecification;
const post = (slug: string, over: Partial<BlogPost> = {}): BlogPost => ({
  path: "/blog/" + slug,
  title: "Title of " + slug,
  tag: "Guide",
  description: "Description of " + slug,
  readMinutes: 11,
  date: "2026-09-30T10:00:00.000Z",
  image: { id: "8d38d2d5-d1c0-4930-994f-603f2a336624", alt: "Illustration of " + slug, width: 1200, height: 675 },
  ...over,
});
const POSTS = ["seo-vs-ppc", "ppc-audit-checklist", "website-redesign-checklist", "ecommerce-development-cost", "mvp-development-cost", "saas-development-cost"].map((s) => post(s));
const paths = ["/", "/contact", "/how-we-work", "/blog", ...POSTS.map((p) => p.path)];

function content() {
  const spec = effectiveSpec(base);
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Software Development Guides, Cost and Scope",
    description: "d".repeat(140),
    texts: {},
    pageBlueprint: templateBlueprint(spec),
    pageSections: spec.sections.map((s, i) => ({ id: s.id, order: i + 1, fields: Object.fromEntries(s.fields.map((f) => [f, /url$/.test(f) ? "/contact" : `${s.id} ${f}`])), evidenceIds: [], omitted: false })),
    seo: { metaTitle: "Software Development Guides, Cost and Scope", metaDescription: "d".repeat(140), primaryKeyword: "software development guides", answerSummary: "word ".repeat(45).trim() },
    provenance: { specificationId: "00000000-0000-4000-8000-000000000000", specificationHash: "a".repeat(64), runId: "00000000-0000-4000-8000-000000000000", version: 1, validation: [], generatedAt: new Date().toISOString() },
  });
}
const render = (posts: BlogPost[] = POSTS, enabled = false) => load(renderToStaticMarkup(<V3Page content={content()} path="/blog" paths={paths} posts={posts} newsletterEnabled={enabled} />));

test("every current guide belongs to a topic, and search wins over website for SEO migration", () => {
  for (const slug of SLUGS) assert.ok(BLOG_TOPICS.some((t) => t.match.test(slug)), `${slug} matches no topic and would fall back to software`);
  assert.equal(topicFor("/blog/website-redesign-seo-migration").id, "marketing");
  assert.equal(topicFor("/blog/wordpress-vs-custom-website").id, "web");
  assert.equal(topicFor("/blog/mvp-vs-prototype").id, "software");
  assert.equal(topicFor("/blog/something-new").id, "software");
});

test("the /blog spec is a listing, not an article, while /blog/* pages keep the guide layout", () => {
  const ids = blogIndexSections(base).map((s) => s.id);
  assert.deepEqual(ids, ["hero", "topics", "newsletter", "cta-banner"]);
  assert.deepEqual(pageBand("/blog"), blogIndexBand);
  assert.deepEqual(imageSectionIds(effectiveSpec(base)), []);
  for (const id of ids) assert.notEqual(rulesFor(id, "/blog")[0], rulesFor("no-such-section")[0], `${id} needs index rules`);
  const post = effectiveSpec({ ...base, path: "/blog/seo-vs-ppc" } as PageSpecification);
  assert.ok(post.sections.some((s) => s.id === "key-takeaways"), "a single guide still uses the article layout");
});

test("the index shows the latest guide once, then every other guide under its topic", () => {
  const c = content();
  assert.ok(isBlogIndexContent(c, "/blog"));
  assert.ok(!isBlogIndexContent(c, "/about"));
  const $ = render();
  assert.ok($("main.v3-blog").length);
  assert.ok($("link[href^='/assets/blog-index.css']").length);
  assert.equal($("[class*='sk-'], [class*='ab-'], [class*='ct-'], [class*='en-'], [class*='hw-'], [class*='wc-']").length, 0);
  assert.equal($("h1").length, 1);
  assert.equal($("#featured a.bi-featured").attr("href"), "/blog/seo-vs-ppc");
  // Five guides remain after the featured one: two marketing, two web, one software... grouped by topic.
  assert.equal($(".bi-card").length, 5);
  assert.equal($("#topic-marketing .bi-card").length, 1);
  assert.equal($("#topic-web .bi-card").length, 2);
  assert.equal($("#topic-software .bi-card").length, 2);
  assert.equal($("#featured a[href='/blog/seo-vs-ppc']").length + $(".bi-card[href='/blog/seo-vs-ppc']").length, 1, "featured guide is not repeated in a grid");
  // The topic bar counts every guide, including the featured one.
  assert.deepEqual($(".bi-topics-nav a").map((_, el) => $(el).text()).get(), ["Search and paid marketing2", "Websites and eCommerce2", "Software development2"]);
  assert.match($(".bi-meta").first().text(), /^30 \w+ 202611 min read$/);
});

test("cards carry the guide's own illustration, title, summary and read time; nothing is numbered or iconised", () => {
  const $ = render();
  const card = $(".bi-card").first();
  assert.ok(card.find("img").attr("src")?.startsWith("/media/"));
  assert.match(card.find("img").attr("alt") ?? "", /Illustration of/);
  assert.match(card.find("h3").text(), /^Title of /);
  assert.match(card.text(), /11 min read/);
  assert.equal($("main ol").length, 1, "only the breadcrumb is an ordered list");
  assert.equal($("main svg").length, 0);
});

test("an empty topic is not shown, and with no guides the page says so plainly", () => {
  const only = render([post("seo-vs-ppc"), post("ppc-audit-checklist")]);
  assert.equal(only("#topic-web").length, 0);
  assert.equal(only("#topic-software").length, 0);
  assert.equal(only(".bi-topics-nav").length, 0, "a single topic needs no topic bar");
  const none = render([]);
  assert.match(none(".bi-empty").text(), /New guides are being prepared/);
  assert.equal(none("#featured").length, 0);
});

test("the newsletter form is disabled until delivery is verified", () => {
  assert.equal(render(POSTS, false)("#newsletter input[name='email']").attr("disabled"), "disabled");
  assert.equal(render(POSTS, true)("#newsletter input[name='email']").attr("disabled"), undefined);
});

test("JSON-LD is a CollectionPage listing exactly the guides on the page, and QA uses the index band", () => {
  const graph = pageGraph({ path: "/blog", content: content(), site: "https://example.com", listing: POSTS.map((p) => ({ path: p.path, title: p.title })) })["@graph"] as Record<string, any>[];
  const page = graph.find((n) => n["@type"] === "CollectionPage")!;
  assert.equal(page.mainEntity["@type"], "ItemList");
  assert.equal(page.mainEntity.itemListElement.length, POSTS.length);
  assert.equal(page.mainEntity.itemListElement[0].url, "https://example.com/blog/seo-vs-ppc");
  const qa = runContentQA(content(), "/blog");
  assert.match(qa.checks.find((c) => c.id === "word-band")?.detail ?? "", new RegExp(`target ${blogIndexBand.min}-${blogIndexBand.max}`));
});
