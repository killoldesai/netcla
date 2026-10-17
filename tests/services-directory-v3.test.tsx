import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import type { Content } from "../src/content";
import { ServicesDirectorySections } from "../src/services-directory-v3";

// The /services directory: published pages only, grouped by pillar, hero copy from the page's content.
const PUBLISHED = [
  "/custom-software-development",
  "/web-application-development",
  "/saas-development-services",
  "/product-development-services",
  "/nodejs-development-services",
  "/mobile-app-development",
  "/ios-app-development",
  "/ai-development-services",
  "/ai-chatbot-development",
  "/software-development-company-usa",
  "/healthcare-software-development",
  "/hire-react-developer",
  "/about",
  "/contact",
  "/how-we-work",
  "/faq",
];
const paths = ["/", "/services", ...PUBLISHED];

const section = (id: string, fields: Record<string, string>) => ({ id, order: 1, fields, evidenceIds: [], omitted: false });
const HERO = section("hero", {
  tag_pill: "Service directory",
  h1: "Software Development, Mobile, AI and Digital Marketing Services",
  subheadline: "Every service Netofficials offers, in one place.",
  cta_primary_label: "Discuss your project",
});
const FAQ = section("faq", {
  section_label: "FAQ",
  heading: "Questions about services",
  q1: "How do we start?",
  a1: "<p>Send a short brief.</p>",
  q2: "Do you work with startups?",
  a2: "Yes, we do.",
});
const CTA = section("cta-banner", { heading: "Ready to scope it?", subheadline: "Tell us what you need.", cta_primary_label: "Start a project" });

function render(pageSections: ReturnType<typeof section>[] = [HERO, FAQ, CTA], over: Partial<Parameters<typeof ServicesDirectorySections>[0]> = {}) {
  const content = { title: "Software Services Directory | Netofficials", pageSections } as unknown as Content;
  return load(renderToStaticMarkup(<ServicesDirectorySections content={content} path="/services" paths={paths} {...over} />));
}

test("only published pages are linked, and unpublished pages are not shown", () => {
  const $ = render();
  const hrefs = $("a.dcard[href^='/'], a.dpill[href^='/']").map((_, a) => $(a).attr("href")).get();
  assert.ok(hrefs.includes("/saas-development-services"));
  assert.ok(hrefs.includes("/software-development-company-usa"));
  // Pages that exist in site-structure but are not in the published paths.
  assert.equal($('a[href="/enterprise-software-development"]').length, 0);
  assert.equal($('a[href="/hire-python-developer"]').length, 0);
  assert.equal($('a[href="/software-development-company-dubai"]').length, 0);
  assert.equal($('a:contains("Enterprise software")').length, 0);
  // Every directory link points at a published page.
  for (const href of hrefs) assert.ok(paths.includes(href), `${href} is not published`);
  // A pillar hub is linked from its section only when the hub is published (these two are).
  assert.equal($('a[href="/mobile-app-development"]').text().trim(), "Open the Mobile Apps hub");
  assert.equal($('a[href="/ai-development-services"]').text().trim(), "Open the AI & Machine Learning hub");
  // The industries hub is not published, so its section has no hub link.
  assert.equal($('a[href="/industries"]').length, 0);
});

test("pages are grouped by pillar and menu group, in declaration order", () => {
  const $ = render();
  const software = $("#software");
  assert.equal(software.find("h2").text(), "Software Development");
  // Groups are tabs (name plus page count), each with its own panel of cards.
  assert.deepEqual(software.find("[role=tab]").map((_, t) => $(t).contents().first().text()).get(), ["Build", "Product stage", "Technologies"]);
  assert.deepEqual(software.find("[role=tabpanel]").first().find("a.dcard h3").map((_, n) => $(n).text()).get(), ["Web applications", "SaaS development"]);
  assert.equal(software.find("[role=tabpanel]").length, 3);
  assert.equal(software.find("[role=tabpanel][hidden]").length, 2);
  assert.equal($("#mobile a.dcard").length, 1);
  assert.deepEqual($("#mobile a.dcard h3").map((_, n) => $(n).text()).get(), ["iOS apps"]);
  assert.deepEqual($("#hire a.dcard h3").map((_, n) => $(n).text()).get(), ["React developers"]);
});

test("page counts and the overview tiles come from the published links", () => {
  const $ = render();
  // Software: web application, SaaS, product development and Node.js are published (the hub is not), so 4 pages.
  assert.equal($("#software .eyebrow").text(), "4 pages");
  assert.equal($('#overview a.dir-area[href="#software"] small').text(), "4 pages");
  assert.equal($('#overview a.dir-area[href="#mobile"] small').text(), "1 page");
  assert.equal($('#overview a.dir-area[href="#ai"] small').text(), "1 page");
  assert.equal($('#overview a.dir-area[href="#hire"] small').text(), "1 page");
  assert.equal($('#overview a.dir-area[href="#industries"] small').text(), "1 page");
  assert.equal($('#overview a.dir-area[href="#cloud"]').length, 0);
  assert.equal($("#overview a.dir-area").length, 5);
  // The chip navigation lists the rendered sections only, in page order.
  assert.deepEqual($(".svc-nav a.chip").map((_, a) => $(a).attr("href")).get(), ["#overview", "#software", "#mobile", "#ai", "#hire", "#industries", "#company", "#locations"]);
});

test("company and locations lists link only published pages", () => {
  const $ = render();
  const company = $("#company a.dcard h3").map((_, n) => $(n).text()).get();
  assert.deepEqual(company, ["About", "Contact", "How we work", "FAQ"]);
  assert.deepEqual($("#locations a.dpill").map((_, n) => $(n).text().trim()).get(), ["USA"]);
  assert.match($(".svc-note").text(), /See how we work/);
});

test("the hero uses the page's own published copy, falling back to the title", () => {
  const $ = render();
  assert.equal($("#hero h1").text(), "Software Development, Mobile, AI and Digital Marketing Services");
  assert.equal($("#hero .eyebrow").text(), "Service directory");
  assert.equal($("#hero .hero__sub").text(), "Every service Netofficials offers, in one place.");
  assert.equal($("#hero .heroart").length, 0, "no hero picture without the page's own image");
  assert.ok($("#hero .hs--hub").length, "the hero shows the service map");

  const bare = render([]);
  assert.equal(bare("#hero h1").text(), "Software Services Directory | Netofficials");
  assert.equal(bare("#hero .eyebrow").length, 0);
});

test("the FAQ renders when the page has one and is left out otherwise", () => {
  const $ = render();
  assert.equal($("#faq h2").text(), "Questions about services");
  assert.equal($("#faq details").length, 2);
  assert.equal($("#faq details").first().find("summary").text(), "How do we start?");
  assert.equal($("#faq details p").first().text(), "Send a short brief.");
  assert.equal(render([HERO])("#faq").length, 0);
});

test("the closing band comes from the shell, so the directory draws none of its own", () => {
  const $ = render();
  assert.equal($("#cta-banner").length, 0);
  assert.equal($("#cta-banner .nx-cta").length, 0);
  assert.doesNotMatch($.text(), /Ready to scope it\?/);
});

test("preview maps links through linkMap and leaves unmapped pages unlinked", () => {
  const $ = render([HERO], { preview: true, paths: [], linkMap: { "/saas-development-services": "/preview/saas", "/ios-app-development": "/preview/ios" } });
  assert.equal($('a[href="/preview/saas"]').length, 1);
  assert.equal($('a[href="/preview/ios"]').length, 1);
  assert.equal($('a[href="/web-application-development"]').length, 0);
});

test("no draft placeholders reach the page", () => {
  const $ = render();
  assert.doesNotMatch($.text(), /\[draft/);
});

test("child services become pillar leads when they match a pillar, and unmatched ones are listed", () => {
  const GRID = section("services-grid", {
    section_label: "Services",
    heading: "Sectors we build for",
    svc_1_title: "Mobile Apps",
    svc_1_body: "Apps for customers and staff.",
    svc_1_url: "/mobile-app-development",
    svc_2_title: "Consulting",
    svc_2_body: "Scoping and architecture advice.",
    svc_2_url: "/software-consulting-services",
  });
  const $ = render([HERO, GRID]);
  assert.equal($("#mobile .lead").text(), "Apps for customers and staff.");
  // The grid's own heading leads the overview; unmatched services are listed under the area cards.
  assert.equal($("#overview h2").text(), "Sectors we build for");
  assert.equal($("#overview .cat h3").text(), "Consulting");
  assert.equal($("#overview").text().includes("Scoping and architecture advice."), true);
  assert.equal($("#software .lead").text(), "Custom platforms, SaaS and business systems");
});

test("other published sections keep their text", () => {
  const WHY = section("why-netofficials", { section_label: "Why us", heading: "Why choose us", body_paragraph: "A short honest case.", adv_1: "Fixed scope", adv_2: "Named team" });
  const STATS = section("stats-bar", { stat_1_number: "12", stat_1_label: "Years delivering" });
  const hidden = { ...section("testimonials", { quote_1: "Hidden quote" }), omitted: true };
  const $ = render([HERO, WHY, STATS, hidden]);
  assert.equal($("#why-netofficials h2").text(), "Why choose us");
  assert.equal($("#why-netofficials .dir-why__copy p:not(.eyebrow)").text(), "A short honest case.");
  assert.deepEqual($("#why-netofficials .dir-adv").map((_, c) => $(c).text().trim()).get(), ["Fixed scope", "Named team"]);
  assert.equal($("#stats-bar h3").text(), "12");
  assert.equal($("#stats-bar").text().includes("Years delivering"), true);
  assert.equal($("#testimonials").length, 0);
  assert.equal($("body").text().includes("Hidden quote"), false);
});
