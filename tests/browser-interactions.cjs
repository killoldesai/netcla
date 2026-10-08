const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultNavigationTimeout(120000);
  await page.goto("http://localhost:3000/design-preview/software-led");
  await page.locator(".menu").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator(".menu").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".menu").getAttribute("aria-expanded"),
    "false",
  );
  const faq = page.locator(".faqs details").nth(1);
  await faq.locator("summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await faq.getAttribute("open"), "");
  await page.locator('[data-step="define"]').click();
  assert.equal(
    await page.locator('[data-step="define"]').getAttribute("aria-pressed"),
    "true",
  );
  assert.ok(
    (await page.locator("#step-title").textContent()).includes("shared plan"),
  );
  await page.locator('[data-service="Custom software"]').first().click();
  assert.equal(await page.locator("#service").inputValue(), "Custom software");
  await page.locator("input[name=name]").fill("Preview Buyer");
  await page.locator("input[name=email]").fill("buyer@example.test");
  await page
    .locator("textarea[name=goal]")
    .fill("Build a portal for our customers");
  await page.locator("form button[type=submit]").click();
  assert.ok(
    (await page.locator(".form-status").textContent()).includes("no enquiry"),
  );
  await page.goto("http://localhost:3000/design-preview/services");
  const filters = page.locator("[data-filter]");
  assert.ok((await filters.count()) > 1);
  await filters.nth(1).click();
  assert.equal(await filters.nth(1).getAttribute("aria-pressed"), "true");
  assert.ok((await page.locator("[data-category][hidden]").count()) > 0);
  await browser.close();
  console.log(
    "Keyboard navigation, FAQs, delivery tabs, service choice, preview forms and filters passed",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
