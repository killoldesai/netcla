import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { readSitePlan, emptyPlanContent } from "../src/site-plan";
import { presentationFor, designReady } from "../src/presentation";
import { StructuredPage } from "../src/structured-page";
import { publicContent } from "../src/public-content";
import { structuredData } from "../src/structured-data";
import { getDesign } from "../src/designs";
import { contentSchema } from "../src/content";
import { load } from "cheerio";
import { coreServicePaths } from "../src/core-services";
import { specialistPaths } from "../src/specialist-services";
import { solutionPaths } from "../src/solution-services";
import { trustPaths } from "../src/trust-pages";
test("Engagement and Trust pages retain briefs and FAQ category navigation", () => {
  for (const path of trustPaths) {
    const entry = readSitePlan().entries.find((e) => e.url === path)!;
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(path)!}
          preview
        />,
      ),
    );
    assert.equal($(".trust-art").length, 1);
    if (path === "/faq")
      assert.equal(
        $('nav[aria-label="Question categories"] a').length,
        entry.headings.length,
      );
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Search marketing pages preserve briefs and existing core-service layouts", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "marketing",
  );
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal(
      $(".marketing-art").length,
      coreServicePaths.includes(entry.url) ? 0 : 1,
    );
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Location pages preserve regional briefs and show India-based remote delivery", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "location",
  );
  assert.equal(entries.length, 8);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-location .location-art").length, 1);
    assert.ok($(".location-art").text().includes("INDIA-BASED DELIVERY"));
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Solution pages preserve reconciled briefs and existing specialist presentations", () => {
  for (const path of solutionPaths) {
    const entry = readSitePlan().entries.find((e) => e.url === path)!;
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(path)!}
          preview
        />,
      ),
    );
    assert.equal(
      $(".solution-art").length,
      specialistPaths.includes(path) ? 0 : 1,
    );
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Industry pages preserve sector-specific headings with workflow artwork", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "industry",
  );
  assert.equal(entries.length, 12);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-industry .industry-art").length, 1);
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Technology pages preserve platform briefs with dedicated workspace artwork", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "technology",
  );
  assert.equal(entries.length, 24);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-technology .technology-art").length, 1);
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Hiring pages preserve role briefs and use collaboration artwork", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "hire",
  );
  assert.equal(entries.length, 32);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-hire .hire-art").length, 1);
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Specialist software briefs retain heading hierarchy and use dedicated artwork", () => {
  for (const path of specialistPaths) {
    const entry = readSitePlan().entries.find((e) => e.url === path)!;
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(path)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-specialist .specialist-art").length, 1);
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("Cloud briefs preserve all headings with infrastructure artwork", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "cloud",
  );
  assert.equal(entries.length, 8);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-cloud .cloud-art").length, 1);
    for (const h of entry.headings)
      assert.equal(
        $("#" + h.id)
          .find("h" + h.level)
          .first()
          .text(),
        h.heading,
      );
  }
});
test("AI pages use specialised artwork while automation retains its approved renderer", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "ai",
  );
  assert.equal(entries.length, 15);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal(
      $(".csv-ai").length,
      entry.url === "/ai-automation-services" ? 0 : 1,
    );
    assert.equal(
      $(".ai-art").length,
      entry.url === "/ai-automation-services" ? 0 : 1,
    );
    for (const heading of entry.headings)
      assert.equal(
        $("#" + heading.id)
          .find("h" + heading.level)
          .first()
          .text(),
        heading.heading,
      );
  }
});
test("Mobile briefs use device artwork and preserve platform-specific content", () => {
  const entries = readSitePlan().entries.filter(
    (e) => presentationFor(e.url)?.family === "mobile",
  );
  assert.equal(entries.length, 9);
  for (const entry of entries) {
    const content = contentSchema.parse(emptyPlanContent(entry));
    const $ = load(
      renderToStaticMarkup(
        <StructuredPage
          content={content}
          presentation={presentationFor(entry.url)!}
          preview
        />,
      ),
    );
    assert.equal($(".csv-mobile .mobile-art").length, 1);
    assert.equal(
      $(".mobile-art").attr("aria-label")?.includes("Tablet"),
      entry.url === "/ipad-app-development",
    );
    for (const heading of entry.headings)
      assert.equal(
        $("#" + heading.id)
          .find("h" + heading.level)
          .first()
          .text(),
        heading.heading,
      );
  }
});
test("Core services use illustrated layouts and preserve nested process content and enquiry context", () => {
  for (const path of coreServicePaths) {
    const entry = readSitePlan().entries.find((e) => e.url === path)!;
    const content = contentSchema.parse(emptyPlanContent(entry));
    for (const s of content.sections!)
      s.paragraphs = ["Reviewed service scope and delivery requirements."];
    const html = renderToStaticMarkup(
      <StructuredPage
        content={content}
        presentation={presentationFor(path)!}
        preview
        linkMap={{ "/contact": "/admin/preview/contact" }}
      />,
    );
    const $ = load(html);
    assert.equal($(".csv-core").length, 1, path);
    assert.ok(
      $(".csv-hero-actions a").first().attr("href")?.includes("service="),
      path,
    );
    for (const h of entry.headings.filter((h) => h.level === 3)) {
      assert.equal(
        $("#" + h.id + " .automation-capability-art").length,
        1,
        path,
      );
      assert.equal($("#" + h.id + " h3").text(), h.heading);
    }
  }
});
test("All 151 CSV pages have a presentation and preserve every heading exactly once", () => {
  const inventory = readSitePlan();
  for (const entry of inventory.entries) {
    const presentation = presentationFor(entry.url);
    assert.ok(presentation?.ready, entry.url);
    const content = contentSchema.parse(emptyPlanContent(entry));
    const html = renderToStaticMarkup(
      <StructuredPage content={content} presentation={presentation} preview />,
    );
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, entry.url);
    const $ = load(html);
    for (const heading of entry.headings) {
      assert.equal(
        (html.match(new RegExp(`id="${heading.id}"`, "g")) ?? []).length,
        1,
        `${entry.url} ${heading.id}`,
      );
      assert.equal(
        $(`#${heading.id}`).find(`h${heading.level}`).first().text(),
        heading.heading,
      );
    }
    assert.ok(designReady({ path: entry.url, template: "site-plan", content }));
  }
  assert.equal(presentationFor("/unmapped-page"), undefined);
  assert.equal(
    designReady({ path: "/unmapped-page", template: "site-plan" }),
    false,
  );
});
test("Structured public data removes unpublished links, hidden sections and editorial evidence", () => {
  const e = readSitePlan().entries.find(
    (e) => e.url === "/ai-automation-services",
  )!;
  const content = contentSchema.parse(emptyPlanContent(e));
  content.sections![0].links = [
    { label: "Draft secret", path: "/draft-only" },
    { label: "Contact", path: "/contact" },
  ];
  content.hiddenSections = ["section-2"];
  content.claims = [
    {
      text: "Private evidence",
      factId: "00000000-0000-0000-0000-000000000000",
    },
  ];
  content.unresolved = ["Private notes"];
  const visible = publicContent(getDesign("site-plan"), content, [
    "/contact",
  ]).content;
  assert.deepEqual(visible.claims, []);
  assert.deepEqual(visible.unresolved, []);
  assert.ok(!visible.sections?.some((s) => s.id === "section-2"));
  assert.equal(visible.sections![0].links.length, 1);
  visible.sections!.at(-1)!.faqs = [
    { question: "What can be automated?", answer: "Document workflows." },
  ];
  const schema = structuredData(
    {
      path: e.url,
      kind: "service",
      content: visible,
      created_at: "2026-10-04",
      first_published_at: "2026-10-04",
    },
    getDesign("site-plan"),
    "https://example.test",
  );
  const faq = schema["@graph"].find((s) => s["@type"] === "FAQPage") as any;
  assert.equal(faq.mainEntity.length, 1);
  assert.equal(faq.mainEntity[0].name, "What can be automated?");
});
test("Foundation service categories keep paid search separate from AI and ecommerce development", () => {
  const entry = readSitePlan().entries.find((e) => e.url === "/services")!;
  const content = contentSchema.parse(emptyPlanContent(entry));
  const listing = [
    {
      path: "/ai-development-services",
      title: "AI development",
      kind: "service",
    },
    { path: "/google-ads-management", title: "Google Ads", kind: "service" },
    {
      path: "/ecommerce-seo-services",
      title: "Ecommerce SEO",
      kind: "service",
    },
  ];
  const map = Object.fromEntries(listing.map((p) => [p.path, p.path]));
  const html = renderToStaticMarkup(
    <StructuredPage
      content={content}
      presentation={presentationFor(entry.url)!}
      preview
      listing={listing}
      linkMap={map}
    />,
  );
  const $ = load(html);
  const marketing = entry.headings.find((h) => /SEO and Paid/.test(h.heading))!;
  const ai = entry.headings.find((h) => /^AI/.test(h.heading))!;
  const web = entry.headings.find((h) => /Website and Web/.test(h.heading))!;
  assert.ok(
    $("#" + marketing.id)
      .text()
      .includes("Google Ads"),
  );
  assert.ok(
    !$("#" + ai.id)
      .text()
      .includes("Google Ads"),
  );
  assert.ok(
    !$("#" + web.id)
      .text()
      .includes("Ecommerce SEO"),
  );
});
