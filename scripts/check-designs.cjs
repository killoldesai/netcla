const fs = require("fs"),
  path = require("path");
const { chromium } = require("@playwright/test");
const { PNG } = require("pngjs");
(async () => {
  const { default: pixelmatch } = await import("pixelmatch");
  const designs = JSON.parse(
    fs.readFileSync("src/templates/designs.json"),
  ).filter(
    (d) =>
      !process.env.VISUAL_TEMPLATES ||
      process.env.VISUAL_TEMPLATES.split(",").includes(d.id),
  );
  const out = "tests/visual-results";
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const results = [];
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    for (const d of designs) {
      const page = await browser.newPage({ viewport });
      page.setDefaultNavigationTimeout(120000);
      const name = d.id + "-" + viewport.width;
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        "file:///" +
          path
            .resolve("homepage-concept", d.id + ".html")
            .replaceAll("\\", "/"),
      );
      await page.evaluate(() => document.fonts.ready);
      const original = await page.screenshot({
        fullPage: true,
        path: out + "/" + name + "-prototype.png",
      });
      await page.goto(
        (process.env.TEST_BASE_URL || "http://localhost:3000") +
          "/design-preview/" +
          d.id,
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const actual = await page.screenshot({
        fullPage: true,
        path: out + "/" + name + "-react.png",
      });
      const layout = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        brokenImages: [...document.images]
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
      }));
      const a = PNG.sync.read(original),
        b = PNG.sync.read(actual),
        height = Math.max(a.height, b.height);
      const pad = (p) => {
        const x = new PNG({ width: viewport.width, height });
        PNG.bitblt(p, x, 0, 0, p.width, p.height, 0, 0);
        return x;
      };
      const aa = pad(a),
        bb = pad(b),
        diff = new PNG({ width: viewport.width, height });
      const pixels = pixelmatch(
        aa.data,
        bb.data,
        diff.data,
        viewport.width,
        height,
        { threshold: 0.15 },
      );
      fs.writeFileSync(out + "/" + name + "-diff.png", PNG.sync.write(diff));
      results.push({
        template: d.id,
        width: viewport.width,
        prototypeHeight: a.height,
        reactHeight: b.height,
        diffPercent:
          Math.round((pixels / (viewport.width * height)) * 10000) / 100,
        ...layout,
        errors,
      });
      console.log(name + " " + results.at(-1).diffPercent + "% difference");
      await page.close();
    }
  }
  await browser.close();
  if (process.env.VISUAL_TEMPLATES && fs.existsSync(out + "/report.json")) {
    const old = JSON.parse(fs.readFileSync(out + "/report.json"));
    results.push(
      ...old.filter(
        (r) =>
          !results.some(
            (n) => n.template === r.template && n.width === r.width,
          ),
      ),
    );
  }
  fs.writeFileSync(out + "/report.json", JSON.stringify(results, null, 2));
  fs.writeFileSync(
    out + "/index.html",
    '<!doctype html><meta charset="utf-8"><title>Design comparisons</title><style>body{font:16px system-ui}section{margin:30px 0}img{width:30%;vertical-align:top}h2{font-size:20px}</style>' +
      results
        .map(
          (r) =>
            `<section><h2>${r.template} · ${r.width}px · ${r.diffPercent}% difference</h2>${["prototype", "react", "diff"].map((x) => `<a href="${r.template}-${r.width}-${x}.png"><img src="${r.template}-${r.width}-${x}.png" alt="${x}"></a>`).join("")}</section>`,
        )
        .join(""),
  );
  if (
    results.some((r) => r.overflow || r.brokenImages.length || r.errors.length)
  )
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
