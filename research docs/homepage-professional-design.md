# Netofficials homepage visual direction

The section order and priority of the approved homepage remain intact. Custom software, mobile, AI and cloud lead; website/eCommerce and search remain supporting services.

## Reference review

- [Stripe](https://stripe.com/in): light typography, fine borders, fluid graphic composition and precise interface illustrations.
- [PixelCrayons](https://www.pixelcrayons.com/): prominent service navigation, clear conversion actions and strong introductory hierarchy.
- [Radixweb](https://radixweb.com/): product-oriented illustrations and prominent development capabilities.

These informed an original Netofficials composition. Reference site graphics, copy, client logos, testimonials and business metrics were not reused.

## Design

- Original transparent SVG hero combining a business workspace, mobile application and automation flow. Its caption explicitly identifies conceptual interfaces.
- Indigo actions, navy type, Inter Tight, light display headings, fine borders and soft blue/periwinkle surfaces.
- Numbered priority services with original line icons, descriptive directories and consultation actions.
- Open layouts for supporting services, delivery stages and industry workflows.
- Tinted collaboration and hiring sections; a restrained dark consultation banner.
- Responsive layouts with a compact mobile hero, keyboard-accessible navigation and reduced-motion support.

## Implementation

Source: `scripts/build-stripe-homepage.ts`, `public/assets/stripe-home.css`, `public/assets/brand-home.css` and `public/assets/connected-product-hero.svg`.

Regenerate the HTML and React-safe template with `npm run design:homepage` followed by `npm run design:import`.

Saved copy slots, published-link filtering, service preselection and the existing enquiry API remain in use. Unavailable destinations appear as plain directory labels. Unverified numbers, promises and testimonials remain omitted.

## Verification

Homepage/content/navigation tests, TypeScript checking and the production build passed. Browser checks covered desktop (1440px), tablet (820px), mobile (390px), image loading, horizontal overflow, keyboard menu behavior, consultation preselection and required-field validation.

## Brand and interaction update

The header and footer now use the existing Netofficials logo. Its blue and lime palette extends into the primary actions, service treatments, process, hiring and consultation sections. Selected dark surfaces provide stronger contrast; secondary sections remain lighter.

The project selector uses accessible tabs with arrow-key, Home and End navigation, a visible default before hydration and service-specific enquiry actions. Its copy remains part of the imported template text slots. Decorative hero motion has a pause checkbox and respects reduced-motion preferences.

The updated six homepage checks, TypeScript and production build passed. Additional browser checks covered tab selection, keyboard focus, enquiry preselection, motion pause and overflow at 1440px, 700px, 390px and 320px.

## Flat-color redesign — October 6, 2026

The homepage now uses solid brand blue, lime, navy, white and pale tinted surfaces. Removed the gradient SVG/dashboard hero and decorative service numbers. Only the delivery process retains step numbers.

Replaced the main service card grid with four full-width service rows, each combining a business description, subservice directory and consultation action. Technologies are grouped by web/backend, mobile, infrastructure and data/AI. Supporting services prioritize design, testing, transformation and hiring before commerce/search. India, industries, project enquiry and the footer have distinct flat surfaces.

Hiring links retain specific published destinations. Unavailable roles lead to the published hiring hub when available, otherwise the enquiry form; no draft pages are exposed. Added a regression test covering this behavior.

Checked desktop (1440), tablet (700), mobile (390) and narrow mobile (320): no horizontal overflow or active gradient backgrounds. Verified mobile menu and mobile service preselection. Original enquiry validation, duplicate protection and saved-copy behavior retained. Existing full suite: 58 passed; targeted final suite including the new link test: 7 passed.

## Refinement — October 6, 2026

Replaced the oversized monogram with a flat product-architecture illustration, shortened the primary business headline, and reduced secondary heading scale. Main capabilities now use keyboard-accessible native disclosures with custom software expanded initially. Kept consultation preselection and published-only destinations. Added enquiry actions for supporting services when a public parent page is unavailable.

Refined technology groupings, supporting-service composition, dark India panel, lighter industries, lime project CTA and dark enquiry/footer flow. No gradients or decorative service numbering. Existing restored version remains backed up under .backups.

Verified desktop 1440, tablet 768, mobile 390 and narrow mobile 320: no horizontal overflow. Checked native keyboard disclosure activation and mobile service preselection. Targeted homepage tests and type check passed; production build passed.
