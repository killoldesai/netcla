const { chromium } = require("@playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  fs.mkdirSync("tests/visual-results/stress", { recursive: true });
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultNavigationTimeout(120000);
    for (const template of [
      "software-led",
      "custom-software",
      "services",
      "about",
      "contact",
      "blog-custom-software-development-cost",
      "portfolio",
      "ppc-management-pricing",
      "privacy-policy",
    ]) {
      await page.goto("http://localhost:3000/design-preview/" + template);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => {
        const h = document.querySelector("h1");
        if (h)
          h.textContent =
            "Software development for complex customer experiences and international business workflows with connected systems";
        const p = document.querySelector("main section p");
        if (p)
          p.textContent =
            "Practical context for this buyer question and the decisions required before starting a project. ".repeat(
              12,
            );
        const optional = document.querySelector("main section:nth-of-type(2)");
        if (optional && !optional.querySelector("form")) optional.remove();
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 2,
        ),
        template + " overflow at " + width,
      );
      await page.screenshot({
        path: "tests/visual-results/stress/" + template + "-" + width + ".png",
        fullPage: true,
      });
    }
    await page.close();
  }
  await browser.close();
  console.log(
    "Long headings/body copy and omitted optional sections remain usable across nine template families",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
