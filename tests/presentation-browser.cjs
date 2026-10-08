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
    const runtimeErrors = [];
    p.on("pageerror", (e) => runtimeErrors.push(e.message));
    await p.goto(process.env.SITE_URL + "/admin/login");
    await p.locator("[name=email]").fill(process.env.OWNER_EMAIL);
    await p.locator("[name=password]").fill(process.env.OWNER_PASSWORD);
    await p.getByRole("button", { name: "Sign in", exact: true }).click();
    await p.waitForURL("**/admin");
    const data = await p.evaluate(async () =>
      (await fetch("/api/admin")).json(),
    );
    const registry = JSON.parse(
      fs.readFileSync("src/templates/presentations.json", "utf8"),
    );
    const representative = [
      ...data.pages.filter((p) =>
        [
          "/how-we-work",
          "/engagement-models",
          "/why-choose-netofficials",
          "/faq",
          "/careers",
        ].includes(p.path),
      ),
      ...data.pages.filter((p) => registry[p.path]?.family === "marketing"),
      ...data.pages.filter((p) => registry[p.path]?.family === "location"),
      ...data.pages.filter((p) =>
        [
          "/saas-development-services",
          "/mvp-development-services",
          "/startup-software-development",
          "/enterprise-software-development",
          "/digital-transformation-services",
          "/legacy-software-modernisation",
          "/product-development-services",
          "/software-outsourcing-services",
          "/software-consulting-services",
          "/proof-of-concept-development",
          "/white-label-software-development",
          "/offshore-software-development",
        ].includes(p.path),
      ),
      ...data.pages.filter((p) => registry[p.path]?.family === "industry"),
      ...data.pages.filter((p) => registry[p.path]?.family === "technology"),
      ...data.pages.filter((p) => registry[p.path]?.family === "hire"),
      ...data.pages.filter((p) =>
        /^\/(?:erp-development-services|crm-development-services|saas-development-services|api-development-services|blockchain-development-services|iot-development-services|ar-vr-development-services|legacy-software-modernisation)$/.test(
          p.path,
        ),
      ),
      ...data.pages.filter((p) => registry[p.path]?.family === "cloud"),
      ...data.pages.filter(
        (p) =>
          registry[p.path]?.family === "ai" &&
          p.path !== "/ai-automation-services",
      ),
      ...data.pages.filter((p) => registry[p.path]?.family === "mobile"),
      data.pages.find((p) => p.path === "/ai-automation-services"),
      data.pages.find((p) => p.path === "/case-studies"),
      ...[
        "/custom-software-development",
        "/web-application-development",
        "/web-development",
        "/web-design",
        "/ui-ux-design",
        "/ecommerce-development",
        "/website-redesign",
        "/seo-services",
        "/ppc-services",
        "/software-development-outsourcing",
      ].map((path) => data.pages.find((p) => p.path === path)),
    ];
    for (const family of new Set(Object.values(registry).map((r) => r.family)))
      if (family !== "ai")
        representative.push(
          data.pages.find((p) => registry[p.path]?.family === family),
        );
    fs.mkdirSync("test-results/presentations", { recursive: true });
    for (const page of representative.filter(
      (p) =>
        !process.env.PRESENTATION_FAMILY ||
        (process.env.PRESENTATION_FAMILY === "trust" &&
          [
            "/how-we-work",
            "/engagement-models",
            "/why-choose-netofficials",
            "/faq",
            "/careers",
          ].includes(p.path)) ||
        (process.env.PRESENTATION_FAMILY === "solution" &&
          /^\/(?:saas-development-services|mvp-development-services|startup-software-development|enterprise-software-development|digital-transformation-services|legacy-software-modernisation|product-development-services|software-outsourcing-services|software-consulting-services|proof-of-concept-development|white-label-software-development|offshore-software-development)$/.test(
            p.path,
          )) ||
        (process.env.PRESENTATION_FAMILY === "specialist" &&
          /^\/(?:erp-development-services|crm-development-services|saas-development-services|api-development-services|blockchain-development-services|iot-development-services|ar-vr-development-services|legacy-software-modernisation)$/.test(
            p.path,
          )) ||
        registry[p.path]?.family === process.env.PRESENTATION_FAMILY,
    )) {
      assert.ok(page);
      await p.setViewportSize({ width: 1440, height: 1000 });
      await p.goto(process.env.SITE_URL + "/admin/preview/" + page.id);
      await p
        .locator(".csv-site h1")
        .waitFor()
        .catch(async (error) => {
          console.error(
            "Preview failed:",
            page.path,
            p.url(),
            (await p.locator("body").innerText()).slice(0, 600),
          );
          throw error;
        });
      await p.evaluate(() => document.fonts.ready);
      assert.equal(await p.locator("h1").count(), 1);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const mapping = registry[page.path];
      for (const section of mapping.sections)
        assert.equal(await p.locator("#" + section.id).count(), 1);
      if (mapping.family === "work") {
        const filters = p.locator(".work-filters button");
        await filters.nth(1).click();
        assert.equal(
          await p.locator(".csv-family-work .csv-section:visible").count(),
          1,
        );
        await filters.first().click();
        assert.equal(
          await p.locator(".csv-family-work .csv-section:visible").count(),
          mapping.sections.length,
        );
      }
      await p.screenshot({
        path:
          "test-results/presentations/" +
          (page.path.slice(1) || "home") +
          "-desktop.png",
        fullPage: true,
      });
      await p.setViewportSize({ width: 390, height: 844 });
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        page.path + " mobile overflow",
      );
      await p.screenshot({
        path:
          "test-results/presentations/" +
          (page.path.slice(1) || "home") +
          "-mobile.png",
        fullPage: true,
      });
      await p.getByRole("button", { name: "Menu", exact: true }).click();
      await p.locator("#navigation.open").waitFor();
      await p.keyboard.press("Escape");
      assert.equal(await p.locator("#navigation.open").count(), 0);
      if (page.path === "/ai-automation-services") {
        assert.equal(await p.locator(".csv-faqs details").count(), 5);
        await p.locator(".csv-faqs summary").nth(1).click();
        assert.equal(await p.locator(".csv-faqs details[open]").count(), 1);
      }
      console.log(
        mapping.family + " desktop/mobile and keyboard navigation passed",
      );
    }
    const contact = data.pages.find((p) => p.path === "/contact");
    await p.goto(
      process.env.SITE_URL +
        "/admin/preview/" +
        contact.id +
        "?service=AI%20Process%20Automation%20Services",
    );
    await p.waitForFunction(
      () =>
        document.querySelector("[name=service]")?.value ===
        "AI Process Automation Services",
    );
    assert.equal(
      await p.locator("[name=service]").inputValue(),
      "AI Process Automation Services",
    );
    await p.locator("[name=name]").fill("Preview Tester");
    await p.locator("[name=email]").fill("preview@example.test");
    await p
      .locator("[name=goal]")
      .fill("Preview verification only; do not send an enquiry.");
    await p.locator("form button[type=submit]").click();
    await p
      .getByText("Preview only: no enquiry was sent or saved.", { exact: true })
      .waitFor();
    if (fs.existsSync("test-results/presentations/stress.html")) {
      await p.setContent(
        fs.readFileSync("test-results/presentations/stress.html", "utf8"),
      );
      for (const width of [1440, 390]) {
        await p.setViewportSize({ width, height: 900 });
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          "Long-content overflow at " + width,
        );
        await p.screenshot({
          path: "test-results/presentations/stress-" + width + ".png",
          fullPage: true,
        });
      }
    }
    assert.deepEqual(runtimeErrors, []);
    console.log(
      "Shared family screenshots, FAQ interaction and preview-safe contextual enquiry form passed. No drafts published or enquiries saved.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
