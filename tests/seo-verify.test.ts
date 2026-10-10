import assert from "node:assert/strict";
import test from "node:test";
import { verifySameAs } from "../src/seo-verify";

test("sameAs links are kept only when Wikipedia or Wikidata answers", async () => {
  const seen: string[] = [];
  const fetcher = async (url: string) => {
    seen.push(url);
    return { ok: !url.includes("Missing_Page") };
  };
  const out = await verifySameAs(
    [
      { name: "Kotlin", sameAs: "https://en.wikipedia.org/wiki/Kotlin_(programming_language)" },
      { name: "Invented", sameAs: "https://en.wikipedia.org/wiki/Missing_Page_One" },
      { name: "Wikidata", sameAs: "https://www.wikidata.org/wiki/Q42" },
      { name: "Not allowed", sameAs: "https://example.com/kotlin" },
      { name: "No link", sameAs: "" },
    ],
    fetcher,
  );
  assert.deepEqual(
    out.map((a) => [a.name, a.sameAs]),
    [
      ["Kotlin", "https://en.wikipedia.org/wiki/Kotlin_(programming_language)"],
      ["Invented", ""],
      ["Wikidata", "https://www.wikidata.org/wiki/Q42"],
      ["Not allowed", ""],
      ["No link", ""],
    ],
  );
  // Disallowed hosts and empty links are never requested.
  assert.ok(!seen.some((u) => u.includes("example.com")));
});

test("network errors drop the link instead of failing the page", async () => {
  const out = await verifySameAs(
    [{ name: "Dart", sameAs: "https://en.wikipedia.org/wiki/Dart_(programming_language)" }],
    async () => {
      throw new Error("offline");
    },
  );
  assert.equal(out[0].sameAs, "");
});
