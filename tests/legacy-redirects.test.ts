import test from "node:test";
import assert from "node:assert/strict";
import { legacyRedirects } from "../src/legacy-redirects";
import { sitePage, structureRedirects } from "../src/site-structure";

// Pages that exist outside the structure list (policy pages).
const extra = new Set(["/privacy-policy", "/terms"]);

test("Legacy redirects send every old URL to a page that exists on the new site", () => {
  for (const [from, to] of Object.entries(legacyRedirects)) {
    assert.ok(sitePage(to) || extra.has(to), from + " redirects to unknown page " + to);
  }
});

test("Legacy redirects never shadow a live page, loop or chain", () => {
  for (const [from, to] of Object.entries(legacyRedirects)) {
    assert.ok(!sitePage(from), from + " is a live page and must not be redirected");
    assert.notEqual(from, to);
    assert.ok(!legacyRedirects[to] && !structureRedirects[to], from + " chains through " + to);
  }
});

test("The old site's 88 retired URLs are all covered", () => {
  assert.equal(Object.keys(legacyRedirects).length, 88);
});
