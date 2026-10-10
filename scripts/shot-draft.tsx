// Dev tool: render a stored draft revision with the real V3Page, then screenshot every section with Playwright.
// Usage: npx tsx --env-file=.env scripts/shot-draft.tsx <revisionId> <outDir> [width]
// Needs the dev server running (it supplies the CSS, fonts and media).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { readStoredFile } from "../src/asset-storage";
import { blogPosts } from "../src/blog-posts";
import { pool, query } from "../src/db";
import { V3Page } from "../src/v3-page";

const [revisionId, outDir, widthArg] = process.argv.slice(2);
const width = Number(widthArg ?? 1440);
const base = process.env.PREVIEW_BASE ?? "http://localhost:3010";
try {
  const [row] = await query<{ path: string; content: any }>(
    "SELECT p.path,r.content FROM revisions r JOIN pages p ON p.id=r.page_id WHERE r.id=$1",
    [revisionId],
  );
  if (!row) throw new Error("Unknown revision");
  const paths = (await query<{ path: string }>("SELECT path FROM pages WHERE archived_at IS NULL")).map((p) => p.path);
  // The /blog index lists guides from the database; the owner preview includes drafts, so the shot does too.
  const posts = row.path === "/blog" ? await blogPosts({ drafts: true }) : [];
  const body = renderToStaticMarkup(<V3Page content={row.content} path={row.path} paths={paths} posts={posts} />);
  // Reuse the real page's <head> (compiled CSS, fonts) so the render matches production styling.
  const shell = await (await fetch(base + "/services")).text();
  const head = shell.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const bodyClass = shell.match(/<body([^>]*)>/)?.[1] ?? "";
  mkdirSync(outDir, { recursive: true });
  const html = `<!doctype html><html lang="en"><head><base href="${base}/">${head}</head><body${bodyClass}>${body}</body></html>`;
  writeFileSync(outDir + "/page.html", html);
  // Draft illustrations are not served publicly until accepted; answer /media/<id>/... from the stored files instead.
  const ids = [...(row.content.pageSections ?? []).filter((s: any) => s.asset).map((s: any) => s.asset.id), ...posts.filter((p) => p.image).map((p) => p.image!.id)];
  const stored = await query<any>("SELECT * FROM generated_assets WHERE id=ANY($1::uuid[])", [ids]);
  const files: Record<string, { file: string; mime: string }> = {};
  for (const a of stored) {
    // Local or remote storage: the app's own reader returns the bytes either way.
    const file = `${outDir}/${a.id}.img`;
    writeFileSync(file, await readStoredFile(a).catch(() => Buffer.alloc(0)));
    files[a.id] = { file, mime: a.mime };
  }
  writeFileSync(outDir + "/assets.json", JSON.stringify(files));
  const serveMedia = async (route: any) => {
    const hit = files[new URL(route.request().url()).pathname.split("/")[2]];
    if (!hit || !existsSync(hit.file)) return route.fulfill({ status: 404 });
    return route.fulfill({ body: readFileSync(hit.file), contentType: hit.mime });
  };

  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.route("**/page.html", (route) => route.fulfill({ body: html, contentType: "text/html" }));
  await page.route("**/media/**", serveMedia);
  await page.goto(base + "/page.html", { waitUntil: "networkidle", timeout: 120000 }).catch(() => {});
  await page.addStyleTag({ content: ".nm-header,.sk-subnav{position:static !important} .nm-skip{display:none !important}" });
  await page.waitForTimeout(1500);
  const sections = await page.$$("main > .v3-section-group, main > section, main > nav");
  let i = 0;
  for (const el of sections) {
    const id = (await el.evaluate((n: Element) => n.querySelector("section")?.id || n.id || n.tagName.toLowerCase())) as string;
    await el.screenshot({ path: `${outDir}/${String(++i).padStart(2, "0")}-${id}.png` }).catch(() => {});
  }
  await page.screenshot({ path: `${outDir}/full.png`, fullPage: true });
  await browser.close();
  console.log(`wrote ${i} section shots to ${outDir}`);
} finally {
  await pool().end();
}
