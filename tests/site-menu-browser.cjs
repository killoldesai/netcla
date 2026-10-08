const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const p = await browser.newPage();
    await p.goto(process.env.SITE_URL + "/admin/login");
    await p.locator("[name=email]").fill(process.env.OWNER_EMAIL);
    await p.locator("[name=password]").fill(process.env.OWNER_PASSWORD);
    await p.getByRole("button", { name: "Sign in", exact: true }).click();
    await p.waitForURL((url) => url.pathname === "/admin");
    const data = await p.evaluate(async () =>
      (await fetch("/api/admin")).json(),
    );
    const sitemapPaths = Object.keys(
      JSON.parse(fs.readFileSync("src/templates/presentations.json", "utf8")),
    );
    assert.equal(sitemapPaths.length, 151);
    for (const width of [1440, 390]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(process.env.SITE_URL + "/admin/site");
      await p.locator("main h1").waitFor();
      const heading = await p.locator("main h1").innerText();
      assert.ok(heading.length > 0);
      if (width === 390)
        await p.getByRole("button", { name: "Menu", exact: true }).click();
      const hrefs = [];
      for (const scope of [
        "Services",
        "Technologies",
        "Hire Developers",
        "Industries",
        "Company",
      ]) {
        await p
          .locator("#navigation")
          .getByRole("button", { name: scope, exact: true })
          .click();
        await p.locator("#site-menu").waitFor();
        hrefs.push(
          ...(await p
            .locator("#site-menu a")
            .evaluateAll((a) => a.map((x) => x.getAttribute("href")))),
        );
        assert.ok(
          (await p.locator("#site-menu section:not([hidden])").count()) === 1,
        );
      }
      const missing = [];
      for (const path of sitemapPaths) {
        const page = data.pages.find((x) => x.path === path && !x.archived_at);
        if (
          !page ||
          !hrefs.includes(
            path === "/" ? "/admin/site" : "/admin/preview/" + page.id,
          )
        )
          missing.push(path);
      }
      assert.deepEqual(
        missing,
        [],
        "Every one of the 151 sitemap URLs must be mapped",
      );
      assert.equal(
        new Set(hrefs).size,
        hrefs.length,
        "No duplicate menu destinations",
      );
      assert.equal(
        hrefs.length,
        151,
        "Sitemap menu excludes older prototype routes",
      );
      console.log(
        "151/151 sitemap URLs mapped; " +
          hrefs.length +
          " total menu destinations",
      );
      assert.ok(
        !(await p.locator("#site-menu").innerText()).includes("| Netofficials"),
      );
      await p
        .locator("#navigation")
        .getByRole("button", { name: "Technologies", exact: true })
        .click();
      assert.ok(
        await p
          .locator("#site-menu section:not([hidden])")
          .innerText()
          .then((text) => text.includes("React")),
      );
      for (const page of data.pages.filter(
        (x) => !x.archived_at && sitemapPaths.includes(x.path),
      )) {
        assert.ok(
          hrefs.includes(
            page.path === "/" ? "/admin/site" : "/admin/preview/" + page.id,
          ),
          page.path,
        );
      }
      await p
        .locator("#navigation")
        .getByRole("button", { name: "Services", exact: true })
        .click();
      await p.locator("#site-menu input").fill("automation");
      assert.ok((await p.locator("#site-menu a").count()) > 0);
      assert.ok((await p.locator("#site-menu a").count()) < hrefs.length);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await p.locator("#site-menu input").fill("");
      require("node:fs").mkdirSync("test-results/menu", { recursive: true });
      await p.screenshot({
        path: "test-results/menu/categories-" + width + ".png",
      });
      await p.keyboard.press("Escape");
      assert.equal(await p.locator("#site-menu").count(), 0);
      console.log(width + " connected homepage/menu passed");
    }
    const privatePage = await browser.newPage();
    const response = await privatePage.goto(
      process.env.SITE_URL + "/admin/site",
    );
    assert.equal(response.status(), 404);
    console.log("Private site access protected; no drafts published.");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
