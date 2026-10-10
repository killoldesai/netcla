import assert from "node:assert/strict";
import test from "node:test";
import { requiresFaq } from "../src/prompts/templates";

test("FAQs are required on commercial and guide pages only", () => {
  assert.equal(requiresFaq("/hire-react-developer"), true);
  assert.equal(requiresFaq("/blog/website-development-cost-india"), true);
  assert.equal(requiresFaq("/contact"), false);
  assert.equal(requiresFaq("/privacy-policy"), false);
  assert.equal(requiresFaq("/careers"), false);
});
