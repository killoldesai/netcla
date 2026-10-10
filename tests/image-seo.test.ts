import assert from "node:assert/strict";
import test from "node:test";
import { keywordName, uniqueName } from "../src/image-seo";

test("image file names lead with the page topic and stay under 60 characters", () => {
  const name = keywordName("Conceptual illustration for Mobile App Development Services | Netofficials", "mobile-app-development");
  assert.equal(name, "mobile-app-development-services-netofficials");
  const long = keywordName("Flat diagram illustrating React Virtual DOM diffing process between component tree and browser DOM", "react-development-services");
  assert.ok(long.length <= 60, long);
  assert.match(long, /^react-development-services-/);
  assert.doesNotMatch(long, /-(of|and|the|for)$/);
});

test("names without a page fall back to the alt text", () => {
  assert.equal(keywordName("Conceptual illustration for Engagement Models | Netofficials"), "engagement-models-netofficials");
});

test("repeated names get the section id appended", () => {
  const taken = new Set(["engagement-models-netofficials"]);
  assert.equal(uniqueName("engagement-models-netofficials", "hero", taken), "engagement-models-netofficials-hero");
});
