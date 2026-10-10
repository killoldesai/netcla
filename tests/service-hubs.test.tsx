import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { ServiceHubPage } from "../src/service-hub-page";
import { serviceHubs, hubChildren, plannedPage } from "../src/service-hubs";
import { contentSchema, leadSchema } from "../src/content";
import { getDesignSource } from "../src/designs";
import { DesignPage } from "../src/render";
import { readFileSync } from "node:fs";
import { ServiceDirectoryPage } from "../src/service-directory-page";
import { HubActivityPanel } from "../src/hub-activity-panel";
import { hubActivityContent } from "../src/hub-activity-content";
import {
  buildServices,
  serviceIndexSections,
  developerRoles,
  technologyGroups,
  serviceDirectorySchema,
} from "../src/service-directory-data";
const render = (props: Parameters<typeof ServiceHubPage>[0]) =>
  load(renderToStaticMarkup(<ServiceHubPage {...props} />));

test("Each service hero uses its own illustrative activity and keeps the directory destination", () => {
  for (const hub of serviceHubs) {
    const $ = render({ path: hub.path, preview: true });
    assert.equal($(".hub-activity-visual").length, 1);
    assert.equal($(".activity-hub-tag").text(), hub.name);
    assert.equal($(".activity-metric-value").length, 3);
    assert.equal($(".activity-feed li").length, 4);
    assert.equal($(".activity-tech-pills li").length, 3);
    assert.equal($(".activity-bottom a").attr("href"), "#hub-services");
    assert.equal($(".hub-artwork").length, 0);
    assert.equal($(".hub-activity-visual img").length, 0);
    assert.ok(
      $(".hub-activity-visual figcaption")
        .text()
        .includes("not live project data"),
    );
    assert.ok(
      !/50\+|200\+|99\.9%|4–12 wks|GPT-4/.test(
        $(".hub-activity-visual").text(),
      ),
    );
  }
});

test("Activity panel content and service destination are supplied through props", () => {
  const base = hubActivityContent["/mobile-app-development"];
  const $ = load(
    renderToStaticMarkup(
      <HubActivityPanel
        {...base}
        name="Custom hub"
        servicesHref="/example#services"
        metrics={[
          { value: "Custom metric", label: "Custom label" },
          base.metrics[1],
          base.metrics[2],
        ]}
        rows={
          [
            {
              ...base.rows[0],
              title: "Custom activity",
              subtitle: "Custom context",
            },
            ...base.rows.slice(1),
          ] as typeof base.rows
        }
        technologies={["Custom tech", "Other tech", "Third tech"]}
      />,
    ),
  );
  assert.equal($(".activity-hub-tag").text(), "Custom hub");
  assert.equal($(".activity-metric-value").first().text(), "Custom metric");
  assert.equal($(".activity-row-title").first().text(), "Custom activity");
  assert.equal($(".activity-tech-pills li").first().text(), "Custom tech");
  assert.equal($(".activity-bottom a").attr("href"), "/example#services");
});
test("Main services directory links every category and retains the common enquiry", () => {
  const $ = load(renderToStaticMarkup(<ServiceDirectoryPage preview />));
  assert.equal($(".index-build-grid article").length, buildServices.length);
  for (const section of serviceIndexSections)
    for (const item of section.links)
      assert.ok($(`main a[href="${item.path}"]`).length > 0, item.path);
  assert.equal(
    $('#contact button[type="submit"]').text(),
    "Discuss my project ↗",
  );
});

test("Main directory has ordered navigation indexes, inventory destinations and canonical schema", () => {
  const $ = load(
    renderToStaticMarkup(
      <ServiceDirectoryPage
        preview
        linkMap={{
          "/custom-software-development":
            "/design-preview/custom-software-development",
        }}
      />,
    ),
  );
  assert.equal($("h1").length, 1);
  assert.deepEqual(
    $("main>section[id]")
      .map((_, el) => $(el).attr("id"))
      .get(),
    ["build", "technologies", "hire", "solutions", "market", "industries"],
  );
  assert.equal($('.index-hero a[href="#contact"]').length, 0);
  assert.equal($(".index-jumps a").length, 3);
  for (const section of serviceIndexSections)
    for (const item of section.links)
      assert.ok(plannedPage(item.path.split("#")[0]), item.path);
  assert.equal($(".index-role-grid a").length, developerRoles.length);
  assert.equal(
    $(".index-tech-groups li a").length,
    technologyGroups.flatMap((g) => g.links).length,
  );
  assert.equal(
    $(".index-service-5 h3 a").attr("href"),
    "/design-preview/custom-software-development#hub-services",
  );
  const schema = serviceDirectorySchema("https://netofficials.com");
  assert.equal(schema["@graph"].length, 7);
  assert.equal(schema["@graph"][0]["@type"], "WebPage");
  assert.ok(!JSON.stringify(schema).includes("/design-preview/"));
  assert.equal($("#contact").length, 1);
  assert.ok(
    !/30-minute|60–75%|HIPAA compliant|roles available/.test($("main").text()),
  );
});
test("All seven parent service hubs have separate inventory-backed directories", () => {
  assert.deepEqual(
    serviceHubs.map((h) => h.path),
    [
      "/custom-software-development",
      "/mobile-app-development",
      "/ai-development-services",
      "/cloud-services",
      "/web-development",
      "/seo-services",
      "/ppc-services",
    ],
  );
  const seo = serviceHubs.find((h) => h.path === "/seo-services")!;
  const ppc = serviceHubs.find((h) => h.path === "/ppc-services")!;
  assert.deepEqual(
    hubChildren(seo).map((p) => p.url),
    [
      "/technical-seo-services",
      "/local-seo-services",
      "/ecommerce-seo-services",
    ],
  );
  assert.deepEqual(
    hubChildren(ppc).map((p) => p.url),
    ["/google-ads-management"],
  );
});
test("Hub CTA uses the homepage enquiry template and both mobile platforms have vector assets", () => {
  const home = getDesignSource("software-led");
  const $home = load(
    renderToStaticMarkup(
      <DesignPage
        design={home}
        content={contentSchema.parse({
          title: home.title,
          description: "Homepage",
          texts: home.texts,
        })}
        preview
      />,
    ),
  );
  const $hub = render({ path: "/mobile-app-development", preview: true });
  assert.equal($hub("#contact h2").text(), $home("#contact h2").text());
  assert.equal(
    $hub('#contact button[type="submit"]').text(),
    $home('#contact button[type="submit"]').text(),
  );
  for (const asset of ["android", "apple"]) {
    assert.equal(
      $hub(`#hub-stack img[src="/assets/technologies/${asset}.svg"]`).length,
      1,
    );
    assert.match(
      readFileSync(`public/assets/technologies/${asset}.svg`, "utf8"),
      /<path/,
    );
  }
});
test("Every inventory child has a hub link even before publication", () => {
  for (const hub of serviceHubs) {
    const $ = render({ path: hub.path });
    const cards = $("#hub-services article");
    assert.equal(cards.length, hubChildren(hub).length);
    assert.ok(cards.length > 0);
    for (const child of hubChildren(hub)) {
      assert.ok($(`#hub-services a[href="${child.url}"]`).length);
      assert.ok(cards.text().includes(child.h1));
    }
    assert.equal($("main h1").length, 1);
  }
});
test("Private preview maps planned child destinations without changing public URLs", () => {
  const $ = render({
    path: "/mobile-app-development",
    preview: true,
    linkMap: {
      "/android-app-development": "/admin/preview/example",
      "/": "/admin/site",
    },
  });
  assert.equal(
    $('#hub-services h3 a[href="/admin/preview/example"]').length,
    1,
  );
  assert.equal($(".nm-cta").attr("href"), "#contact");
  // The menu only links destinations the preview can open.
  assert.equal($('.nm-header a[href="/services"]').length, 0);
});
test("Saved hero, deliverables and FAQs replace defaults and schema matches answers", () => {
  const content = contentSchema.parse({
    title: "Saved mobile services",
    description: "Saved description",
    texts: {},
    hero: {
      heading: "Mobile applications for field teams",
      body: "Saved opening copy.",
      ctaLabel: "Start a Project",
      ctaPath: "/contact",
    },
    sections: [
      {
        id: "section-1",
        level: 2,
        heading: "What We Deliver",
        paragraphs: [],
        items: ["Saved deliverable"],
        cards: [],
        table: { columns: [], rows: [] },
        faqs: [],
        links: [],
      },
      {
        id: "section-2",
        level: 2,
        heading: "Frequently Asked Questions",
        paragraphs: [],
        items: [],
        cards: [],
        table: { columns: [], rows: [] },
        faqs: [{ question: "Saved question?", answer: "Saved answer." }],
        links: [],
      },
    ],
  });
  const $ = render({ path: "/mobile-app-development", content });
  assert.equal($("h1").text(), "Mobile applications for field teams");
  assert.equal(
    $("#hub-deliverables .hub-deliverables").text(),
    "✓Saved deliverable",
  );
  const schema = JSON.parse($('script[type="application/ld+json"]').html()!);
  assert.equal(schema[1].mainEntity[0].acceptedAnswer.text, "Saved answer.");
  assert.equal($("#hub-faq summary").text(), "Saved question?+");
});
test("Hub form preserves lead schema, required fields and service context", () => {
  for (const hub of serviceHubs) {
    const $ = render({ path: hub.path, preview: true });
    assert.equal($('[name="service"]').val(), hub.service);
    for (const name of ["name", "email", "service", "goal"])
      assert.ok($(`[name="${name}"]`).attr("required") !== undefined);
    assert.equal($('[name="company_url"]').length, 1);
    assert.ok(
      leadSchema.safeParse({
        requestId: "00000000-0000-4000-8000-000000000000",
        name: "Test",
        email: "test@example.com",
        service: hub.service,
        goal: "A project goal for testing",
        country: "",
        timeline: "",
        company_url: "",
        landingPage: hub.path,
        referrer: "",
        utm: {},
      }).success,
    );
  }
});
test("Project placeholders are explicit and never invent client outcomes", () => {
  const $ = render({ path: "/mobile-app-development" });
  assert.match($("#hub-work").text(), /relevant project example/);
  assert.equal($("#hub-work .hub-work-art").length, 0);
  assert.doesNotMatch(
    $("main").text(),
    /50\+ apps|4–12 week|Free 30-minute|30-day post-launch/,
  );
});
