# Unified admin

The main admin uses Dashboard, Pages, Production, Media, Leads, Newsletter, Careers and Settings. Previous content/site-plan hashes map to Pages, generation/publishing hashes map to Production, and Research maps to Pages → Evidence. `/admin/publishing` redirects to Production. Sign-in accepts only a local admin return destination.

Pages lists summaries with server pagination (25, 50 or 100 rows), URL filters, independent publication and draft-review states, and specification coverage. Page editors load their content and history only when opened. V3 fields come from the exact imported specification; legacy copy editors remain available. Saving creates an immutable revision with a compare-and-swap check. Review acceptance is tied to the revision, not merely the latest production run. Publication remains explicit.

Production combines legacy jobs and revised pipeline runs while labeling their units. The pilot gate has been removed. Batches remain limited to five pages. A page has at most one active generation operation across both engines. Whole-page, selected-section and hero-only generation create new drafts. Selective runs carry forward unchanged fields and assets; the worker queues only requested work. Cancellation prevents new claims and late adoption. Retry keeps completed results. Failed or independently generated results can be previewed without changing the published page.

Settings shares the existing encrypted OpenRouter/Bedrock credentials. Generation defaults store a separate image model. Dashboard totals use aggregate queries rather than recent-record limits; date reporting uses India time and comparison against the preceding equal period. Provider configuration does not imply invocation access. SES configuration does not imply successful delivery. Scanner configuration does not imply a clean scan. Unknown health remains unavailable rather than green.

Apply migration 011 before deploying the web and worker together. Existing backup/export routines include the new scope, selection and cancellation columns because they preserve full rows. Keep the existing encryption key and private asset/CV volume. The redesign itself neither generates content nor publishes pages.

Validation includes pagination beyond 200 records, safe login returns, secret masking, selective regeneration, cancellation, duplicate operations, legacy content compatibility, and generation outside the former pilot gate. Browser visual approval remains unverified when the configured browser tool is unavailable or access is rejected.
