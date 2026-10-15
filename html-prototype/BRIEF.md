# Prototype page brief (read fully before building)

You are building ONE static HTML skeleton page for the Netofficials website prototype in `html-prototype/`. The homepage `index.html` is the approved reference for look, rhythm and quality. Your page must look like it belongs to the same site.

## Files you own (and nothing else)
- `html-prototype/<page>.html`, created by copying `_template.html`
- `html-prototype/css/pages/<page>.css`, page-only styles

Read-only for you: everything else, including `css/tokens.css`, `css/components.css`, `css/sections.css`, `css/home.css`, `js/app.js`, `partials/*`, `_template.html`, `index.html`, other pages, and the whole repo outside `html-prototype/`. If you need a shared change (new behaviour in app.js, a shared CSS pattern, a new icon), do not make it: list it under "Shared change requests" in your final report.

## How to start
1. Copy `_template.html` (or the page named in your task) to `<page>.html`. Keep the `<!-- @partial … -->` blocks exactly as they are (header, footer, icons are filled by a script). Replace `css/pages/PAGE.css` with `css/pages/<page>.css`. Replace everything between `<!-- @main -->` and `<!-- /@main -->` with your page.
2. Study `index.html` and `css/sections.css` and reuse their patterns and class names before writing new CSS.
3. Run `node tools/sync-partials.mjs <page>.html` (always pass your file name; other agents are editing other pages at the same time) then `node tools/check.cjs <page>.html` from `html-prototype/`. Fix every `x` line. Look at your screenshots in `tools/shots/<page>/` (light desktop, light mobile, dark desktop) with the Read tool and fix anything that looks broken, cramped, misaligned or empty. Repeat until it passes and looks right.

## Copy rules (strict)
- Use real text from the repo only: `src/site-structure.ts` (labels, blurbs, groups, page types), `src/templates/site-plan.json` (find the entry by `"url"`: title, h1, headings, keywords), `src/home/copy.ts` (homepage copy, process, FAQs, engagement models, industries), `src/prompts/templates.ts` (section names and counts), `src/company.ts` (owner-approved company facts: founded 2011, founder Killol Desai, his bio, LinkedIn profiles; use only what is written there), and the page component named in your task.
- Anything you write yourself goes in `<span class="draft">[draft: …]</span>` (inline) or a block with class `draft`. Keep drafts short and plausible, describing what belongs there, e.g. `[draft: two sentences on who SaaS builds suit]`.
- Never invent facts: no statistics, client names, logos, testimonials, awards, prices, team sizes, years, ratings or guarantees. Proof sections (testimonials, clients, awards, team, offices) are rendered as a `div.gated` with a `span.gated__label` reading "Shown when approved evidence exists" plus a short description of what goes there.
- No em dash or en dash anywhere (use a full stop or comma; write "1 to 3 months"). Sentence case headings. No slogans. Number items only when the order is real (process steps).
- `<title>` and meta description: from the site-plan entry when one exists.

## Design rules
- Colours only through tokens (`var(--indigo)`, `var(--surface)`, …). No hex values in your page CSS (the checker fails on them). Both light and dark themes must work, which happens automatically if you only use tokens.
- Use existing components: buttons `nx-btn nx-btn--primary|secondary|lime|dark`, `nx-arrowlink`, `nx-badge`, tabs `nx-tabs` (`data-tabs`), accordion `nx-acc` (`data-accordion`), carousel `nx-car` (`data-carousel`), segmented control `nx-seg` (`data-seg` with `data-model` panels), steps `nx-steps` (`data-steps`), cards, form fields `nx-field`, `nx-check`. Copy their markup from `index.html` so the shared `js/app.js` drives them. Add `nx-reveal` to blocks that should fade in on scroll.
- Page rhythm: paper hero with breadcrumb (`page-hero`, `page-crumbs`, `hero__grid`, `tag-pill`, `h1[data-split]`, `lead`, `hero__actions`, `hero__art`), then sections alternating `section` (paper) and `section section--white`, process-type content in a dark `section band`, FAQ using the homepage FAQ pattern (`faq`, `faq__aside`, `nx-acc`), and end with the footer partial (it already contains the closing CTA). Long pages get the sticky sub-nav:
  `<nav class="subnav" aria-label="On this page" data-subnav><div class="container"><ul class="subnav__list"><li><a href="#overview">Overview</a></li>…</ul></div></nav>` placed right after the hero, with matching `id`s on sections.
- Illustrations: one hero illustration per page, inline SVG in the homepage style (flat, minimal, rounded rects, browser windows, phones, nodes, charts), using only the `.f-*` fill and `.s-*` stroke classes from `sections.css`, optional `float-a|b|c`, `pulse`, `dash-move` motion classes. `role="img"` plus a real `aria-label`. Smaller section illustrations are optional; never use photos or external images.
- Icons: inline sprite `<svg width="20" height="20" aria-hidden="true"><use href="#i-arrow-right"/></svg>` (ids: arrow-right, arrow-up, plus, check, menu, x, mail, pin, clock, flag, file, chevron-right, chevron-down, external, search, calendar, filter, user) and the product icon set `<svg width="26" height="26"><use href="assets/icons.svg#code-brackets"/></svg>` (code-brackets, mobile-device, brain-circuit, cloud-upload, settings-gear, layers-stack, shield-check, users-group, rocket-launch, chart-bar, document-text, api-plug, flutter-diamond, react-atom, nodejs-hexagon, python-snake, aws-cloud, kubernetes-wheel, docker-whale, terraform-blocks). No emoji.
- Links: write real site paths (`href="/saas-development-services"`, `href="/contact"`). The sync script turns them into prototype links. In-page anchors stay `#id`.
- Accessibility: one `h1`, logical heading order, real `<a href>`/`<button>`, labels on every form field, `aria-label` on icon-only buttons, 44px touch targets.
- Responsive: must work at 390px wide with no horizontal scroll. Use grid with `minmax(0, 1fr)` and the breakpoints used in `sections.css` (1100px, 720px).

## Shared patterns you can use (already in sections.css)
- Family skeleton (from `service.html`): `overview` + `quick` + `facts` (answer-first overview with "At a glance" box), `sk-cards` + `sk-card` (`sk-card__icon`, `__title`, `__label`, `__text`), `sk-stack` + `sk-stack__group` + `svc__links` chips, `sk-factors` (5 cost cards), `nx-steps nx-steps--five` for a 5-step dark band, `ind-grid` + `ind` (industry links with icons), `more` (related link list), `rc` role cards, `model` engagement panels, `faq` layout.
- Never link `css/home.css` from an inner page; it holds homepage-only rules.

## Final report (your last message)
- File(s) created
- Section list as built (in order)
- Copy sources used, and a list of every `[draft: …]` and `.gated` placeholder
- Checker result (paste the summary line)
- Shared change requests, if any
