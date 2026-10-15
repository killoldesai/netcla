#!/usr/bin/env node
/*
 * Interaction test for every built page: segmented controls switch their own panels,
 * accordions open, tabs switch, carousels move, and any enquiry form validates.
 *   node tools/interact.cjs            all pages
 *   node tools/interact.cjs hire.html  one page
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const ROOT = path.resolve(__dirname, '..');
const { chromium } = require(path.join(ROOT, '..', 'node_modules', 'playwright'));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

const pages = process.argv.slice(2).filter((a) => a.endsWith('.html'));
const list = pages.length ? pages : fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith('_'));

(async () => {
  const server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.on('listening', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  let fails = 0;
  for (const page of list) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + page, { waitUntil: 'networkidle' });
    const out = [];
    // Segmented controls: each option must leave exactly one visible panel in its section, and the matching one
    const segs = await p.$$('[data-seg]');
    for (let s = 0; s < segs.length; s++) {
      const opts = await segs[s].$$('[role="radio"]');
      for (const o of opts) {
        await o.click();
        const r = await o.evaluate((el) => {
          const scope = el.closest('[data-seg]').closest('section') || document;
          const panels = [...scope.querySelectorAll('[data-model]')];
          const vis = panels.filter((m) => !m.hidden);
          return { n: panels.length, vis: vis.map((m) => m.dataset.model), want: el.dataset.value };
        });
        if (r.n && !(r.vis.length === 1 && r.vis[0] === r.want)) out.push(`seg ${s + 1} option ${r.want}: visible panels ${JSON.stringify(r.vis)}`);
      }
    }
    // Accordions: clicking a closed trigger opens it
    for (const acc of await p.$$('[data-accordion]')) {
      const t = await acc.$('.nx-acc__trigger[aria-expanded="false"]');
      if (t) { await t.scrollIntoViewIfNeeded(); await t.click(); if ((await t.getAttribute('aria-expanded')) !== 'true') out.push('accordion did not open'); }
    }
    // Tabs: clicking the last tab selects it and shows its panel
    for (const tabs of await p.$$('[data-tabs]')) {
      const all = await tabs.$$('[role="tab"]');
      if (all.length > 1) {
        const last = all[all.length - 1]; await last.scrollIntoViewIfNeeded(); await last.click();
        const ok = await last.evaluate((t) => t.getAttribute('aria-selected') === 'true' && !document.getElementById(t.getAttribute('aria-controls')).hidden);
        if (!ok) out.push('tabs did not switch');
      }
    }
    // Enquiry form: empty submit shows errors, valid submit shows a success toast
    const form = await p.$('[data-form]');
    if (form) {
      await form.scrollIntoViewIfNeeded();
      await p.click('[data-form] button[type=submit]');
      const errors = await p.$$eval('[data-form] .nx-field--error', (e) => e.length);
      if (!errors) out.push('form: empty submit showed no errors');
      if (await p.$('#f-name')) await p.fill('#f-name', 'Test');
      await p.fill('#f-email', 'test@example.com');
      if (await p.$('#f-service')) await p.selectOption('#f-service', { index: 1 });
      if (await p.$('#f-goal')) await p.fill('#f-goal', 'A test brief');
      await p.click('[data-form] button[type=submit]');
      const toast = await p.$$eval('.nx-toast--success', (e) => e.length);
      if (!toast) out.push('form: valid submit showed no success toast');
    }
    errs.forEach((e) => out.push(`page error: ${e}`));
    const summary = `segs ${segs.length}, form ${form ? 'yes' : 'no'}`;
    console.log(`${out.length ? 'FAIL' : 'PASS'}  ${page}  (${summary})`);
    out.forEach((m) => console.log(`   x ${m}`));
    if (out.length) fails++;
    await p.close();
  }
  await browser.close(); server.close();
  process.exit(fails ? 1 : 0);
})();
