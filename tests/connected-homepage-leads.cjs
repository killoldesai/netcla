// Run only against a disposable local database/app, never the live site.
const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.TEST_BASE_URL || "http://localhost:3013";
assert.ok(
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base),
  "Local test server required",
);
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const post = (body) =>
    context.request.post(base + "/api/admin", {
      headers: { Origin: base },
      data: body,
    });
  try {
    assert.equal(
      (
        await context.request.post(base + "/api/auth/login", {
          headers: { Origin: base },
          data: {
            email: "owner@example.test",
            password: "local-test-password-only",
          },
        })
      ).status(),
      200,
    );
    const state = await (await context.request.get(base + "/api/admin")).json();
    const home = state.pages.find((p) => p.path === "/");
    const design = JSON.parse(
      fs.readFileSync("src/templates/designs.json", "utf8"),
    ).find((d) => d.id === "software-led");
    assert.deepEqual(
      Object.keys(home.content.texts).sort(),
      Object.keys(design.texts).sort(),
      "Legacy drafts must expose the current editable slots",
    );
    assert.ok(
      !home.validation.errors.some((error) => /text fields/.test(error)),
    );
    const saved = {
      ...home.content,
      texts: {
        t1: "Saved business headline.",
        retired: "Obsolete layout text",
      },
      hiddenSections: [],
      unresolved: [],
    };
    const save = await post({ action: "save", id: home.id, content: saved });
    assert.equal(save.status(), 200, await save.text());
    const privatePreview = await context.request.get(base + "/admin/site");
    assert.equal(privatePreview.status(), 200);
    assert.ok(
      (await privatePreview.text()).includes("Saved business headline."),
    );
    const publish = await post({ action: "publish", id: home.id });
    assert.equal(publish.status(), 200, await publish.text());
    const page = await context.newPage();
    await page.goto(base + "/?utm_source=homepage-test", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    assert.ok(
      (await page.locator("h1").textContent()).includes(
        "Saved business headline.",
      ),
    );
    assert.equal(
      await page.locator("a[data-published-link]").count(),
      0,
      "Draft service links must stay hidden",
    );
    await page.evaluate(() => {
      window.testEvents = [];
      window.gtag = (...args) => window.testEvents.push(args);
    });
    await page.locator(".hub-row[data-hub=ai] a[data-service]").click();
    assert.equal(
      await page.locator("#service").inputValue(),
      "AI & business automation",
    );
    await page.locator("input[name=name]").fill("Homepage Buyer");
    await page.locator("input[name=email]").fill("buyer@example.test");
    await page
      .locator("textarea[name=goal]")
      .fill("Connect our business workflows with a useful application");
    await page.route("**/api/leads", (r) =>
      r.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporary test failure" }),
      }),
    );
    await page.locator("form button[type=submit]").click();
    await page
      .locator(".form-status")
      .filter({ hasText: "Temporary test failure" })
      .waitFor();
    assert.equal(
      await page.locator("input[name=name]").inputValue(),
      "Homepage Buyer",
    );
    await page.unroute("**/api/leads");
    await page.route("**/api/leads", (r) =>
      r.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Check the highlighted information",
          fields: { goal: ["Test validation message"] },
        }),
      }),
    );
    await page.locator("form button[type=submit]").click();
    await page.locator("#lead-error-goal").waitFor();
    assert.equal(
      await page.locator("textarea[name=goal]").getAttribute("aria-invalid"),
      "true",
    );
    await page.unroute("**/api/leads");
    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/leads") && r.status() === 201,
    );
    await page.locator("form button[type=submit]").click();
    await response;
    await page
      .locator(".form-status")
      .filter({ hasText: "received" })
      .waitFor();
    assert.equal(
      await page.locator("textarea[name=goal]").getAttribute("aria-invalid"),
      null,
    );
    const duplicate = page.waitForResponse(
      (r) => r.url().endsWith("/api/leads") && r.status() === 200,
    );
    await page.locator("form button[type=submit]").click();
    await duplicate;
    const events = await page.evaluate(() => window.testEvents);
    assert.equal(events.filter((e) => e[1] === "generate_lead").length, 1);
    assert.ok(
      events.some((e) => e[1] === "consultation_click" && e[2].hub === "ai"),
    );
    assert.ok(!JSON.stringify(events).includes("buyer@example.test"));
    assert.ok(!JSON.stringify(events).includes("Homepage Buyer"));
    const after = await (await context.request.get(base + "/api/admin")).json();
    assert.equal(after.leads.length, state.leads.length + 1);
    assert.equal(after.leads[0].data.utm.utm_source, "homepage-test");
    console.log(
      "Public homepage saved copy, draft link filtering, field errors, retry, real lead storage, attribution and single conversion verified.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
