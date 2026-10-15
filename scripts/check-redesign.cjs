#!/usr/bin/env node
/*
 * Redesign checker for the running Next.js site (dev server or staging).
 *
 *   node scripts/check-redesign.cjs                      sample of every renderer
 *   node scripts/check-redesign.cjs /about /contact      specific paths
 *   node scripts/check-redesign.cjs --renderer skeleton  the sample for one renderer
 *   node scripts/check-redesign.cjs --all                every path in the sample list file
 *   BASE=http://localhost:3010 OUT=tmp/redesign-shots node scripts/check-redesign.cjs --label before
 *
 * Checks each page at 1440 and 390: horizontal overflow, console and page errors, failed
 * /media or /assets requests, broken images, h1 count, en/em dashes and "[draft" in visible
 * text. Saves 1500px screenshot slices to OUT/<label>/<slug>/. Exits 1 on any failure.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = (process.env.BASE || 'http://localhost:3010').replace(/\/$/, '');
const OUT = path.resolve(process.env.OUT || 'tmp/redesign-shots');
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const label = flag('--label') || 'after';
const noShots = args.includes('--no-shots');

// One or more live pages per renderer (src/site/ported.ts names).
const SAMPLE = {
  skeleton: ['/saas-development-services', '/react-development-services', '/hire-react-developer', '/healthcare-software-development', '/software-development-company-usa', '/custom-software-development', '/industries', '/hire-developers'],
  guide: ['/blog/custom-software-development-cost', '/blog/seo-vs-ppc'],
  about: ['/about'],
  contact: ['/contact'],
  engagement: ['/engagement-models'],
  'how-work': ['/how-we-work'],
  'why-choose': ['/why-choose-netofficials'],
  'blog-index': ['/blog'],
  generic: ['/services', '/careers', '/faq', '/portfolio', '/case-studies', '/privacy-policy', '/terms', '/thank-you'],
  routes: ['/about/killol-desai', '/this-page-does-not-exist'],
  home: ['/'],
};

let paths = args.filter((a) => a.startsWith('/'));
const r = flag('--renderer');
if (r) paths = SAMPLE[r] || [];
if (!paths.length) paths = Object.values(SAMPLE).flat();

(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  for (const p of paths) {
    const slug = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__');
    const dir = path.join(OUT, label, slug);
    if (!noShots) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
    const problems = [];
    for (const [tag, width, height] of [['desk', 1440, 900], ['mob', 390, 844]]) {
      const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(`page error: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource.*404/.test(m.text())) errs.push(`console: ${m.text().slice(0, 160)}`); });
      page.on('response', (res) => { const u = res.url(); if (u.startsWith(BASE) && /\/(media|assets)\//.test(u) && res.status() >= 400) errs.push(`HTTP ${res.status()} ${u.replace(BASE, '')}`); });
      const resp = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => { errs.push(`load: ${e.message}`); return null; });
      const status = resp ? resp.status() : 0;
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => {
        const text = document.querySelector('main')?.innerText || document.body.innerText;
        return {
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          h1: document.querySelectorAll('h1').length,
          height: document.documentElement.scrollHeight,
          nx: !!document.querySelector('.nx'),
          dashes: (text.match(/[^\n]{0,30}[–—][^\n]{0,30}/g) || []).slice(0, 3),
          drafts: (text.match(/\[draft[^\]]{0,40}/gi) || []).slice(0, 3),
          broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src.replace(location.origin, '')).slice(0, 3),
        };
      });
      const t = `${width}`;
      if (status >= 400 && p !== '/this-page-does-not-exist') problems.push(`${t}: HTTP ${status}`);
      if (info.overflow > 0) problems.push(`${t}: horizontal overflow ${info.overflow}px`);
      if (info.h1 !== 1) problems.push(`${t}: ${info.h1} h1 elements`);
      info.broken.forEach((b) => problems.push(`${t}: broken image ${b}`));
      [...new Set(errs)].forEach((e) => problems.push(`${t}: ${e}`));
      if (tag === 'desk') {
        info.dashes.forEach((d) => problems.push(`(warn) dash in published copy: ${JSON.stringify(d)}`));
        info.drafts.forEach((d) => problems.push(`draft placeholder: ${d}`));
      }
      if (!noShots) {
        for (let y = 0, i = 0; y < info.height && i < 12; y += 1500, i++) {
          await page.screenshot({ path: path.join(dir, `${tag}-${i}.png`), clip: { x: 0, y, width, height: Math.min(1500, info.height - y) }, fullPage: true });
        }
      }
      if (tag === 'desk') problems.unshift(`(design: ${info.nx ? 'new' : 'old'})`);
      await ctx.close();
    }
    const real = problems.filter((m) => !m.startsWith('(design') && !m.startsWith('(warn)'));
    const warns = problems.filter((m) => m.startsWith('(warn)'));
    console.log(`${real.length ? 'FAIL' : 'PASS'}  ${p}  ${problems[0]}`);
    real.forEach((m) => console.log(`   x ${m}`));
    warns.forEach((m) => console.log(`   ! ${m.replace('(warn) ', '')}`));
    if (real.length) failed++;
  }
  await browser.close();
  console.log(`\n${paths.length - failed}/${paths.length} pages passed. Shots: ${path.join(OUT, label)}`);
  process.exit(failed ? 1 : 0);
})();
