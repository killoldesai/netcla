#!/usr/bin/env node
/*
 * Keeps the static prototype in sync.
 *
 *   node tools/sync-partials.mjs              sync every page
 *   node tools/sync-partials.mjs about.html   sync one page (use this while other pages are being edited)
 *
 * 1. Replaces everything between <!-- @partial name --> and <!-- /@partial name -->
 *    in every *.html with partials/<name>.html.
 * 2. Rewrites root-relative site links (href="/saas-development-services") to the
 *    prototype file for that page type (href="service.html"), keeping the real path
 *    in data-path so the port to Next.js knows where each link goes. Page types come
 *    from src/site-structure.ts, so the map never drifts from the real IA.
 * 3. Regenerates pages.html, the review hub, from tools/pages.json and _template.html.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const read = (f) => fs.readFileSync(f, 'utf8');

// Page type per real path, from the site's single source of truth
const structure = read(path.join(REPO, 'src', 'site-structure.ts'));
const typeOf = new Map([...structure.matchAll(/\bp\("([^"]+)",\s*"([a-z]+)"/g)].map((m) => [m[1], m[2]]));

const byType = { home: 'index.html', pillar: 'pillar.html', service: 'service.html', technology: 'technology.html', hire: 'hire.html', industry: 'industry.html', location: 'location.html', directory: 'services.html', contact: 'contact.html', guide: 'blog.html' };
const byPath = {
  '/industries': 'industries-hub.html', '/about': 'about.html', '/how-we-work': 'how-we-work.html',
  '/engagement-models': 'engagement-models.html', '/why-choose-netofficials': 'why-choose.html', '/faq': 'faq.html',
  '/careers': 'careers.html', '/portfolio': 'portfolio.html', '/case-studies': 'case-studies.html',
  '/about/killol-desai': 'founder.html', '/privacy-policy': 'legal.html', '/terms': 'legal.html', '/cookie-policy': 'legal.html',
};
function fileFor(p) {
  if (byPath[p]) return byPath[p];
  if (p.startsWith('/blog/')) return 'guide.html';
  if (p.startsWith('/careers/')) return 'career-role.html';
  const t = typeOf.get(p);
  return t ? byType[t] || null : null;
}

const partials = Object.fromEntries(
  fs.readdirSync(path.join(ROOT, 'partials')).filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), read(path.join(ROOT, 'partials', f)).trim()]),
);

const unmapped = new Set();
function sync(html) {
  html = html.replace(/<!-- @partial ([a-z-]+) -->[\s\S]*?<!-- \/@partial \1 -->/g, (all, name) => {
    if (!partials[name]) throw new Error(`no partial named ${name}`);
    return `<!-- @partial ${name} -->\n${partials[name]}\n<!-- /@partial ${name} -->`;
  });
  // Any data-path already sitting next to the href is replaced, never duplicated.
  html = html.replace(/href="(\/[^"#?]*)([#?][^"]*)?"(?:\s+data-path="[^"]*")*/g, (all, p, rest = '') => {
    const clean = p.length > 1 ? p.replace(/\/$/, '') : p;
    const file = fileFor(clean);
    if (!file) { unmapped.add(clean); return `href="${p}${rest}"`; }
    return `href="${file}${rest}" data-path="${clean}${rest}"`;
  });
  // Clean up repeats left by earlier runs
  return html.replace(/(\sdata-path="[^"]*")(?:\s+data-path="[^"]*")+/g, '$1');
}

// Review hub
const pages = JSON.parse(read(path.join(ROOT, 'tools', 'pages.json')));
const template = read(path.join(ROOT, '_template.html'));
const groups = [...new Set(pages.map((p) => p.group))];
const cards = groups.map((g) => {
  const items = pages.filter((p) => p.group === g).map((p) => {
    const built = fs.existsSync(path.join(ROOT, p.file));
    const status = built ? '<span class="nx-badge nx-badge--lime"><span class="nx-badge__dot"></span>Built</span>' : `<span class="nx-badge nx-badge--outline">Wave ${p.wave}</span>`;
    const title = built ? `<a class="hub-card__title" href="${p.file}">${p.name}</a>` : `<span class="hub-card__title">${p.name}</span>`;
    return `      <li class="hub-card">${title}${status}<span class="hub-card__meta">${p.represents}</span><span class="hub-card__meta">${p.urls} URL${p.urls === 1 ? '' : 's'} use this skeleton</span></li>`;
  }).join('\n');
  return `    <h2 class="hub-group">${g}</h2>\n    <ul class="hub-grid">\n${items}\n    </ul>`;
}).join('\n');
const builtCount = pages.filter((p) => fs.existsSync(path.join(ROOT, p.file))).length;
const hub = template
  .replace(/<title>[^<]*<\/title>/, '<title>Page skeletons | Netofficials prototype</title>')
  .replace(/<link rel="stylesheet" href="css\/pages\/PAGE\.css">\n?/, '')
  .replace(/<!-- @main -->[\s\S]*<!-- \/@main -->/, `<!-- @main -->
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Prototype</span>
    <h1 class="h-section">Page skeletons</h1>
    <p class="lead" style="margin-top:var(--space-4)">${builtCount} of ${pages.length} skeletons built. Each one stands for every URL of its type in src/site-structure.ts.</p>
  </div>
</section>
<section class="section section--white" style="padding-top:var(--space-12)">
  <div class="container">
${cards}
  </div>
</section>
<style>
.hub-group { font: 600 18px/1.3 var(--font-sans); margin: var(--space-12) 0 var(--space-4); }
.hub-group:first-child { margin-top: 0; }
.hub-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-4); }
.hub-card { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; padding: var(--space-6); border-radius: var(--radius-card); background: var(--paper); border: 1px solid var(--line); }
.hub-card__title { font: 600 17px/1.3 var(--font-sans); color: var(--ink); }
a.hub-card__title { color: var(--indigo-text); }
.hub-card__meta { font-size: 13px; color: var(--muted); word-break: break-word; }
</style>
<!-- /@main -->`);
fs.writeFileSync(path.join(ROOT, 'pages.html'), hub);

// With file arguments only those pages are synced (safe while other pages are being edited).
const only = process.argv.slice(2).filter((a) => a.endsWith('.html'));
let n = 0;
for (const f of only.length ? only : fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  const file = path.join(ROOT, f);
  const before = read(file);
  const after = sync(before);
  if (after !== before) { fs.writeFileSync(file, after); n++; }
}
console.log(`synced ${n} file(s); hub lists ${builtCount}/${pages.length} built`);
if (unmapped.size) console.log(`links with no prototype page yet (left as real paths): ${[...unmapped].sort().join(', ')}`);
