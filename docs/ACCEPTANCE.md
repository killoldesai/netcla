# Acceptance checks

## Verified in this workspace

- Production build and standalone Node server passed.
- 15 automated content, database, privacy and adapter tests passed.
- 112 comparisons covered all 56 approved designs at desktop/mobile widths; maximum recorded pixel difference was 0.16%, with no horizontal overflow, broken images or browser runtime errors.
- Keyboard/touch-compatible menu controls, FAQs, delivery tabs, service selection, preview forms and filters passed browser checks.
- Long headings, expanded body copy and omitted optional sections passed layout checks across nine template families at both widths.
- API integration passed authentication, preview, publication/rollback/isolation, lead storage/deduplication, queue creation and SQL-export checks against disposable PostgreSQL-compatible test data.
- Browser lead tests confirmed entered fields survive storage failures, successful storage produces one conversion, and retries do not duplicate enquiries.
- Worker integration saved valid drafts through both Bedrock and OpenRouter mocked responses, preserved published revisions and concurrent owner edits, and passed retry/cancellation/expired-lease checks.
- Web/database and worker heartbeat health checks passed. Runtime production/staging robots controls passed using the same standalone build.
- The production dependency audit reported zero vulnerabilities.

Live Neon, paid-provider calls and Coolify/Docker infrastructure remain to be verified with supplied credentials. No real enquiries or project evidence were used in local integration tests.

## Automated local checks

`npm test` exercises content structure, safe sources, author approval, publication gates, hidden-field privacy, structured data, PostgreSQL migrations/seeding, immutable revisions, single-owner integrity, atomic queue claims, lead deduplication, content SQL restore and mocked Bedrock/OpenRouter success/failure paths. Provider mocks verify adapters; they do not validate account permissions or model availability in your provider account.

`npm run typecheck` and `npm run build` validate the TypeScript application and production compilation. Dependencies are locked in `package-lock.json`.

`npm run test:visual` compares every approved design on desktop (1440px) and mobile (390px), checks runtime errors, horizontal overflow and broken images, and produces a screenshot gallery. Review `tests/visual-results/index.html` alongside `report.json`. Percentage differences are image-test measurements, not a design-quality rating.

## API and worker integration sequence

Use a separate disposable test database. The helper binds locally on port 5439 and provisions a test-only owner. Never deploy this helper or these sample credentials.

```sh
npm run db:test-server
```

In another terminal, set `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5439/postgres`, `SITE_URL=http://localhost:3001`, a test `RATE_LIMIT_SECRET`, and `STAGING=true`. Build/start the application on port 3001. If a design-review dev server is running, use `NEXT_DIST_DIR=.next-integration` for the separate build. Then:

```sh
npm run test:api
npm run test:worker
```

API tests verify unauthorized access, authentication, private previews, public draft 404s, blocked publication of unresolved drafts, saved-revision publishing, edited-draft isolation, rollback, lead validation/storage/duplicate handling, origin checks, inbox retrieval, job creation, unpublishing and owner-only SQL download. Tests publish only disposable template content inside the local test database.

Worker integration tests verify bounded retries, expired lease recovery and cancellation using unavailable credentials, then use a mocked successful response to verify draft creation, published-revision isolation and protection of edits made while a job was queued. Real generated content must be checked on staging.

## Required environment acceptance

Before launch, verify these with the supplied domains, credentials and approved content:

- Apply migrations on Neon and restore an exported backup to a separate Neon branch.
- Build both Docker targets, deploy through Coolify, and verify non-root runtime, TLS, proxy client-IP behavior, health checks and container restart recovery.
- Test both providers with your selected available models; generate service/article drafts, inspect usage and failures, and confirm drafts remain private.
- Review real content at desktop/mobile widths, including unusually long headings and optional sections. Check all service-specific forms and qualification fields.
- Publish the approved core pages, verify sitemap/canonicals/redirects/internal links and page-visible structured data, and verify staging remains noindex.
- Submit enquiries, retry a failed submission, confirm fields survive failure, verify duplicate protection and inbox qualification/export, and check optional GA4 contains no personal data.
- Confirm project, pricing, team, legal and author claims before publishing; keep unsupported specialist/evidence pages unpublished.

No production deployment, real provider generation, rankings or lead outcomes are implied by local verification.
