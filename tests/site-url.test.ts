import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, siteUrl } from "../src/site-url";
import robots from "../app/robots";

function withEnv(env: Record<string, string | undefined>, run: () => void) {
  const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(env)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  try {
    run();
  } finally {
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  }
}

test("a trailing slash on SITE_URL never leaks into page URLs", () => {
  for (const site of ["https://example.com", "https://example.com/", "https://example.com//", " https://example.com/ "])
    withEnv({ SITE_URL: site }, () => {
      assert.equal(siteUrl(), "https://example.com");
      assert.equal(absoluteUrl("/about"), "https://example.com/about");
      assert.equal(absoluteUrl("about"), "https://example.com/about");
      assert.equal(absoluteUrl("/blog/seo-vs-ppc/"), "https://example.com/blog/seo-vs-ppc");
    });
});

test("the home page is the origin plus one slash, and the fallback applies when SITE_URL is unset", () => {
  withEnv({ SITE_URL: "https://example.com/" }, () => assert.equal(absoluteUrl("/"), "https://example.com/"));
  withEnv({ SITE_URL: undefined }, () => {
    assert.equal(siteUrl(), "http://localhost:3000");
    assert.equal(siteUrl("https://fallback.test/"), "https://fallback.test");
  });
});

test("robots.txt points at a single-slash sitemap URL even when SITE_URL ends in a slash", () => {
  withEnv({ SITE_URL: "https://example.com/", STAGING: "false" }, () => {
    const r = robots();
    assert.equal(r.sitemap, "https://example.com/sitemap.xml");
  });
});
