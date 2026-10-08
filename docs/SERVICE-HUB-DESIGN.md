# Connected service-hub design

The homepage prioritizes custom software, mobile applications, AI/automation and cloud/DevOps. Websites/eCommerce and SEO/PPC are supporting services. The audience is business owners and the conversion offer is a project consultation enquiry.

## Decisions and rationale

- Use six buyer-facing groups instead of the full 151-page planning inventory. Software, mobile, AI and cloud receive substantial visual treatments; websites and search marketing receive compact treatments, reflecting the owner's priorities.
- Use original lightweight SVG/CSS connected-interface graphics instead of generic stock imagery. These are labeled conceptual artwork, not client projects.
- Link service descriptions to published service destinations; reserve consultation buttons for enquiries. Preserve existing URLs and distinguish draft inventory from public navigation.
- Retain the lead endpoint, required fields, attribution and duplicate protection. No calendar integration, free assessment, response-time promise or gated download is introduced.
- Preserve saved homepage copy and existing slot identities, with template defaults for new slots. Update the private site preview to use saved draft/revision content.

## Next-phase parent hubs

Use the existing software, mobile, AI, cloud, website, SEO and PPC parent URLs. The homepage's combined visual categories do not create duplicate parent pages. Each parent hub should follow:

1. Hero naming the service, the business problem and the consultation offer.
2. Relevant business needs and expected deliverables.
3. Subservice directory: descriptive links with short explanations.
4. Verified work where published and relevant; otherwise explain deliverables and review milestones.
5. Delivery process, requirements and cost factors without invented pricing.
6. Relevant technologies, industries and engagement options.
7. Buyer FAQs and a service-context consultation form.

Subservice pages answer narrower buying questions, show their own deliverables and FAQs, and link back to their parent. Add breadcrumbs when those templates are redesigned. Keep related technologies and industries contextual; avoid duplicating broad service copy across every topic page.

## Measurement and publication

Rebuild the homepage source with `npm run design:homepage`, then refresh the imported templates with `npm run design:import`. Existing text-slot identities are retained for the hero, established service headings/bodies, buyer paths, delivery process, FAQs and form. New graphics and capabilities use new slots.

`npm run test:homepage` expects a development preview with `DESIGN_PREVIEW_MODE=true` at port 3012 (or set `TEST_BASE_URL`). It checks 1440/768/390/320px layouts and shared chrome on representative inner pages. `npm run test:homepage-leads` requires a separate disposable database provisioned by `scripts/local-test-db.ts` and a local app at port 3013, with the database URL, site URL and test-only rate-limit secret configured. It saves and publishes test content only in that disposable database; never point it at the live app.

`service_hub_click` records the hub and destination; `consultation_click` records the hub and destination; existing `generate_lead` records successful newly stored enquiries. These events exclude personal form data. Preview interactions do not emit conversion events. Review qualified enquiries by service alongside aggregate engagement. Search priorities require current Search Console data, not assumed keyword volume.

Publication remains an owner-controlled action. No migration, content generation or automatic publication is required for this design change. Old saved homepage copy may still use previous wording: review and edit it deliberately rather than replacing it silently. Only published destinations appear in public hub links; private previews can navigate to draft previews.

## Stripe-reference visual revision

The revised homepage uses light Manrope typography, a text-led hero with an original flowing pastel ribbon, compact indigo actions, and an asymmetric capability grid. Software spans two columns and mobile spans two rows on desktop; AI and cloud remain prominent. The grid becomes one column on mobile. Interface illustrations are conceptual SVG/CSS artwork. Saved homepage text continues to take precedence over defaults.

## Brand and content polish

Use the existing brand indigo (#4553b2) and lime (#b9d725), with softer neutral headings and muted purple accents. The hero retains its original ribbon graphic; service artwork is now transparent SVG icons with fine orbital lines. Primary services occupy four open panels, followed by compact supporting services. Add practical buyer opportunities around manual work, customer experience and product growth, and development-focused FAQs. Consultation and published-link behavior stay intact.

## Agency-reference editorial refinement

Reviewed https://www.pixelcrayons.com/ and https://radixweb.com/ for clearer service scope and engineering positioning. The homepage now names custom software and mobile applications directly, uses a small original SVG system diagram instead of the pastel ribbon, and removes orbital icon decorations. Tighten service spacing, use concrete project examples, and remove the redundant buyer-starting section. Keep the brand palette and service priority. Reference companies’ client logos, statistics, credentials and delivery promises are not used as Netofficials evidence.
