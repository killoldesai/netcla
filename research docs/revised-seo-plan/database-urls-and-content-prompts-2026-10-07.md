# Database URL and prompt export

Exported on 7 October 2026 from a read-only, repeatable-read database transaction. No database records were changed.

- Includes all 189 page records: 180 active and 9 archived. Redirect aliases are not page records and are not included.
- The first 22 columns match the supplied sample, in the same order. Values come from each database page brief; unavailable fields are blank. Sample research values were not copied into unrelated database records.
- `page_id` retains the stored planning ID where present; otherwise it uses the database UUID. `database_page_id` always contains the UUID.
- `master_ai_prompt` is the current stored page brief prompt (151 present). It is not proof that this prompt was used for an earlier generation.
- `latest_successful_generation_master_ai_prompt` is the master prompt retained in the latest completed generation job's brief snapshot (113 present). Blank means no historical master prompt was recoverable from that job; no replacement was invented.
- A saved master prompt is the editorial brief, not the entire provider request. The worker builds an additional JSON request with design context, allowed links and output instructions; the complete historical request is not stored.
- The latest successful generation may be a draft or a section update. `generation_section_id` identifies section-only jobs when present. It does not necessarily describe the currently published revision.
- `phase` preserves the stored phase separately; a phase number is not converted into a day range. Dates in the generation column are UTC ISO timestamps.
- CSV is UTF-8 with a BOM and supports multiline prompts. Re-parsing verified all 189 URLs and every exported field exactly.

## Summary

```json
{
  "exported_at": "2026-10-07T03:33:05.318Z",
  "rows": 189,
  "active": 180,
  "archived": 9,
  "published_active": 111,
  "current_prompts": 151,
  "saved_generation_prompts": 113,
  "missing_current_prompts": [
    "/404",
    "/blog",
    "/blog/b2b-website-conversion-checklist",
    "/blog/choosing-an-seo-agency",
    "/blog/custom-software-development-cost",
    "/blog/custom-software-vs-off-the-shelf",
    "/blog/ecommerce-development-cost",
    "/blog/google-ads-management-cost",
    "/blog/google-ads-not-generating-leads",
    "/blog/how-long-does-seo-take",
    "/blog/mvp-development-cost",
    "/blog/mvp-vs-prototype",
    "/blog/ppc-audit-checklist",
    "/blog/ppc-landing-page-checklist",
    "/blog/saas-development-cost",
    "/blog/sem-vs-seo-vs-ppc",
    "/blog/seo-audit-checklist",
    "/blog/seo-cost-india",
    "/blog/seo-for-small-business",
    "/blog/seo-vs-ppc",
    "/blog/software-development-project-checklist",
    "/blog/software-development-timeline",
    "/blog/website-development-cost-india",
    "/blog/website-redesign-checklist",
    "/blog/website-redesign-seo-migration",
    "/blog/wordpress-vs-custom-website",
    "/case-studies/example",
    "/local-seo",
    "/mobile-application-development",
    "/mvp-development",
    "/ppc-management-pricing",
    "/privacy-policy",
    "/react-development",
    "/saas-development",
    "/seo-packages",
    "/technical-seo",
    "/terms",
    "/thank-you"
  ],
  "completed_generations_without_saved_prompt": []
}
```
