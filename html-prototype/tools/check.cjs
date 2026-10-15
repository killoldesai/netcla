#!/usr/bin/env node
/*
 * Prototype page checker.
 *
 *   node tools/check.cjs service.html            check one page
 *   node tools/check.cjs service.html about.html check several
 *   node tools/check.cjs --all                   every *.html in html-prototype/
 *   node tools/check.cjs --all --strict          also fail on links to pages not built yet
 *   node tools/check.cjs service.html --no-shots skip screenshots
 *
 * For each page: loads it at 1440x900 and 390x844 in light and dark, then reports
 * horizontal overflow, console/page errors, failed local requests, en/em dashes in
 * visible text, undefined var(--tokens) and hex colours in css/pages/<page>.css,
 * visible text, hex colours in css/pages/<page>.css and links to missing local files.
 * Screenshots (light 1440 and 390, dark 1440) go to tools/shots/<page>/ in 1500px slices.
 * Exits 1 when any check fails.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..');
const { chromium } = require(path.join(REPO, 'node_modules', 'playwright'));

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const shots = !args.includes('--no-shots');
let pages = args.filter((a) => !a.startsWith('--'));
if (args.includes('--all') || pages.length === 0) {
  pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith('_'));
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  let failed = 0;

  for (const page of pages) {
    if (!fs.existsSync(path.join(ROOT, page))) { console.log(`\n${page}\n  FAIL file not found`); failed++; continue; }
    const name = page.replace(/\.html$/, '');
    const problems = [];
    const warnings = [];

    // Static checks
    const cssFile = path.join(ROOT, 'css', 'pages', `${name}.css`);
    if (fs.existsSync(cssFile)) {
      const css = fs.readFileSync(cssFile, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const hex = css.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (hex) problems.push(`hex colours in css/pages/${name}.css (use tokens): ${[...new Set(hex)].join(', ')}`);
      // Every var(--token) must be defined somewhere, or the property silently falls back
      const defined = new Set();
      for (const f of ['tokens.css', 'components.css', 'sections.css', path.join('pages', `${name}.css`)]) {
        for (const m of fs.readFileSync(path.join(ROOT, 'css', f), 'utf8').matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
      }
      const inline = fs.readFileSync(path.join(ROOT, page), 'utf8');
      for (const m of inline.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
      const undef = [...new Set([...css.matchAll(/var\((--[a-zA-Z0-9-]+)/g)].map((m) => m[1]))].filter((v) => !defined.has(v));
      if (undef.length) problems.push(`undefined tokens in css/pages/${name}.css: ${undef.join(', ')}`);
    }
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const localLinks = [...html.matchAll(/(?:href|src)="([^"#:?]+\.(?:html|css|js|png|svg|webp))(?:[?#][^"]*)?"/g)].map((m) => m[1]);
    for (const l of new Set(localLinks)) {
      if (!fs.existsSync(path.join(ROOT, l))) (l.endsWith('.html') && !strict ? warnings : problems).push(`link to missing file: ${l}`);
    }

    const outDir = path.join(ROOT, 'tools', 'shots', name);
    if (shots) { fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true }); }

    for (const theme of ['light', 'dark']) {
      for (const [label, width, height] of [['desk', 1440, 900], ['mob', 390, 844]]) {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        await ctx.addInitScript((th) => { try { localStorage.setItem('nx-theme', th); } catch (e) {} }, theme);
        const p = await ctx.newPage();
        const errs = [];
        p.on('pageerror', (e) => errs.push(`page error: ${e.message}`));
        p.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
        p.on('requestfailed', (r) => errs.push(`request failed: ${r.url().replace(base, '')}`));
        p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400) errs.push(`HTTP ${r.status()}: ${r.url().replace(base, '')}`); });
        await p.goto(base + page, { waitUntil: 'networkidle' });
        await p.waitForTimeout(400);
        const info = await p.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          height: document.documentElement.scrollHeight,
          dashes: (document.body.innerText.match(/[^\n]{0,30}[–—][^\n]{0,30}/g) || []).slice(0, 5),
          wide: [...document.querySelectorAll('body *')]
            .filter((e) => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 && r.width > 0 && !e.closest('.nx-marquee, .nx-car__track, .nx-tabs__list, .subnav__list, [data-allow-overflow]'); })
            .slice(0, 4).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`),
        }));
        const tag = `${theme} ${width}`;
        if (info.overflow > 0) problems.push(`${tag}: horizontal overflow ${info.overflow}px ${info.wide.join(' ')}`);
        for (const e of new Set(errs)) problems.push(`${tag}: ${e}`);
        if (theme === 'light' && width === 1440 && info.dashes.length) problems.push(`en/em dash in text: ${info.dashes.map((d) => JSON.stringify(d)).join(' | ')}`);

        const wantShots = shots && (theme === 'light' || label === 'desk');
        if (wantShots) {
          const step = label === 'desk' ? 1500 : 1800;
          for (let y = 0, i = 0; y < info.height; y += step, i++) {
            await p.screenshot({ path: path.join(outDir, `${theme}-${label}-${i}.png`), clip: { x: 0, y, width, height: Math.min(step, info.height - y) }, fullPage: true });
          }
        }
        await ctx.close();
      }
    }

    const uniq = [...new Set(problems)];
    console.log(`\n${page}  ${uniq.length ? 'FAIL' : 'PASS'}`);
    uniq.forEach((m) => console.log(`  x ${m}`));
    [...new Set(warnings)].forEach((m) => console.log(`  ! ${m}`));
    if (shots) console.log(`  shots: tools/shots/${name}/`);
    if (uniq.length) failed++;
  }

  await browser.close();
  server.close();
  console.log(`\n${pages.length - failed}/${pages.length} pages passed`);
  process.exit(failed ? 1 : 0);
})();
