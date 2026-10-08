import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../src/templates/site-plan.json";
import {
  breadcrumbs,
  pillarPages,
  pillars,
  relatedPaths,
  sitePage,
  sitePages,
  structureRedirects,
} from "../src/site-structure";

const planned = inventory.entries.map((entry) => entry.url);

test("Every planned URL has exactly one structure entry", () => {
  const paths = sitePages.map((page) => page.path);
  assert.equal(new Set(paths).size, paths.length, "duplicate structure paths");
  const missing = planned.filter((url) => !sitePage(url));
  assert.deepEqual(missing, []);
});

test("Each pillar has a hub page and children", () => {
  assert.equal(pillars.length, 8);
  for (const pillar of pillars) {
    assert.equal(sitePage(pillar.hub)?.type, "pillar", pillar.id);
    assert.equal(sitePage(pillar.hub)?.pillar, pillar.id, pillar.id);
    assert.ok(pillarPages(pillar.id).length >= 6, pillar.id);
  }
});

test("Menu copy stays short enough for the mega menu", () => {
  for (const page of sitePages) {
    assert.ok(page.label.length <= 28, page.path);
    assert.ok(page.blurb.length <= 70, page.path);
  }
});

test("Breadcrumbs and related links follow the pillar", () => {
  assert.deepEqual(
    breadcrumbs("/flutter-app-development").map((b) => b.path),
    ["/", "/mobile-app-development", "/flutter-app-development"],
  );
  const related = relatedPaths("/flutter-app-development");
  assert.equal(related[0], "/mobile-app-development");
  assert.ok(related.every((path) => sitePage(path)?.pillar === "mobile"));
});

test("Redirect targets exist in the structure", () => {
  for (const target of Object.values(structureRedirects))
    assert.ok(sitePage(target), target);
});
