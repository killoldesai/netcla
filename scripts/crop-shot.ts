// Dev tool: crop regions of a page rendered by shot-draft (reads <outDir>/page.html).
// Usage: npx tsx scripts/crop-shot.ts <outDir> <selector> <width> <offsetY> <height> <name> [offsetY height name ...]
import { chromium } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const [outDir, selector, widthArg, ...rest] = process.argv.slice(2);
const base = process.env.PREVIEW_BASE ?? "http://localhost:3010";
const html = readFileSync(outDir + "/page.html", "utf8");
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const page = await browser.newPage({ viewport: { width: Number(widthArg), height: 900 } });
await page.route("**/page.html", (route) => route.fulfill({ body: html, contentType: "text/html" }));
const files: Record<string, { file: string; mime: string }> = existsSync(outDir + "/assets.json") ? JSON.parse(readFileSync(outDir + "/assets.json", "utf8")) : {};
await page.route("**/media/**", async (route) => {
  const hit = files[new URL(route.request().url()).pathname.split("/")[2]];
  if (!hit || !existsSync(hit.file)) return route.fulfill({ status: 404 });
  return route.fulfill({ body: readFileSync(hit.file), contentType: hit.mime });
});
await page.goto(base + "/page.html", { waitUntil: "networkidle", timeout: 120000 }).catch(() => {});
await page.addStyleTag({ content: ".nm-header,.sk-subnav{position:static !important} .nm-skip{display:none !important} .sk-rail{position:static !important}" });
await page.waitForTimeout(1200);
const box = await page.locator(selector).first().boundingBox();
if (!box) throw new Error("selector not found");
for (let i = 0; i < rest.length; i += 3) {
  const [y, h, name] = [Number(rest[i]), Number(rest[i + 1]), rest[i + 2]];
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true, clip: { x: 0, y: box.y + y, width: Number(widthArg), height: h } });
}
await browser.close();
