const { chromium } = require("@playwright/test"),
  assert = require("node:assert/strict");
(async () => {
  const base = process.env.TEST_BASE_URL || "http://localhost:3004";
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const post = async (body) =>
    context.request.post(base + "/api/admin", {
      headers: { Origin: base },
      data: body,
    });
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
  let data = await (await context.request.get(base + "/api/admin")).json();
  const target = data.pages.find(
      (p) => p.path === "/custom-software-development",
    ),
    before = data.leads.length;
  assert.equal(
    (await post({ action: "publish", id: target.id })).status(),
    200,
  );
  const page = await context.newPage();
  await page.goto(base + target.path);
  await page.evaluate(() => {
    window.testEvents = [];
    window.gtag = (...args) => window.testEvents.push(args);
  });
  await page.locator("input[name=name]").fill("Browser Buyer");
  await page.locator("input[name=email]").fill("buyer@example.test");
  await page
    .locator("textarea[name=goal]")
    .fill("Build a portal for our customers");
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unable to store. Try again." }),
    }),
  );
  await page.locator("form button[type=submit]").click();
  await page
    .locator(".form-status")
    .filter({ hasText: "Unable to store" })
    .waitFor();
  assert.equal(
    await page.locator("input[name=name]").inputValue(),
    "Browser Buyer",
  );
  assert.equal((await page.evaluate(() => window.testEvents)).length, 0);
  await page.unroute("**/api/leads");
  await page.locator("form button[type=submit]").click();
  await page.locator(".form-status").filter({ hasText: "received" }).waitFor();
  assert.equal((await page.evaluate(() => window.testEvents)).length, 1);
  await page.locator("form button[type=submit]").click();
  await page.waitForResponse(
    (r) => r.url().endsWith("/api/leads") && r.status() === 200,
  );
  assert.equal((await page.evaluate(() => window.testEvents)).length, 1);
  data = await (await context.request.get(base + "/api/admin")).json();
  assert.equal(data.leads.length, before + 1);
  assert.equal(
    (await post({ action: "unpublish", id: target.id })).status(),
    200,
  );
  await browser.close();
  console.log(
    "Form failure preserves fields; successful storage emits one conversion; repeat submission is deduplicated",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
