import React from "react";
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { V3Page } from "../src/v3-page";
import { contentSchema } from "../src/content";
const content = contentSchema.parse({
  schemaVersion: 3,
  title: "Mobile applications",
  description: "Mobile applications built around your requirements.",
  texts: {},
  pageBlueprint: {
    hero: {
      recommended_component: "HeroSplit",
      spacing_above: 0,
      background: "#ffffff",
      max_width: "1320px",
      mobile_stack: "Stack",
    },
    "services-grid": {
      recommended_component: "ServiceDirectory",
      spacing_above: 64,
      background: "#ffffff",
      max_width: "1320px",
      mobile_stack: "Stack",
    },
    faq: {
      recommended_component: "AccordionFull",
      spacing_above: 64,
      background: "#ffffff",
      max_width: "960px",
      mobile_stack: "Stack",
    },
    "technology-stack": {
      recommended_component: "TechnologyGrid",
      spacing_above: 64,
      background: "#ffffff",
      max_width: "1320px",
      mobile_stack: "Stack",
    },
    "cta-banner": {
      recommended_component: "DarkCtaBand",
      spacing_above: 64,
      background: "#061b31",
      max_width: "100pct",
      mobile_stack: "Stack",
    },
  },
  pageSections: [
    {
      id: "hero",
      order: 1,
      fields: {
        h1: "Mobile apps for your business",
        subheadline: "Plan devices, workflows and releases.",
        cta_primary_label: "Discuss your project",
      },
    },
    {
      id: "services-grid",
      order: 2,
      fields: {
        heading: "Mobile services",
        svc_1_title: "Flutter",
        svc_1_body: "Shared application code.",
        svc_1_url: "/flutter-app-development",
        svc_1_icon_key: "mobile-device",
      },
    },
    {
      id: "faq",
      order: 3,
      fields: {
        heading: "Questions",
        q1: "What happens next?",
        a1: "We review your requirements.",
      },
    },
    {
      id: "technology-stack",
      order: 4,
      fields: {
        heading: "Platforms",
        group_1_name: "Mobile",
        group_1_items: "iOS, Android, AWS, Azure",
      },
    },
    {
      id: "cta-banner",
      order: 5,
      fields: {
        heading: "Discuss your next release",
        cta_primary_label: "Discuss your project",
      },
    },
  ],
  provenance: {
    specificationId: "11111111-1111-4111-8111-111111111111",
    specificationHash: "a".repeat(64),
    runId: "22222222-2222-4222-8222-222222222222",
    version: 1,
    validation: [],
    generatedAt: new Date().toISOString(),
  },
});
test("V3 hubs preserve complete directories, real logos and one shared bottom CTA", () => {
  const $ = load(
    renderToStaticMarkup(
      <V3Page
        content={content}
        path="/mobile-app-development"
        paths={["/contact", "/services", "/flutter-app-development"]}
      />,
    ),
  );
  assert.equal($("h1").length, 1);
  // Without a generated hero image every template falls back to the same text hero.
  assert.equal($(".v3-hero-grid.v3-hero-text").length, 1);
  assert.equal($(".v3-hero-grid figcaption").length, 0);
  assert.equal($(".service-art img").length, 0);
  assert.equal($(".v3-section--services-grid").length, 1);
  assert.ok($(".v3-directory a").length > 6);
  assert.equal($("#cta-banner").length, 1);
  assert.equal($("main form").length, 0);
  const logos = $('main img[src^="/brand/"]').map((_, el) => $(el).attr("src")).get();
  for (const id of ["android", "dev-amazonwebservices", "dev-azure"]) assert.ok(logos.includes(`/brand/${id}.svg`), id);
  assert.match($("#cta-banner a").first().attr("href")!, /service=Mobile/);
  const schema = JSON.parse($('script[type="application/ld+json"]').text())["@graph"].find((n: any) => n["@type"] === "FAQPage");
  assert.equal(
    schema.mainEntity[0].name,
    $(".v3-faq summary").text().replace("+", ""),
  );
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, $(".v3-faq p").text());
});
test("private V3 preview resolves private destinations and disables sending", () => {
  const $ = load(
    renderToStaticMarkup(
      <V3Page
        content={content}
        path="/mobile-app-development"
        paths={[]}
        preview
        linkMap={{
          "/contact": "/admin/preview/contact",
          "/flutter-app-development": "/admin/preview/flutter",
        }}
      />,
    ),
  );
  assert.equal(
    $("#services-grid .v3-cards a").attr("href"),
    "/admin/preview/flutter",
  );
  assert.match(
    $("#cta-banner a").first().attr("href")!,
    /^\/admin\/preview\/contact\?service=/,
  );
  assert.match($(".preview-banner").text(), /forms disabled/);
});
test("inner service breadcrumb is separate from the hero label", () => {
  const child = contentSchema.parse({...content,pageSections:content.pageSections?.map(section=>section.id==='hero'?{...section,fields:{...section.fields,tag_pill:'Flutter app development services'}}:section)});
  const $ = load(renderToStaticMarkup(<V3Page content={child} path="/flutter-app-development" paths={[]} />));
  assert.equal($('.v3-hero-breadcrumb a').last().attr('href'),'/mobile-app-development');
  assert.equal($('.v3-hero-breadcrumb [aria-current=page]').text(),'Flutter');
  assert.equal($('.v3-hero-grid .v3-hero-breadcrumb').length,0);
  assert.equal($('.v3-hero-grid .v3-tag').text(),'Flutter app development services');
  assert.equal($('.v3-hero-grid figcaption').length,0);
});
test("hub supplies its configured stack and paired services use descriptive links", () => {
 const revised=contentSchema.parse({...content,pageBlueprint:{...content.pageBlueprint,'why-netofficials':{...content.pageBlueprint!['services-grid']},'related-hubs':{...content.pageBlueprint!['services-grid']}},pageSections:[...content.pageSections!.filter(s=>s.id!=='technology-stack'),{id:'why-netofficials',order:6,fields:{heading:'Why Netofficials',adv_1:'Plan around your requirements.'}},{id:'related-hubs',order:7,fields:{heading:'Paired services',hub_1_name:'API development',hub_1_body:'Connect your application.',hub_1_url:'/api-development-services'}}]});
 const $=load(renderToStaticMarkup(<V3Page content={revised} path="/mobile-app-development" paths={[]} />));
 assert.equal($('#technology-stack').length,1);
 assert.ok($('.service-stack-tool img').length>5);
 assert.equal($('.service-paired-link').attr('href'),'/api-development-services');
 assert.match($('.service-paired-link').text(),/Explore API development/);
 assert.equal($('.service-reason-icon').length,1);
});
test("hub FAQ fallback matches schema and uses native exclusive accordions",()=>{
 const withoutFaq=contentSchema.parse({...content,pageSections:content.pageSections!.filter(s=>s.id!=='faq')});
 const $=load(renderToStaticMarkup(<V3Page content={withoutFaq} path="/mobile-app-development" paths={[]} />));
 const schema=JSON.parse($('script[type="application/ld+json"]').text())['@graph'].find((n:any)=>n['@type']==='FAQPage');
 assert.ok($('#faq details').length>0);
 assert.equal($('#faq details').length,schema.mainEntity.length);
 assert.equal($('#faq details').first().attr('name'),'service-faq');
 assert.equal($('.v3-step').filter((_,e)=>/^\d+$/.test($(e).text().trim())).length,0);
});
