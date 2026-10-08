# Revised publishing system

The source import reconciles 678 rows to 63 page blueprints, 571 section specifications and 53 designated hero illustrations. The hub/static CSV wins for software, mobile, AI and cloud. All four source files are included in the checksum and saved with the import. Existing pages outside this list, published revision pointers and legacy renderers are preserved.

## Owner workflow

Open `/admin#publishing` while signed in. Validate/import the files, select up to five pages and use the existing text-provider configuration. Discover image models before selecting an image model. Begin with mobile, Flutter and About. Text uses temperature 0 for blueprints and 0.3 for section content where the provider supports it. Default concurrency is two text requests and one image request.

Every request records its effective prompt, selected provider/model, usage and result. Section output must match the exact CSV fields. Blueprint names resolve to an approved registry; generated CSS or executable components are rejected. Original prompts are retained separately. Unsupported statistics, testimonials, project proof, leadership, awards, offices and vacancies are suppressed rather than fabricated. Verified editorial facts remain an owner-review input.

Failed tasks can resume without repeating completed tasks. Complete section text can be previewed when a hero asset is blocked, but these drafts cannot be accepted or published. The generated revision is retained separately when an owner has edited the current draft during generation. Illustrations must be inspected and accepted before page acceptance. All three pilot pages must be accepted before non-pilot batches can be queued. Acceptance does not publish; publishing remains the existing explicit owner action.

V3 pages use the saved blueprint, ordered fields and versioned asset references in both public and private previews. Earlier revisions continue to use their earlier renderer. Hub directories include the full existing child inventory, including planned destinations. A shared bottom CTA links to `/contact?service=…`; the Contact page uses the existing lead API, validation, attribution, duplicate handling and enquiry tracking. FAQ structured data comes from the visible answers.

## Runtime and deployment

Apply all database migrations before deploying either container. Run the existing worker command for generation, email-outbox processing and recruitment retention. Mount the same persistent volume at `/data` in web and worker, using `deploy/publishing.compose.yml` with the existing Coolify configuration. Both containers need the same `PROVIDER_ENCRYPTION_KEY`. The web image includes only the four specification files needed for reimports.

`PERSISTENT_ASSET_DIR=/data/assets` stores original PNGs and optimized WebP derivatives. `/media/:id` requires owner access for draft assets; only accepted assets referenced by a published revision receive public cacheable responses. Private CVs use `PRIVATE_CV_DIR=/data/cvs`; this directory must never be exposed by the reverse proxy. Keep these paths writable by the application user. Back up the persistent volume as well as PostgreSQL.

`npm run db:backup -- --with-files` includes the new records and persistent files in the protected full backup. This backup contains personal data and encrypted settings and must be stored privately. Restore with the existing restore command and the same encryption key. Ordinary content SQL exports include specifications and generation provenance, exclude newsletter/applicant/email/credential records, and cancel unfinished generation runs so an import cannot silently start paid requests. Source/derivative files still require the persistent-volume backup.

## SES newsletter setup

Save SES settings in the owner workspace: AWS region/credentials, verified identity, sender, reply-to, notification inbox, careers inbox, configuration-set name and SNS topic ARN. Credentials use the existing authenticated encryption and never appear in content exports or API responses.

In AWS, verify the sender or its domain, obtain SES production access, and add an SNS event destination to the configuration set for delivery, bounce and complaint events. Permit SES to publish to that topic. Subscribe the HTTPS endpoint `/api/newsletter/events` to the configured topic. The endpoint checks the topic, timestamp, AWS certificate URL and signature, and confirms only matching signed subscription confirmations. [AWS event-destination instructions](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-add-event-destination-sns.html) and [SNS signature rules](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message-verify-message-signature.html).

The IAM principal needs the SES actions used by `GetAccount`, `GetEmailIdentity`, `SendEmail` and `GetSuppressedDestination`. Run the account/identity check, then send a test email. Signup stays disabled until sender verification, production sending and a matching delivery event pass. Recheck within seven days. The outbox exposes retries and failures; bounces/complaints suppress recipients. Newsletter confirmation is double opt-in, expires after 24 hours and stores only hashed subscriber tokens. GET links do not mutate subscription state. Confirmed-subscriber export contains only active subscribers. No campaign composer is included.

## Careers setup

Create actual vacancies in admin and mark them verified before opening them. Only verified open vacancies appear publicly. `/careers/:slug` shows the role and application form. Required fields are name, email, selected vacancy, consent and CV; phone and cover message are optional.

Run a private ClamAV sidecar and set `CLAMAV_HOST`/`CLAMAV_PORT` in the web container. No scanner means no accepted CV. Files must be PDF or DOCX, no larger than 5 MB, pass signature/archive checks and return a clean scan. DOCX macros, embedded objects, encrypted archives, external relationships and excessive expansion are rejected. CV downloads require owner authentication, use attachment responses and are never public asset URLs. Applications deduplicate by vacancy/email and recheck the vacancy before acceptance. SES acknowledgements and inbox notifications are queued separately from project leads. Owner deletion removes the CV and application delivery records. Retention defaults to 180 days and runs hourly in the worker.

## Current pilot status

Proof fields require approved fact records. Attach their IDs through each section's `evidenceIds` when editing a draft; acceptance checks these references. Revoking a fact removes the associated proof from public rendering, including previously accepted revisions.

Mobile, Flutter and About text was generated through the configured Bedrock provider and saved as drafts. About is ready for review. Mobile and Flutter require OpenRouter credentials before their designated hero illustrations can finish. SES configuration and the ClamAV service are deployment/setup inputs; neither has been invented or activated. Nothing was published by the rollout scripts. Visual acceptance remains an owner action.
