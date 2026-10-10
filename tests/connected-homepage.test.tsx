import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { getDesign } from "../src/designs";
import { homepageContent } from "../src/homepage-content";
import { publicContent } from "../src/public-content";
import { HomePage } from "../src/home/HomePage";
import { contentSchema, validateContent } from "../src/content";

const design = getDesign("software-led");
const content = contentSchema.parse({
  title: design.title,
  description: "Homepage description",
  texts: {},
});
const render = (
  allowed: string[] = [],
  extra: Partial<Parameters<typeof HomePage>[0]> = {},
  base = content,
) => {
  const visible = publicContent(design, homepageContent(design, base), allowed);
  return load(
    renderToStaticMarkup(
      <HomePage content={visible.content} paths={allowed} {...extra} />,
    ),
  );
};

test("Saved homepage copy survives while new slots receive defaults", () => {
  const resolved = homepageContent(design, {
    ...content,
    texts: {
      t1: "Our saved headline",
      t21: "Our saved software service",
      t4: "",
      retired: "Previous layout text",
    },
  });
  const visible = publicContent(design, resolved);
  const html = renderToStaticMarkup(<HomePage content={visible.content} />);
  assert.ok(html.includes("Our saved headline"));
  assert.ok(html.includes("Our saved software service"));
  assert.ok(html.includes(design.texts.t4));

  assert.equal(resolved.texts.retired, undefined);
  assert.ok(
    !validateContent(resolved, design).errors.some((e) =>
      /text fields/.test(e),
    ),
  );
  assert.ok(design.sections?.find((s) => s.id === "hero")?.required);
  assert.ok(design.sections?.find((s) => s.id === "contact")?.required);
});

test("Service hubs preserve priority and only expose published destinations", () => {
  const allowed = [
    "/custom-software-development",
    "/web-application-development",
    "/ai-development-services",
  ];
  const $ = render(allowed);
  assert.deepEqual(
    $(".hub-card")
      .map((_, el) => $(el).attr("data-hub"))
      .get(),
    ["software", "ai", "cloud", "mobile", "web", "search"],
  );
  const paths = $("a[data-published-link]")
    .map((_, el) => $(el).attr("href"))
    .get();
  assert.ok(paths.length > 0);
  assert.ok(paths.every((path) => allowed.includes(path)));
  assert.equal($("a[href='/saas-development-services']").length, 0);
  assert.ok($(".planned-topic").text().includes("SaaS Development"));
  assert.equal($(".planned-topic a").length, 0);
  assert.equal($(".hub-card h3").first().text(), "Custom Software Development");
  assert.equal($("a[data-service='AI & business automation']").length, 1);
  const options = $("select[name=service] option")
    .map((_, el) => $(el).text())
    .get();
  assert.ok(options.includes("AI & business automation"));
  assert.ok(options.includes("Cloud & DevOps"));
  for (const name of [
    "name",
    "email",
    "service",
    "country",
    "timeline",
    "goal",
  ])
    assert.equal($(`form [name=${name}]`).length, 1, name);
  assert.equal($("form .honeypot input[name=company_url]").length, 1);
});

test("The four priority practices lead the page and are all visible without a click", () => {
  const $ = render();
  assert.match($("h1").text(), /software, AI,\s*cloud and mobile app development/i);
  assert.deepEqual(
    $("#hero nav[aria-label='Our four practices'] a")
      .map((_, el) => $(el).attr("href"))
      .get(),
    ["#software", "#ai", "#cloud", "#mobile"],
  );
  assert.deepEqual(
    $("#services article[data-hub]")
      .map((_, el) => $(el).attr("id"))
      .get(),
    ["software", "ai", "cloud", "mobile"],
  );
  assert.equal($("#services [role=tab]").length, 0);
  assert.equal($("#services [hidden]").length, 0);
  assert.equal($("#results").length, 0);
  assert.equal($("main [role=tablist]").length, 0);
});

test("Published case studies supply proof without exposing draft examples", () => {
  const listing = [
    {
      path: "/case-studies/verified",
      kind: "case-study",
      title: "Verified project",
      description: "Reviewed project scope",
    },
    {
      path: "/case-studies/draft",
      kind: "case-study",
      title: "Draft project",
      description: "Not published",
    },
  ];
  const $ = render(["/case-studies/verified"], { listing });
  assert.equal($(".proof-card").length, 1);
  assert.equal($(".proof-card").attr("href"), "/case-studies/verified");
  assert.equal(render([], { listing })(".proof-card").length, 0);
});

test("Developer roles link to published pages and use an enquiry fallback for unavailable pages", () => {
  const allowed = ["/hire-react-developer", "/hire-developers"];
  const $ = render(allowed);
  assert.equal($(".role-grid a[href='/hire-react-developer']").length, 1);
  assert.equal($(".role-grid a[href='/hire-developers']").length, 14);
  assert.equal($(".role-grid a[href='/hire-nodejs-developer']").length, 0);
  assert.equal(render()(".role-grid a[href='#contact']").length, 15);
});

test("Hidden optional sections are removed without decorative service numbering", () => {
  const $ = render([], {}, { ...content, hiddenSections: ["faq", "india"] });
  assert.equal($("#faq").length, 0);
  assert.equal($("#india").length, 0);
  assert.ok($("#contact").length);
  assert.equal($(".hub-number").length, 0);
  assert.equal($("[style*=gradient], [class*=gradient]").length, 0);
});

test("Technology chips link to published pages only, and the process lists every stage", () => {
  const $ = render(["/aws-services", "/flutter-app-development"]);
  assert.equal($("#section-1 a[href='/aws-services']").length, 1);
  assert.equal($("#section-1 a[href='/flutter-app-development']").length, 1);
  assert.equal($("#section-1 a").length, 2);
  assert.ok($("#section-1").text().includes("Kubernetes"));
  assert.equal($("#delivery ol > li").length, 4);
  assert.equal($("#faq details").length, 6);
});
