# v2 page builder brief (read fully before building)

You are building static HTML pages for the Netofficials v2 prototype in `html-prototype/v2/`. The design copies the monday.com look: white canvas, Poppins, violet `#5f5ff6` actions, pastel rounded containers, 3D characters and spot icons, big type, and lots of gentle motion. The homepage `index.html` and the cookbook `components.html` are the quality bar. Your page must look like it belongs to the same site.

## Files you own (and nothing else)
- `html-prototype/v2/<page>.html` (start by copying `_template.html`)
- `html-prototype/v2/css/pages/<page>.css` (page-only rules; may be empty)

Read-only for you: everything else. That includes `css/core.css`, `css/components.css`, `css/home.css`, `js/*.js`, `partials/*`, `components.html`, `index.html`, the images, other pages, the old `html-prototype/*.html` skeletons and the whole repo outside `v2/`. If you need a shared change (a new component, a behaviour, an icon, an image), do not make it: list it under "Shared change requests" in your final report.

## How to work
1. Read the old skeleton `html-prototype/<page>.html`. It has the approved section list and the real copy. Keep every section, in order, with the same copy, links, `.draft` and `.gated` content. You are re-skinning and re-laying it out, not rewriting it.
2. Open `components.html` and pick a component for each section (see "Section to component map"). Copy the markup between the `COMPONENT` comments. Change the copy, ids and image names. Do not invent new CSS when a component exists.
3. Put links as real site paths (`href="/saas-development-services"`, `href="/contact"`). The sync tool rewrites them. In-page anchors stay `#id`.
4. From the repo root run `node html-prototype/v2/tools/sync.mjs <page>.html`, then `node html-prototype/v2/tools/check.cjs <page>.html`.
5. Fix every problem the checker lists. The one exception: "links to missing files" for other pages that are not built yet is expected. Report those, do not remove the links.
6. Look at your screenshots in `html-prototype/v2/tools/shots/<page>/desktop.jpg` and `mobile.jpg` with the Read tool. The desktop image is long, so crop parts if needed with `node -e` and sharp, which is in the repo. Fix anything broken, cramped, empty, misaligned or overlapping. Repeat steps 4 to 6 until it passes and looks polished.

## Copy rules (strict)
- Use the copy already in the old skeleton. If you need more, take it only from `src/site-structure.ts`, `src/templates/site-plan.json` (find the entry by `"url"`), `src/home/copy.ts` and `src/company.ts`.
- Anything you write yourself goes in `<span class="draft">[draft: ...]</span>`. Short eyebrow labels and button labels that repeat existing wording are fine.
- Never invent facts: no statistics, client names, logos, testimonials, awards, prices, team sizes, years (except 2011, the founding year), ratings or guarantees. Proof stays in `div.gated` with `span.gated__label` reading "Shown when approved evidence exists".
- No em dash or en dash characters anywhere, including HTML comments shown as text, alt text and titles. Write "1 to 3 months".
- Sentence case headings. No slogans. Number items only when the order is real (process steps).
- `<title>` and meta description come from the site-plan entry, or from the old skeleton.

## Design rules
- One `h1`, in the first section. Logical heading order after that.
- **Alternate the section rhythm** the way monday does:
  - white section, then a `sec--cloud` band or a rounded pastel container
  - a big centred heading (`.big` or `.h2` in `.sec__head`) every two or three sections
  - one "wow" block per page: a `ctx` with parallax cards, `mcard` stacked cards, the `team` carousel or a `band` with a mock
- **Motion:**
  - Add `rv` to blocks that should rise in on scroll.
  - Give `wf` steps increasing `transition-delay`.
  - Use auto-advancing `accs`.
  - Use `data-autoplay` carousels.
  - Use mocks with live status pills.
  - Do not write new keyframes unless you need one.
- **Images:** use the generated images listed below with exact file names. Use spot icons on cards and features, characters on team carousels, avatars and band corners, and scenes as section art. Every `img` needs `alt` (`alt=""` when decorative and next to text that says the same).
- **Icons:**
  - Line icons come from the sprite: `<svg aria-hidden="true"><use href="#i-NAME"/></svg>`. Names: arrow, left, check, check-c, plus, chev, menu, x, doc, clock, flag, key, shield, users, spark, bolt, brief, cursor, search, mail, pin, calendar, chat, code, layers, rocket, gear, cloud, phone, chart, coin, globe, lock, eye, heart, book, briefcase, star, external, linkedin.
  - Product and tech icons: `<svg aria-hidden="true"><use href="../assets/icons.svg#NAME"/></svg>`. Names: code-brackets, mobile-device, brain-circuit, cloud-upload, settings-gear, layers-stack, shield-check, users-group, rocket-launch, chart-bar, document-text, api-plug, flutter-diamond, react-atom, nodejs-hexagon, python-snake, aws-cloud, kubernetes-wheel, docker-whale, terraform-blocks.
  - No emoji.
- **Page CSS:** use only tokens (`var(--violet)`, `var(--p-lavender)`, ...). Never hex values; the checker fails on them. Keep page CSS small: layout tweaks only.
- **Responsive:** must work at 390px wide with no horizontal scroll. Components already collapse at 1100, 960 and 720 px. If you add grids, use `minmax(0, 1fr)`.
- **Accessibility:** real `<a href>` and `<button>`, labels on every form field, `aria-label` on icon-only buttons, decorative mocks get `aria-hidden="true"`, and 44px touch targets.
- **Forms:** the service select must have `id="f-svc"` so `?svc=` and `data-pre` pre-fill work. Wrap forms in `form.form[data-form]` with a `[data-note]` line.
- **Footer:** every page ends with the `cta` partial, then the footer partial (already in the template).

## Section to component map
| Old skeleton section | v2 component |
|---|---|
| Page hero (family pages) | `hero--center` with eyebrow spot icon, `gword` on one word of the h1, `hero__acts`, then a `band` with a prompt and a matching mock and a `band__char` |
| Page hero (company pages) | `hero--statement` or `hero--form` |
| Overview or "at a glance" | `split` with text and a `frame` or `mock`, or a `catgrid--2` |
| Deliver or what we build | `accs` (3 to 5 items) with mocks on the right |
| Process or stages | `wf` (numbered) |
| Stack or tools | logo marquee `trust` + `marquee`, or `skills` chips |
| Who it is for, services, sectors, related | `catgrid` with spot icons, or `irow` |
| Industries | `irow` coloured cards |
| Cost factors, commitments, assurances | `feat` grid with spot icons |
| Engagement, models | `plans`, `tabs`, or `mcard` stacked cards |
| Comparison | `cmp` table |
| Team, roles | `team` carousel with characters |
| Why us, approach | `ctx` big type with floating cards |
| FAQ | `faq` + `acc` |
| Proof (gated) | `gated` blocks styled inside the layout they will use |
| Articles, legal | `article` + `toc` + `prose` |

## Generated images (html-prototype/v2/img/, use `img/NAME.webp`)
- **Role characters (square, pastel background):**
  - char-fullstack, char-ai, char-devops, char-mobile, char-cloud, char-design
  - char-react, char-nextjs, char-node, char-python, char-laravel, char-flutter
  - char-ios, char-android, char-aws, char-data, char-qa, char-lead
  - Each is an illustrated role, never a named person or a team member.
- **3D spot icons (square, pastel tile):**
  - Practices: ic-software, ic-ai, ic-devops, ic-mobile, ic-cloud.
  - Industries: ic-healthcare, ic-fintech, ic-edtech, ic-realestate, ic-logistics, ic-ondemand, ic-retail, ic-travel, ic-legal, ic-hr, ic-insurance, ic-manufacturing.
  - Features: ic-scope, ic-milestones, ic-timezone, ic-handover, ic-security, ic-team, ic-cost, ic-support.
- **Scenes:**
  - scene-about-team (16:9, white): five characters around a board
  - scene-contact (4:3, lavender): character waving at a desk
  - scene-404 (1:1, white): character holding a map upside down
  - scene-careers (16:9, white): three characters high five
  - scene-models (16:9, white): three characters with a blueprint, a roadmap and a puzzle piece
  - scene-howwework (16:9, white): a team passing a package along stages to a rocket
  - scene-blog (4:3, lime): character reading a giant book
  - scene-founder (4:3, periwinkle): an empty founder desk, no person
  - hero-crew (4:3, white): an engineer character
- **Guide thumbnails (4:3, pastel):** th-cost, th-timeline, th-mvp, th-saas, th-seo, th-ppc, th-ecommerce, th-website, th-redesign, th-checklist, th-compare, th-agency.

## Final report (your last message, keep it under 400 words)
- Files created
- Sections as built, in order, with the component used for each
- Copy sources used; every `[draft: ...]` and `.gated` placeholder
- Images used
- Checker summary line, and any remaining checker lines with the reason
- Shared change requests, if any
