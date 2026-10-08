import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { MegaNavigation } from "../src/mega-navigation";
import { pillars, sitePages } from "../src/site-structure";

const render = (props: Parameters<typeof MegaNavigation>[0]) =>
  load(renderToStaticMarkup(<MegaNavigation {...props} />));

test("menus render closed with labelled, crawlable panes", () => {
  const $ = render({ paths: sitePages.map((p) => p.path) });
  assert.equal($(".nm-trigger").length, 5);
  assert.equal($('.nm-trigger[aria-expanded="false"]').length, 5);
  assert.equal($(".nm-panel[hidden]").length, 5);
  $(".nm-trigger").each((_, el) =>
    assert.equal($("#" + $(el).attr("aria-controls")).length, 1),
  );
  $("[role=tab]").each((_, el) => {
    const pane = $("#" + $(el).attr("aria-controls"));
    assert.equal(pane.attr("aria-labelledby"), $(el).attr("id"));
  });
  // Inactive service panes stay in the markup so every link is crawlable.
  for (const p of pillars.filter((x) => x.inServicesMenu))
    assert.equal($(`a[href="${p.hub}"]`).length > 0, true, p.hub);
  assert.ok($('a[href="/flutter-app-development"]').length > 0);
  assert.equal(
    $(".nm-toggle").attr("aria-controls"),
    $('nav[aria-label="Main navigation"]').attr("id"),
  );
});

test("only published pages are linked", () => {
  const published = ["/", "/contact", "/mobile-app-development", "/flutter-app-development"];
  const $ = render({ paths: published });
  const links = $(".nm-header a[href^='/']")
    .map((_, el) => $(el).attr("href")!.split("?")[0])
    .get();
  assert.ok(links.length > 0);
  assert.ok(links.every((href) => published.includes(href)), links.join(","));
  assert.equal($('a[href="/react-native-app-development"]').length, 0);
});

test("preview links are mapped and CTAs carry the pillar's service", () => {
  const $ = render({
    paths: [],
    preview: true,
    linkMap: {
      "/contact": "/admin/preview/contact",
      "/flutter-app-development": "/admin/preview/flutter",
    },
  });
  assert.equal($(".nm-cta").attr("href"), "/admin/preview/contact");
  assert.ok($('a[href="/admin/preview/flutter"]').length > 0);
  assert.equal(
    $(".nm-aside-cta").first().attr("href"),
    "/admin/preview/contact?service=" + encodeURIComponent(pillars[0].service),
  );
});

test("on-page contact anchors are not given a query string", () => {
  const $ = render({ paths: ["/"], contactHref: "#contact" });
  $(".nm-aside-cta").each((_, el) => assert.equal($(el).attr("href"), "#contact"));
});
