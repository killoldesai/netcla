import test from "node:test";
import assert from "node:assert/strict";
import { parseOutput } from "../src/providers";
import { contentSchema } from "../src/content";

const content = {
  title: "Example page",
  description: "Page description",
  texts: { intro: "Page content" },
};
test("Generation accepts raw, fenced and output-wrapped content", () => {
  for (const response of [
    JSON.stringify(content),
    "```json\n" + JSON.stringify(content) + "\n```",
    JSON.stringify({ output: content }),
  ]) {
    assert.equal(
      contentSchema.parse(parseOutput(response)).texts.intro,
      content.texts.intro,
    );
  }
});
test("Envelope handling keeps malformed content validation intact", () => {
  for (const response of [
    { output: { title: "Example page" } },
    { output: [] },
    { output: "text" },
    { output: { ...content, unexpected: true } },
  ]) {
    assert.throws(() =>
      contentSchema.parse(parseOutput(JSON.stringify(response))),
    );
  }
});
