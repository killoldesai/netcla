import assert from "node:assert/strict";
import test from "node:test";
import { hasDash, plainDashes } from "../src/prompts/punctuation";

test("em and en dashes become commas, ranges become 'to', and HTML is untouched", () => {
  assert.equal(plainDashes("A group of engineers — which may include QA — works for you."), "A group of engineers, which may include QA, works for you.");
  assert.equal(plainDashes("Plan for 3–6 months."), "Plan for 3 to 6 months.");
  assert.equal(plainDashes("<p>One — two</p><ul><li>Three – four</li></ul>"), "<p>One, two</p><ul><li>Three, four</li></ul>");
  assert.equal(plainDashes("Fixed-price and time-and-materials."), "Fixed-price and time-and-materials.");
  assert.equal(plainDashes("Ends here —."), "Ends here.");
  assert.equal(plainDashes("No dashes at all."), "No dashes at all.");
});

test("hasDash ignores hyphens and dashes inside tags", () => {
  assert.equal(hasDash("Fixed-price"), false);
  assert.equal(hasDash('<a href="/a—b">x</a>'), false);
  assert.equal(hasDash("One — two"), true);
});
