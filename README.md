# Netofficials

Next.js App Router website and private owner content workspace, implemented from the approved HTML prototypes. All 56 designs are retained: 54 public page layouts plus the private design library and form-state reference. The original files in `homepage-concept` remain the comparison baseline.

## Local setup

Use Node.js 24 and npm. Copy `.env.example` to `.env`, set a Neon PostgreSQL connection string with SSL, and set `SITE_URL`, `SESSION_SECRET`, `RATE_LIMIT_SECRET`, `OWNER_EMAIL` and a strong `OWNER_PASSWORD`.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run owner:create
npm run dev
```

`npm run dev` starts both the website on port 3010 and the content writing worker, and restarts the worker if it stops. Use `npm run dev:web` when a separate worker service already handles the same database. `npm run worker` remains available for a dedicated worker process; deployed web and worker services must both be running.

Open `/admin`. Migration and seeding create private drafts; they do not publish the website. SQL migrations already include the idempotent inventory; the seed command is safe to run again. Remove `OWNER_PASSWORD` from persistent environment configuration after provisioning.

For design review without a database, enable `DESIGN_PREVIEW_MODE=true` in development and open `/design-preview/software-led`. This route returns 404 in production. It uses prototype copy and never stores enquiries. The authenticated `/admin/designs` library previews real saved revisions with the public templates.

## Content workflow

1. Add verified company facts and curated sources in Research. CSV research imports stay unapproved; a CSV with `url`/`path` and keyword-plan fields also maps briefs to existing pages.
2. Configure Bedrock or OpenRouter and a model in Settings; credentials remain environment secrets. Test the model before starting paid generation.
3. Select service/article drafts and generate. The worker saves an immutable revision and validation report. It never changes the published pointer. If the owner edited while generation was queued, the generated revision is available in history without replacing that newer draft.
4. Edit all required fields, check the desktop/mobile preview, remove unresolved items, and confirm `evidenceApproved` in the brief only after reviewing factual support.
5. Explicitly publish the saved revision. Rollback publishes an earlier validated revision. Unpublishing removes the page from public routing and listings. Revoking evidence also unpublishes dependent pages.

Company information, case studies, legal pages, pricing pages and homepage copy are manual. An approved author is recorded as a fact with the statement `Author: Full Name`. AI output cannot contain executable markup or SQL. Publication validation is a safeguard, not a substitute for checking whether claims are true.

Templates own section structure and assets. Content contains metadata and named text slots grouped into sections. Required hero/enquiry sections cannot be hidden. Optional sections can be hidden by their section IDs; hidden fields are removed before public serialization. AI protects fixed company and budget-option fields. Page briefs may contain `sourceIds` to narrow curated research.

## Architecture

- `app`: public routes, private admin, previews and enquiry endpoints.
- `src/templates/designs.json`: imported approved layouts, styles and section definitions.
- `src/render.tsx`: shared React rendering, navigation, forms, filters and delivery interactions.
- `src/content.ts`: Zod content and lead validation.
- `src/schema.ts`, `src/db.ts`: Drizzle models and PostgreSQL access; locking/queue transactions use parameterized SQL.
- `src/providers.ts`, `src/worker.ts`: provider adapters, leased queue and generation records.
- `db`: reviewed SQL migrations and draft inventory. AI never generates migration SQL.
- `public/assets`: local Poppins, artwork, logo and prototype styles.

Public pages query their active revision on each request, so publishing updates pages, navigation, listings and sitemap without a cache invalidation race. Draft routes return 404. All staging and private previews carry noindex controls. Optional GA4 excludes admin, preview and staging pages, omits query strings, and receives a conversion event only after a newly stored enquiry.

## Verification

```sh
npm test
npm run typecheck
npm run build
# With the development server and DESIGN_PREVIEW_MODE=true:
npm run test:visual
```

Visual tests compare every design at 1440px and 390px and write prototype/React/difference screenshots and a review gallery to `tests/visual-results`. Set `BROWSER_PATH` to a Chromium browser executable outside Windows. These are prototype-copy comparisons; preview newly generated content before publishing.

The API and worker integration tests use a disposable local PostgreSQL-compatible PGlite socket server, never Neon or customer data. See `docs/ACCEPTANCE.md` for the test sequence and limits.

See `docs/DEPLOYMENT.md` for Coolify deployment, backups, recovery and required credentials.
