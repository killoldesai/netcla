import test from "node:test";
import assert from "node:assert/strict";
import { fileGroups, planStatus } from "../src/site-plan-status";
import { readSitePlan, emptyPlanContent, planBrief } from "../src/site-plan";
test("File category counts include merged references while global URLs remain unique", () => {
  const pages = readSitePlan().entries.map((e, i) => ({
    id: String(i),
    brief: planBrief(e),
    content: emptyPlanContent(e),
    template: "site-plan",
  }));
  const groups = fileGroups(pages);
  assert.equal(groups.length, 13);
  assert.equal(
    groups.reduce((n, g) => n + g.total, 0),
    154,
  );
  assert.equal(pages.length, 151);
  assert.equal(groups.find((g) => g.file.startsWith("07_"))?.total, 32);
  assert.equal(groups.find((g) => g.file.startsWith("01_"))?.counts.manual, 2);
});
test("Progress separates failed jobs, empty drafts, review issues and published drafts", () => {
  const p: any = {
    id: "a",
    draft_revision_id: "draft",
    brief: { generationAllowed: true },
    content: { schemaVersion: 2, hero: { body: "" } },
    validation: { errors: [] },
  };
  assert.equal(planStatus(p), "empty");
  assert.equal(planStatus(p, { status: "queued" }), "queued");
  assert.equal(
    planStatus(p, { status: "failed", base_revision_id: "draft" }),
    "failed",
  );
  assert.equal(
    planStatus(p, { status: "failed", base_revision_id: "older" }),
    "empty",
  );
  p.content.hero.body = "Complete answer";
  assert.equal(planStatus(p), "review");
  p.validation.errors = ["Comparison table columns do not match"];
  assert.equal(planStatus(p), "fixes");
  p.validation.errors = [];
  p.brief.evidenceApproved = true;
  assert.equal(planStatus(p), "review");
  p.published_revision_id = "draft";
  assert.equal(planStatus(p), "published");
  assert.equal(
    planStatus(p, { status: "failed", base_revision_id: "draft" }),
    "published",
  );
  p.draft_revision_id = "new-draft";
  p.brief.evidenceApproved = false;
  assert.equal(planStatus(p), "review");
});
