import test from "node:test";
import assert from "node:assert/strict";
import { contentSchema, type Content } from "../src/content";
import { pageGraph } from "../src/structured-data";

const SITE = "https://example.com";

type Fields = Record<string, string>;
type Sec = { id: string; fields: Fields; omitted?: boolean };

function page(sections: Sec[], seo: Record<string, unknown> = {}): Content {
  return contentSchema.parse({
    schemaVersion: 3,
    title: "Flutter App Development Services | Netofficials",
    description: "Flutter app development services from an India-based team.",
    texts: {},
    pageSections: sections.map((s, i) => ({ id: s.id, order: i + 1, fields: s.fields, omitted: s.omitted ?? false, evidenceIds: [] })),
    seo: {
      metaTitle: "Flutter App Development Services",
      metaDescription: "Flutter app development services from an India-based team.",
      primaryKeyword: "flutter app development services",
      ...seo,
    },
  });
}

const build = (path: string, content: Content, extra: { kind?: string; published?: string; modified?: string } = {}) =>
  pageGraph({ path, content, site: SITE, ...extra }) as { "@graph": Record<string, any>[] };

const byType = (graph: Record<string, any>[], type: string) => graph.filter((n) => n["@type"] === type);

/** Every string, array and undefined leaf in the graph; used to prove no empty values are emitted. */
function emptyLeaves(value: unknown, at = "graph"): string[] {
  if (value === undefined) return [at];
  if (value === "") return [at];
  if (Array.isArray(value)) return value.length === 0 ? [at] : value.flatMap((v, i) => emptyLeaves(v, `${at}[${i}]`));
  if (value && typeof value === "object" && !(value instanceof Date))
    return Object.entries(value).flatMap(([k, v]) => emptyLeaves(v, `${at}.${k}`));
  return [];
}

const servicePage = page(
  [
    { id: "hero", fields: { h1: "Flutter App Development" } },
    {
      id: "service-overview",
      fields: { body: "<p>One Dart codebase for iOS and Android.</p>" },
    },
    {
      id: "what-we-deliver",
      fields: {
        card_1_title: "Cross-platform builds",
        card_1_body: "<p>One codebase for <strong>iOS</strong> and Android.</p>",
        card_2_title: "Backend integration",
        card_2_body: "<p>APIs and payments.</p>",
        card_3_title: "",
        card_3_body: "ignored because it has no title",
      },
    },
    {
      id: "process",
      fields: {
        step_1_title: "Discovery",
        step_1_body: "<p>We scope the work together.</p>",
        step_2_title: "Build",
        step_2_body: "We build in two-week sprints.",
        step_3_title: "Launch",
        step_3_body: "",
      },
    },
    { id: "faq", fields: { q1: "How long does it take?", a1: "<p>Usually 8 to 12 weeks.</p>" } },
  ],
  {
    serviceType: "Flutter app development",
    audience: "Startup founders",
    schemaAbout: [
      { name: "Flutter", sameAs: "https://en.wikipedia.org/wiki/Flutter_(software)" },
      { name: "Dart", sameAs: "" },
    ],
  },
);

test("WebSite node is present once and the main node points at it", () => {
  const graph = build("/flutter-app-development", servicePage)["@graph"];
  const sites = byType(graph, "WebSite");
  assert.equal(sites.length, 1);
  assert.deepEqual(sites[0], {
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: "Netofficials",
    url: SITE,
    inLanguage: "en",
    publisher: { "@id": `${SITE}/#organization` },
  });
  const main = byType(graph, "Service")[0];
  assert.deepEqual(main.isPartOf, { "@id": `${SITE}/#website` });
  assert.equal(main.inLanguage, "en");
});

test("service page gets offer catalog, HowTo, speakable, about and audience", () => {
  const graph = build("/flutter-app-development", servicePage, { published: "2026-01-02", modified: "2026-02-03" })["@graph"];
  const main = byType(graph, "Service")[0];

  assert.equal(main.serviceType, "Flutter app development");
  assert.deepEqual(main.audience, { "@type": "Audience", audienceType: "Startup founders" });
  assert.deepEqual(main.about, [
    { "@type": "Thing", name: "Flutter", sameAs: "https://en.wikipedia.org/wiki/Flutter_(software)" },
    { "@type": "Thing", name: "Dart" },
  ]);
  assert.deepEqual(main.hasOfferCatalog, {
    "@type": "OfferCatalog",
    name: "Flutter app development",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Cross-platform builds", description: "One codebase for iOS and Android." },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Backend integration", description: "APIs and payments." },
      },
    ],
  });
  assert.deepEqual(main.speakable, { "@type": "SpeakableSpecification", cssSelector: ["#service-overview", "#faq"] });
  assert.equal(main.datePublished, "2026-01-02");
  assert.equal(main.dateModified, "2026-02-03");

  const howTo = byType(graph, "HowTo");
  assert.equal(howTo.length, 1);
  assert.equal(howTo[0]["@id"], `${SITE}/flutter-app-development#how-it-works`);
  assert.equal(howTo[0].name, "How Flutter app development projects run");
  assert.deepEqual(howTo[0].step, [
    { "@type": "HowToStep", position: 1, name: "Discovery", text: "We scope the work together." },
    { "@type": "HowToStep", position: 2, name: "Build", text: "We build in two-week sprints." },
    { "@type": "HowToStep", position: 3, name: "Launch" },
  ]);
  assert.equal(byType(graph, "ItemList").length, 0);
});

test("hub page gets an ItemList of child services with absolute urls", () => {
  const hub = page([
    { id: "hero", fields: { h1: "Custom Software Development" } },
    {
      id: "services-grid",
      fields: {
        svc_1_title: "Flutter app development",
        svc_1_body: "Cross-platform apps",
        svc_1_url: "/flutter-app-development",
        svc_2_title: "",
        svc_2_url: "/skipped",
        svc_3_title: "Web platforms",
        svc_3_url: "",
      },
    },
  ]);
  const graph = build("/custom-software-development", hub)["@graph"];
  const list = byType(graph, "ItemList");
  assert.equal(list.length, 1);
  assert.equal(list[0]["@id"], `${SITE}/custom-software-development#child-services`);
  assert.equal(list[0].name, "Custom Software Development child services");
  assert.deepEqual(list[0].itemListElement, [
    { "@type": "ListItem", position: 1, name: "Flutter app development", item: `${SITE}/flutter-app-development` },
    { "@type": "ListItem", position: 2, name: "Web platforms" },
  ]);
  const main = byType(graph, "Service")[0];
  assert.deepEqual(main.hasPart, { "@id": `${SITE}/custom-software-development#child-services` });
  for (const entry of list[0].itemListElement as { item?: string }[]) assert.ok(entry.item === undefined || entry.item.startsWith(SITE));
});

test("omitted or empty sections add nothing", () => {
  const sparse = page([
    { id: "hero", fields: { h1: "Flutter App Development" } },
    { id: "service-overview", fields: { body: "<p>Text</p>" }, omitted: true },
    { id: "what-we-deliver", fields: { card_1_title: "", card_1_body: "Body only" } },
    { id: "process", fields: { step_1_title: "One", step_2_title: "Two", step_3_title: "Three" }, omitted: true },
    { id: "services-grid", fields: { svc_1_title: "", svc_1_url: "/x" }, omitted: true },
    { id: "faq", fields: { q1: "Q?", a1: "A." }, omitted: true },
  ]);
  const graph = build("/flutter-app-development", sparse)["@graph"];
  const main = byType(graph, "Service")[0];
  for (const key of ["speakable", "hasOfferCatalog", "hasPart", "audience", "about"]) assert.equal(key in main, false, key);
  assert.equal(byType(graph, "HowTo").length, 0);
  assert.equal(byType(graph, "ItemList").length, 0);
  assert.equal(byType(graph, "FAQPage").length, 0);
});

test("speakable lists only the sections that are present", () => {
  const onlyFaq = page([
    { id: "hero", fields: { h1: "Flutter App Development" } },
    { id: "faq", fields: { q1: "Q?", a1: "<p>A.</p>" } },
  ]);
  const main = byType(build("/flutter-app-development", onlyFaq)["@graph"], "Service")[0];
  assert.deepEqual(main.speakable.cssSelector, ["#faq"]);
});

test("article pages keep their shape and gain no HowTo or OfferCatalog", () => {
  const article = page(
    [
      { id: "hero", fields: { h1: "Custom software development cost" } },
      { id: "what-we-deliver", fields: { card_1_title: "Discovery", card_1_body: "Scoping" } },
      { id: "process", fields: { step_1_title: "A", step_2_title: "B", step_3_title: "C" } },
      { id: "faq", fields: { q1: "Q?", a1: "A." } },
    ],
    {},
  );
  const graph = pageGraph({
    path: "/blog/custom-software-development-cost",
    content: { ...article, author: "Jane Doe" },
    site: SITE,
    published: "2026-01-02",
  })["@graph"] as Record<string, any>[];
  const main = byType(graph, "Article")[0];
  assert.equal(main.headline, "Custom software development cost");
  assert.deepEqual(main.author, { "@type": "Person", name: "Jane Doe" });
  assert.deepEqual(main.publisher, { "@id": `${SITE}/#organization` });
  assert.equal(main.datePublished, "2026-01-02");
  assert.equal(byType(graph, "HowTo").length, 0);
  assert.equal(byType(graph, "OfferCatalog").length, 0);
  assert.equal(byType(graph, "ItemList").length, 0);
  assert.equal("hasOfferCatalog" in main, false);
});

test("no node carries an empty string, empty array or undefined value", () => {
  const pages: [string, Content][] = [
    ["/flutter-app-development", servicePage],
    ["/custom-software-development", page([{ id: "hero", fields: { h1: "" } }, { id: "services-grid", fields: { svc_1_title: "A", svc_1_url: "" } }])],
    ["/flutter-app-development", page([{ id: "hero", fields: {} }], { serviceType: "", audience: "", schemaAbout: [] })],
  ];
  for (const [path, content] of pages) {
    const graph = build(path, content)["@graph"];
    assert.deepEqual(emptyLeaves(graph), [], `empty leaf on ${path}`);
  }
});

