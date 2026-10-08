# Service hub implementation

The four priority hubs now share the homepage theme and a twelve-section layout:

- /custom-software-development
- /mobile-app-development
- /ai-development-services
- /cloud-services (retained canonical URL; no new /cloud-devops page)

Local review: /design-preview followed by the canonical hub path. Existing custom-software template preview also uses the new layout.

## Content and links

src/service-hubs.ts defines category-specific defaults. The directory is generated from src/templates/site-plan.json, using each child page H1. src/service-descriptions.ts supplies focused two-sentence descriptions. Published listing descriptions and matching saved directory cards take precedence over defaults. Saved hero, audience cards, process cards, deliverables, related-service links and FAQ content are used when available. Missing fields retain the category defaults.

All directory, industry, engagement and related-service links remain visible even when their targets are unpublished, as requested. This does not publish draft content or bypass publication checks on destination pages. Private previews map existing targets to their private preview URLs. Local hub previews link between the new hub previews.

The existing lead form and API are reused. Each hub preselects its service, maintains required name/email/service/goal fields, and includes the existing spam trap, attribution, error handling and duplicate request protection. Preview forms do not send data.

No unverified project counts, fixed delivery windows, free-call offer, NDA promise or support guarantee has been introduced. Project examples are labelled illustrative until relevant published case studies exist. Service and FAQPage JSON-LD match the rendered content; structured data does not guarantee search features.

## Validation

15 targeted homepage/menu/hub tests passed, including planned links, saved copy, schema, private-preview mapping and lead schema. Type checking passed. Desktop, mobile (390px) and tablet (768px) reviews found no horizontal overflow. FAQ keyboard expansion, preview form submission and mobile service preselection were checked. All nine mobile technology logos loaded; AWS and Azure were checked visually in the cloud hub.

Production build passed. Local hub directories contain 10 custom software, 8 mobile, 14 AI and 7 cloud child services. All four previews were checked.

## Homepage styling alignment
Switched the hub from Arial to the homepage's Inter Tight font, aligned heading weights and sizes, restored the white hero and added the same flat blue/lime service treatments. Replaced formulaic section headings with direct labels. Removed illustrative project cards; missing evidence now uses a concise request to discuss relevant examples. Fifteen targeted tests and type checking passed. Browser review was blocked by automatic approval review following an earlier browser security restriction.

Production build passed after the alignment changes; service-hub preview returned HTTP 200.

## Common-section consistency
Hub enquiry sections now render the actual imported homepage contact template through SharedProjectEnquiry, with the service preselected. Industries reuse homepage feature styling; technology rows use the same font, logo sizing and spacing. Added Android and Apple/iOS vector assets. Redesigned the capability strip and dark section navigation. Sixteen targeted tests pass, including CTA template parity and both platform logo assets.

Production build passed and updated service-hub preview returned HTTP 200. Live visual review remains restricted by the prior browser approval block.

## Main service directory
Added /design-preview/services and the /services renderer for publication. The main directory links all seven parent hubs and their inventory children, with the shared homepage enquiry template. Preview navigation links Services to this directory. All seven category hubs are implemented; main-directory tests passed and preview returned HTTP 200.


## Main services directory refinement — 6 October 2026
- Replaced the dense two-column directory with wide split service bands, original SVG line artwork and a connected-service hero composition.
- Kept software, mobile, AI and cloud prominent; placed website, SEO and PPC in compact supporting treatments.
- Used flat brand colors, retained all inventory links and the shared homepage enquiry.
- Content/menu/form suite: 18 passed. Additional main-directory child-link assertions passed; type checking passed. HTTP preview returned 200. Browser visual review unavailable due prior access restriction.
- Production build passed.

## Main Services page — attached prompt rebuild
- Added the ordered navigation-first structure: hero and group jumps, directory overview, Build & Engineer, technology index, hiring models and roles, business solutions, search marketing, industries and the shared enquiry.
- Flat lavender, blue, lime, navy, peach and frost surfaces; original SVG category/industry icons. Four core development areas remain visually dominant, with websites and eCommerce smaller.
- Reconciled prompt routes to current URLs: Cloud /cloud-services, UI/UX /ui-ux-design, specialist links to /custom-software-development#hub-services. All linked destinations are in the existing inventory; planned pages remain unpublished.
- Counts describe inventory pages, not staffing availability. Included the existing role pages rather than inventing three extra roles. Removed unverified delivery deadlines, savings, compliance and free-call promises; retained the homepage enquiry CTA.
- Added WebPage + six ItemList schemas, main-page metadata and private-admin preview rendering. Hub click events contain only service/destination/source.
- Type checking and production build passed. Preview page and its stylesheet returned HTTP 200. Desktop/tablet/mobile CSS breakpoints and reduced-motion behavior are implemented; actual browser visual review remains unavailable following the prior access block.

## Service-hub activity hero
- Replaced the former connected-device SVG with a reusable HTML/SVG activity panel across all seven service hubs.
- Hub name, three metrics, four activity rows, three technology pills and directory destination are supplied through props. Each hub has its own neutral illustrative content.
- SVG repeating dot pattern replaces the requested CSS radial gradient so no gradients, images, icon fonts or shadows are used. Panel width is capped at 440px inside a 480px visual; height grows to avoid clipping readable activity rows.
- Kept figures neutral until verified and labelled the entire panel as illustrative, not live project data. No invented delivered-project counts, delivery windows, years or uptime.
- Replaced ivory and lavender section fills in category hubs and the main services index with white/mist or solid brand green. The panel tag uses white instead of lavender to reflect the user's final color preference.
- 21 content, navigation and form tests passed; type checking passed. Mobile preview and activity stylesheet returned 200; old artwork absent. Browser visual review remains unavailable due the earlier access block.
- Production build passed. New text/color pairs meet 4.5:1 contrast (smallest checked ratio 4.54:1).
