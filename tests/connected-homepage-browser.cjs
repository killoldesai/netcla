const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.TEST_BASE_URL || "http://localhost:3012";
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  fs.mkdirSync("tests/visual-results/connected-homepage", { recursive: true });
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 960 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/design-preview/software-led", {
        waitUntil: "networkidle",
        timeout: 120000,
      });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator(".hub-row").count(), 4);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `overflow at ${width}`,
      );
      for (const [hub, service] of [
        ["software", "Custom software"],
        ["mobile", "Mobile application development"],
        ["ai", "AI & business automation"],
        ["cloud", "Cloud & DevOps"],
        ["web", "Website design & development"],
        ["search", "SEO"],
      ]) {
        await page
          .locator(`main [data-hub=${hub}] a[data-service]`)
          .click();
        assert.equal(await page.locator("#service").inputValue(), service);
      }
      await page.locator("input[name=name]").fill("Preview Buyer");
      await page.locator("input[name=email]").fill("buyer@example.test");
      await page
        .locator("textarea[name=goal]")
        .fill("Build a useful business application");
      let leadRequests = 0;
      page.on("request", (r) => {
        if (r.url().endsWith("/api/leads")) leadRequests++;
      });
      await page.locator("form button[type=submit]").click();
      await page
        .locator(".form-status")
        .filter({ hasText: "Preview only" })
        .waitFor();
      assert.equal(leadRequests, 0);
      const faq = page.locator("#faq details").nth(1);
      await faq.locator("summary").click();
      assert.equal(await faq.getAttribute("open"), "");
      await page.locator("#goal-modernize").click();
      assert.ok(await page.locator("#panel-modernize").isVisible());
      assert.ok(await page.locator("#panel-product").isHidden());
      await page.keyboard.press("ArrowDown");
      assert.ok(await page.locator("#panel-team").isVisible());
      const toggle = page.locator(
        width < 1024
          ? "button[aria-controls=mobile-menu]"
          : "button[aria-controls=services-menu]",
      );
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `tests/visual-results/connected-homepage/home-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `tests/visual-results/connected-homepage/hero-${width}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const id of [
      "custom-software",
      "mobile-development",
      "services",
      "about",
      "contact",
    ]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      await page.goto(base + "/design-preview/" + id, {
        waitUntil: "networkidle",
        timeout: 120000,
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${id} overflow`,
      );
      assert.ok(await page.locator(".connected-header").isVisible());
      assert.ok(await page.locator(".connected-footer").count());
      await page.close();
    }
    console.log(
      "Homepage layout, six service contexts, preview form, keyboard navigation and five inner-page chrome checks passed.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
