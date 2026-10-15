# Redesign port brief (for every porting agent)

You are porting ONE live renderer to the approved redesign. The approved designs are static HTML in `html-prototype/` (open the page named in your task and its CSS in `html-prototype/css/pages/`). The live site must keep using its **existing published content and existing images**. Read this whole file before starting.

## Before writing code
1. Read `AGENTS.md`: this Next.js version has breaking changes. Read the docs in `node_modules/next/dist/docs/01-app/` that apply: `01-getting-started/05-server-and-client-components.md` and `01-getting-started/11-css.md`.
2. Read the renderer you own completely and its test file(s). Understand every content field it reads.
3. Read `src/site/ui.tsx`, `src/site/behaviors.tsx`, `src/site/ported.ts`, and how `src/v3-page.tsx` wraps your renderer when it is ported (search for `PORTED`).

## What stays exactly the same (do not change)
- Which content it reads: section ids, `fields` keys (`card_1_title`, `step_N_body`, `qN`/`aN`, ...), the `numbered()` helpers, omit-when-empty behaviour, `s.omitted`, evidence gating, `content.seo.keyFacts`, `breadcrumbs()`, `pillarFor()`, `industryPage()`, `TrackedLink` analytics events and CTA hrefs (`/contact?service=...`), `linkMap`/`paths` handling for previews, exported function names and props (other files import them).
- Rich text: keep `sanitizeRichHTML` / the existing `Rich` helpers; wrap rich HTML in `className="nx-prose"`.
- Number items only when the content is a real sequence (process steps, stages); tests assert this.
- No copy invented: if the prototype shows an element the content has no field for, leave it out. Never output `[draft` text. Never hard-code facts.

## What changes
- Markup and class names follow the prototype page (same structure and class names as in `html-prototype/<page>.html`, written as JSX: `className`, `strokeWidth`, `viewBox`, self-closing tags).
- Images: put the section's existing image (`s.asset`) where the prototype has an illustration, using `HeroArt` from `src/site/ui.tsx` (`<HeroArt asset={s.asset} fallback={<YourArt />} priority />` for heroes). When a page has no image, `fallback` shows the prototype's SVG illustration, ported to a React component in `src/site/art/<name>.tsx` (token classes only: `f-*`, `s-*`; `role="img"` with an `aria-label`).
- Icons: `Icon` (inline stroke icons) and `ProductIcon` (product icon set) from `src/site/ui.tsx`. The renderer's existing `iconFor`/`icon_key` values map onto `ProductIcon` names; keep a small map in your file.
- Route pages that are not rendered by V3Page wrap their content in `NxShell` from `src/site/shell.tsx` (header, footer, styles, behaviours, mobile CTA).
- Shared pieces from `src/site/ui.tsx`: `SectionHead`, `Breadcrumbs`, `Button`, `ArrowLink`, `FaqList` (native details accordion), `HeroArt`.
- Interactivity uses data attributes handled by `src/site/behaviors.tsx` (already mounted by the shell): `data-subnav`, `data-seg` + `data-model`, `data-tabs`, `data-steps`, `data-carousel`, `nx-reveal`. Do not add new client components or scripts; ask in your report if you need one.
- Styles: create `public/assets/nx/pages/<your-css>.css` by copying the generated reference `public/assets/nx/proto/<prototype-page>.css` (already scoped under `.nx`); files in `pages/` are yours and are never regenerated. Every selector must start with `.nx `. Colours, spacing, radii only through the tokens (`var(--indigo)`, `var(--space-6)`, ...): no hex values and no undefined tokens. Shared rules are in `public/assets/nx/site.css` and `live.css`; do not edit those, request changes in your report.
- Switch your renderer on: in `src/site/ported.ts` change only your own line from `null` to your CSS name (for example `skeleton: "skeleton",`). Do not touch other lines.

## Files you own
Only the files named in your task, plus your new `src/site/art/*.tsx` and `public/assets/nx/pages/<your-css>.css`, plus your line in `src/site/ported.ts` and your test file(s). Everything else is read-only. Other agents are editing other renderers at the same time.

## Checks (all must pass before you report)
1. `npx tsc --noEmit` (no errors).
2. `npx tsx --test tests/<your test files>` (update assertions about class names and markup to the new design, but keep every behavioural assertion: section order, numbering rules, quick answer, FAQ details, sub-nav anchors, links, evidence gating).
3. The dev server is already running at http://localhost:3010 (it reads the live database, read-only; never write data, never publish). Run `node scripts/check-redesign.cjs --renderer <name>` (for specific paths in Git Bash use `MSYS_NO_PATHCONV=1 node scripts/check-redesign.cjs /path`, otherwise Bash rewrites `/path`) and fix every `x` line. Lines marked `!` are dashes in published copy: ignore them.
4. Look at your screenshots in `tmp/redesign-shots/after/<page>/` (desk-*, mob-*) with the Read tool and compare with `tmp/redesign-shots/before/<page>/` and the prototype design. Fix anything broken, cramped, misaligned, empty, or clipped. Images must not be stretched (keep width/height attributes).

## Report (your final message)
Files changed; the content field → new markup mapping for each section; images used and fallback art added; tests changed and why; check results (paste the summary lines); anything you could not map; shared change requests.
