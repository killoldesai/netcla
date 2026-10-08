# Updated sitemap and content workflow

The 13 detailed CSVs contain 154 rows, reconciled into 151 planned URLs. The master CSV is retained for comparison, not used to match inconsistent IDs. `docs/site-plan/reconciliation.json` documents conflicts and master-only candidates. `docs/site-plan/reconciled-master.csv` is the replacement planning inventory.

## Owner workflow

1. Open Admin → Settings, select Bedrock or OpenRouter and save a model ID. Enter and save provider credentials in Admin Settings; see [AI credentials](AI-CREDENTIALS.md). Model testing makes a provider request.
2. Open Site Plan, filter the cluster/phase and select up to 10 pages. Generate selected uses the saved provider/model. Importing never generates or publishes content.
3. Run the background worker (`npm run worker`) alongside the web application. Generation jobs execute sequentially and save immutable drafts.
4. Open Edit to review the opening answer, paragraphs, lists and structured cards/tables/FAQs/links. Advanced fields use JSON; invalid JSON is not applied. Save a revision before generating an individual section. Section regeneration preserves all other saved sections.
5. Use the private desktop/mobile content preview. Review evidence, unresolved items and sources. These new previews are for content review; they are not approved final page designs.
6. Final design templates must be connected before these planned pages can publish. Existing published revisions remain active. Owner review and publishing remain mandatory; changing an evidence flag cannot bypass template readiness.

Portfolio, case-study evidence and Careers remain manually maintained. Company/trust copy can be drafted only with verified factual inputs. Imported instructions and metrics are editorial research, not approved company facts. Missing capabilities, prices, credentials, dates, team identities and contractual terms require owner input.

## Inventory operations

Run `npm run site-plan:build` after editing the source CSVs to rebuild the bundled inventory and reconciliation exports. The Docker application uses the bundled inventory without shipping research files.

Run `npm run db:migrate` then `npm run site-plan:import` to apply it. The importer saves a private local content backup, a database snapshot and `.backups/site-plan-content.sql`. Repeating an identical import preserves edits. A changed inventory deliberately replaces matched unpublished draft scaffolds after backup; preview the changes in Site Plan first. Published revisions, owner accounts, leads and existing articles/legal/supporting pages are preserved. Superseded drafts can be inspected under Content → archived and restored.

The SQL export endpoint includes inventory, brief history and backup snapshots; it remains owner-only. Backups contain private content and must not be deployed as public assets. Restoring export SQL into a freshly migrated database preserves content and revision pointers; owner credentials are provisioned separately.

## Website adaptation next

Use the reconciled sections to adapt the approved visual templates by family: core service, mobile, hiring, technology, industry, solution, location and trust. Preserve the software-led homepage, capsule navigation, Poppins, illustration artwork and separate marketing section. Keep public navigation focused on software, mobile, web and search marketing, with deeper pages under Services and contextual links. Validate each family on desktop/mobile before enabling publication.

Keyword database/date provenance is unverified in the new files. The import does not carry forward the earlier SEMrush US confirmation to newly supplied metrics. Country pages require useful local context and truthful India-based delivery; working-hour overlap, savings and salary figures require verification.
