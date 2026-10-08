# Unified content generation

All 180 non-archived database URLs have imported specifications. The original 64 page definitions retain precedence. The supplemental file maps the remaining 116 pages, preserving IDs, titles and URLs.

## Owner workflow

1. Open Pages and select a page, or up to five pages.
2. Generate a full draft to adopt the new structure. Existing legacy revisions remain readable.
3. Use AWS Bedrock Sonnet 4.6 for copy and OpenRouter GPT Image 2.5, medium quality, for designated images; settings remain editable.
4. Watch task progress. Failed-only retry preserves successful tasks.
5. The editor loads the new draft automatically unless unsaved edits exist. Use Load generated draft when ready.
6. Preview the draft with the public renderer, check links and artwork, then Publish.
7. Visit the live URL. Generation alone never replaces the published revision.

Selective copy and image regeneration require a V3 draft. Copy-only regeneration preserves artwork. Image-only regeneration preserves copy. Pages with no designated image do not create image tasks.

## Controlled design

Full runs now create an approved deterministic blueprint without an AI layout request. AI supplies exact section fields, not CSS or executable components. Responsive layouts are owned by shared components. Service, hiring and industry specifications follow the Mobile/Flutter section pattern. Editorial, policy and utility pages use text-oriented compositions and the common visual theme. Homepage and original directory specifications retain their own content structures.

## Review and rollout

The supplemental mappings are baseline family specifications, not a claim that every page has been visually approved. Validate one generated draft from each family before bulk generation. Start with five-page batches; inspect subject relevance, internal links, missing evidence, images, responsive layout and metadata. Policy pages need approved legal copy; never use generated commitments as verified policy. Do not invent testimonials, leadership, vacancies, awards, statistics or project evidence.

Only seven pages currently have V3 drafts; mapping all URLs does not convert their existing copy. Use the coverage CSV for generation/publication readiness. New pages added later require a specification import. The scripts/complete-page-specs.ts helper builds missing family mappings; archive/review inappropriate duplicates before generating them.

No bulk generation or publication was performed by this integration change.
