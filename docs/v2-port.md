# v2 port brief (read fully before changing code)

You are porting ONE area of the live Next.js site to the approved v2 (monday.com style) design. The approved target is the static prototype in `html-prototype/v2/`. The live site keeps its real published content, links, tracking and images. You only change how existing content is marked up and styled.

## Read first (in this order)
1. `AGENTS.md`. This is a recent Next.js with breaking changes; docs are in `node_modules/next/dist/docs/` (read the server and client components page before touching any client code).
2. `html-prototype/v2/BRIEF.md` (design rules) and `html-prototype/v2/components.html` (copy-paste markup for every component, with the CSS class names).
3. The prototype page(s) named in your task (`html-prototype/v2/<page>.html`) and the current renderer file(s) you own.
4. The renderer's existing tests in `tests/` (keep their behavioural assertions; update class-name assertions only).
5. `src/site/v2/ui.tsx`, `src/site/v2/behaviors.tsx`, `src/site/v2-ported.ts`, `src/site/v2/shell.tsx` and `src/v3-page.tsx` (how the shell wraps a renderer).

## How the v2 design is wired
- **Scope:** every v2 page is wrapped in `<div class="v2 ...">`. All v2 CSS is scoped under `.v2` and lives in `public/assets/v2/` (GENERATED, never edit by hand). Source CSS is in `html-prototype/v2/css/`: `core.css` and `components.css` (shared, read-only for you), `pages/<name>.css` (prototype page CSS) and `live/<name>.css` (YOUR live-only rules, see below).
- **Build:** after changing any CSS under `html-prototype/v2/css/`, run `node scripts/build-v2-css.mjs`. It also copies the generated images and regenerates `src/site/v2/icon-sprite.ts`.
- **Shell:** for renderers that V3Page renders (`skeleton`, `guide`, `about`, `contact`, `engagement`, `how-work`, `why-choose`, `blog-index`, `services`, `generic`), V3Page adds the `.v2` wrapper, styles, icon sprite, header, closing CTA band (`V2CtaBand`, not on contact), footer and behaviours. YOUR renderer only returns the `<section>` blocks that go inside `<main>`. Do not add a header, footer, CTA band or `<main>`. Route pages (not-found, founder, career role, case studies, homepage) wrap their content in `V2Shell` from `src/site/v2/shell.tsx`.
- **Switching a renderer on:** in `src/site/v2-ported.ts` set only your own line(s) from `null` to the page stylesheet name, for example `contact: "contact"`. That makes `public/assets/v2/pages/contact.css` load. A renderer can also add `<V2Styles page="hire" />` to load an extra page stylesheet (the skeleton renderer does this per page family).
- **Helpers** (`src/site/v2/ui.tsx`): `V2Icon` (line icons from the inline sprite, names in `icon-sprite.ts`), `V2ProductIcon` (technology and product icons, `/assets/nx/icons.svg`), `V2Img` and `v2img(name)` (generated images in `public/assets/v2/img/<name>.webp`), `V2Art` (a page's own generated hero image, or a shipped v2 image as fallback), `V2Crumbs`, `V2SectionHead`, `V2CtaBand`. Technology brand logos: use the existing `TechIcon` from `src/brand-icon.tsx` (served from `/brand/<id>.svg`) wherever the prototype shows a technology name with an icon, and fall back to `V2ProductIcon`. Do not invent new icons.
- **Images:** the shipped v2 images are listed in `html-prototype/v2/BRIEF.md` (characters `char-*`, spot icons `ic-*`, scenes `scene-*`, thumbnails `th-*`, `hero-crew`). A page's own generated hero (`s.asset`) always wins over a shipped fallback.
- **Interactivity** is data-attribute driven by `src/site/v2/behaviors.tsx` (tabs, accordion with visual, carousel, filters, toc, parallax, marquee, counters, reveal). Use the same attributes as the prototype. Do NOT write new client components unless your task says so, and do not copy `html-prototype/v2/js/*.js`.
- **Live-only CSS:** if live markup needs rules the prototype CSS does not have (for example `.nx-prose` style rich text, honeypot fields, details-based FAQ), put them in `html-prototype/v2/css/live/<name>.css` (create it) and run the build script. Use only the design tokens (`var(--violet)`, `var(--p-lavender)`, `var(--snow)`, ...). No hex values. Do not edit `core.css`, `components.css`, the generated `public/assets/v2/*` files, or other agents' files.

## Content rules (carried over from the earlier port, non-negotiable)
- Content reads must not change: section ids, field keys, `numbered()`, omit-when-empty, evidence gating (`v3-evidence.ts`), `TrackedLink` events and CTA hrefs, `linkMap` and `paths` handling, and the exported names and props of every component. Other code and tests import them.
- Rich text keeps `sanitizeRichHTML` and is wrapped in `className="nx-prose"`-equivalent rich-text wrapper from the prototype (`.prose`). Never inject unsanitised HTML.
- Never invent copy, numbers, clients, quotes, awards, dates or prices. Never output "[draft" text: the prototype's yellow `.draft` placeholders stand for fields the live content fills, so map every placeholder to the real field and omit the block when the field is empty. `.gated` proof blocks map to the existing evidence-gated sections and render only when evidence exists.
- No em dash or en dash in any string you write. Sentence case headings. Number items only for real sequences.
- Keep structured data, breadcrumbs, canonical metadata, heading hierarchy (one `h1`), ids used as anchors, and accessibility attributes.

## Checks (run all before reporting)
1. `npx tsc --noEmit` (zero errors).
2. The renderer's tests: `npx tsx --test tests/<name>.test.ts tests/<name>.test.tsx` for your files. Keep behavioural assertions; change class-name assertions only.
3. `node scripts/build-v2-css.mjs` then, with the dev server running on http://localhost:3010 (already running, do not start another), `MSYS_NO_PATHCONV=1 node scripts/check-redesign.cjs --renderer <name> --label after`. Fix every line that starts with `x`. Lines starting with `!` about dashes are ignored. If your route is not in the sample list, pass the path directly.
4. Look at the screenshots in `tmp/redesign-shots/after/<slug>/` at 1440 and 390 with the Read tool, and compare against the prototype screenshots in `html-prototype/v2/tools/shots/<page>/`. Fix anything broken, empty, overlapping, cramped or off-style.

## Final report (your last message, under 400 words)
Files changed; the mapping of content fields to markup; images and art used; tests changed and results; the `tsc`, test and check-redesign summary lines; any shared change requests (changes you need in `core.css`, `components.css`, `behaviors.tsx`, `ui.tsx` or `v3-page.tsx`); anything you could not finish.
