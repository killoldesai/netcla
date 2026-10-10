# Coolify deployment and recovery

## Configuration

Provide production and staging domains, Neon credentials, Coolify project/VPS access, provider credentials and verified company/source information. Configure secrets in Coolify; do not commit `.env` or place credentials in page content.

Use `DATABASE_URL` with Neon's pooled hostname and SSL for the web and worker. Use `DIRECT_DATABASE_URL` for migrations. The app uses at most five connections per process. Apply migrations once before starting generation.

Required web configuration: `DATABASE_URL`, `SITE_URL` (exact externally visible origin), `STAGING`, and a randomly generated `RATE_LIMIT_SECRET` or `SESSION_SECRET`. Set both secrets to independently generated values of at least 32 bytes. HTTPS is required for deployed session cookies. Set staging to `true` until launch checks pass, and `false` only on the production site.

Configure `PROVIDER_ENCRYPTION_KEY` identically for web and worker. Enter AWS region/access keys or the OpenRouter API key in Admin Settings; see [AI credentials](AI-CREDENTIALS.md). Bedrock requires access to the selected Converse-compatible model/inference profile. The application does not switch between these providers. OpenRouter fallback routing is disabled. Models with incompatible output/token parameters fail visibly rather than publishing partial content.

`AI_MAX_TOKENS` defaults to 12000; `AI_MAX_BATCH` defaults to 10; `AI_TIMEOUT_MS` defaults to 180000 and is bounded below the 10-minute job lease. Start with one worker replica, which processes one job at a time. The worker retries at most three times and recovers expired leases. Budget limits should also be set in your provider account.

`TRUST_PROXY` defaults to false, which uses a shared conservative rate-limit bucket. Enable it only after verifying Coolify's reverse proxy overwrites or appends a reliable rightmost client address and direct access to port 3000 is blocked. Confirm this on staging before enabling public lead capture; a shared bucket intentionally limits total submissions while proxy trust is unconfigured.

### Launch settings

The site stays out of search while `STAGING` is anything other than exactly `false`. When going live, set on the web service:

- `STAGING=false`
- `SITE_URL=https://netofficials.com` (the https public origin, no trailing slash; the same value drives canonicals, the sitemap, social tags and structured data)
- `GA4_ID` for analytics
- Optional: `SITE_SAME_AS` (comma separated extra profile URLs; the LinkedIn company page is built in, see `src/company.ts`) and `SITE_CONTACT_EMAIL` (public sales email for structured data)

At startup the web service logs `[launch-check]` errors if `STAGING=false` with a missing, local or non-https `SITE_URL`, or a missing `GA4_ID`. After deploying, confirm `/robots.txt` allows crawling, `/sitemap.xml` lists the pages, and `/api/health` reports `"indexing":true`.

Redirect `www` and `http` to the single canonical `https://netofficials.com` at the proxy. Retired URLs from the previous site are redirected in `src/legacy-redirects.ts` (review copy in `docs/legacy-redirect-map.csv`); keep them for at least 12 months. Submit the sitemap in Google Search Console after launch.

Optional `GA4_ID` enables production-only anonymous page/conversion events. There are no email notifications in v1.

## Deploy

Create a Coolify Docker Compose resource from this repository using `docker-compose.yml`. It builds two targets from `Dockerfile`: non-root `web` and non-root `worker`. Route the staging HTTPS domain to the web service's internal port 3000. Do not publish the worker or database connection publicly.

The worker image contains the migration/admin provisioning commands:

```sh
docker compose run --rm -e DIRECT_DATABASE_URL worker npm run db:migrate
docker compose run --rm -e OWNER_EMAIL -e OWNER_PASSWORD worker npm run owner:create
docker compose up -d
```

The `-e` values must exist in the invoking environment/Coolify one-off task; never paste secrets into repository files. Initial migration includes every draft page. Re-running it is tracked and safe. `db:seed` can add missing inventory without modifying existing pages.

Web health checks query Neon through `/api/health` and return 503 when unavailable. Worker health checks read a database heartbeat maintained during generation. Verify both are healthy before publishing. The web image uses the standalone server, with assets and Next static files copied into the runtime image.

Review the core pages, qualified-enquiry definition and consent copy, test both configured providers with real credentials, submit a staging enquiry, and verify the inbox before launch. Publish only approved revisions. Check published navigation, URLs, redirects, canonical tags, sitemap, noindex configuration and analytics. Staging should use a separate Neon branch/database and provider budgets.

## Backups and restore

The owner-only SQL download exports pages, revisions, facts, sources, redirects and asset metadata from a consistent snapshot. It excludes owner credentials, sessions and leads. Restore into an empty database with the same migrations applied; existing rows are preserved. Its final statements restore active revision pointers, including published state, so use a private staging database first.

```sh
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -f content.sql
```

A full content-and-lead JSON backup is available through `npm run db:backup`. Run the underlying command directly when redirecting output so npm's command banner does not corrupt the JSON:

```sh
node --env-file-if-exists=.env --import tsx scripts/backup.ts > backup.json
npm run db:restore -- backup.json
```

The backup includes facts, sources, pages, immutable revisions, leads, redirects, settings and asset metadata. Store it securely: enquiries contain personal information. Owners/sessions/provider secrets and in-flight jobs are excluded. Recreate the owner, configure secrets, and requeue needed drafts after restoration. Restore only into an empty migrated database; existing records are intentionally not overwritten.

Rotate the owner password with `OWNER_PASSWORD` supplied securely and `npm run owner:rotate`; all active sessions are revoked. Rotate provider and database secrets through Coolify. Expired sessions and rate-limit records can be periodically removed through database maintenance.

For worker restart recovery, queued jobs remain in Neon and expired running leases are reclaimed, up to the retry limit. Cancellation changes the lease token, fencing late responses. A revision generated after an owner edit is retained in history without replacing that edited draft. For database outages, stop publishing, restore connectivity and restart services; enquiry forms show failure and retain entered fields.

Docker builds, actual VPS routing/TLS, Neon extensions and paid provider invocation must be verified in the supplied environment. Local tests are not a substitute for those checks.
