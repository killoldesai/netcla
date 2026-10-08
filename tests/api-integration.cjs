const assert = require("node:assert/strict"),
  fs = require("fs"),
  { randomUUID } = require("node:crypto");
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
let cookie = "";
async function call(path, body) {
  return fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: base,
      ...(body ? { "Content-Type": "application/json" } : {}),
      Cookie: cookie,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
(async () => {
  assert.equal((await call("/api/admin")).status, 401);
  assert.equal((await call("/admin/preview/" + randomUUID())).status, 404);
  const login = await call("/api/auth/login", {
    email: "owner@example.test",
    password: "local-test-password-only",
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  let state = await (await call("/api/admin")).json();
  assert.ok(state.pages.length >= 54);
  const initialLeadCount = state.leads.length;
  const page = state.pages.find(
    (p) => p.path === "/custom-software-development",
  );
  assert.equal((await call(page.path)).status, 404);
  assert.equal((await call("/admin/preview/" + page.id)).status, 200);
  assert.equal(
    (await call("/api/admin", { action: "publish", id: page.id })).status,
    200,
  );
  const content = { ...page.content, unresolved: [] };
  assert.equal(
    (await call("/api/admin", { action: "save", id: page.id, content })).status,
    200,
  );
  assert.equal(
    (
      await call("/api/admin", {
        action: "brief",
        id: page.id,
        brief: { ...page.brief, evidenceApproved: false },
      })
    ).status,
    200,
  );
  const pub = await call("/api/admin", { action: "publish", id: page.id });
  assert.equal(pub.status, 200, await pub.text());
  assert.equal((await call(page.path)).status, 200);
  let live = await (await call(page.path)).text();
  assert.ok(live.includes(content.texts.t2));
  const draftMarker = "Unpublished replacement " + randomUUID();
  const changed = {
    ...content,
    texts: { ...content.texts, t2: draftMarker },
  };
  assert.equal(
    (
      await call("/api/admin", {
        action: "save",
        id: page.id,
        content: changed,
      })
    ).status,
    200,
  );
  live = await (await call(page.path)).text();
  assert.ok(!live.includes(draftMarker));
  state = await (await call("/api/admin")).json();
  const revised = state.pages.find((p) => p.id === page.id);
  assert.notEqual(revised.draft_revision_id, revised.published_revision_id);
  assert.equal(
    (
      await call("/api/admin", {
        action: "rollback",
        id: page.id,
        revisionId: revised.published_revision_id,
      })
    ).status,
    200,
  );
  const lead = {
    requestId: randomUUID(),
    name: "Test Buyer",
    email: "buyer@example.test",
    service: "Custom software",
    goal: "Build a customer portal",
    landingPage: page.path,
  };
  assert.equal(
    (await call("/api/leads", { ...lead, email: "invalid" })).status,
    422,
  );
  assert.equal((await call("/api/leads", lead)).status, 201);
  const duplicate = await call("/api/leads", lead);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);
  const blocked = await fetch(base + "/api/leads", {
    method: "POST",
    headers: {
      Origin: "https://invalid.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });
  assert.notEqual(blocked.status, 201);
  state = await (await call("/api/admin")).json();
  assert.equal(state.leads.length, initialLeadCount + 1);
  assert.equal(
    (
      await call("/api/admin", {
        action: "generate",
        ids: [page.id],
        provider: "openrouter",
        model: "test/missing",
      })
    ).status,
    200,
  );
  assert.equal(
    state.pages.find((p) => p.path === "/").published_revision_id,
    null,
  );
  assert.equal(
    (await call("/api/admin", { action: "unpublish", id: page.id })).status,
    200,
  );
  assert.equal((await call(page.path)).status, 404);
  const sql = await (await call("/api/admin?type=export")).text();
  assert.ok(sql.startsWith("-- Restore"));
  assert.ok(sql.includes("INSERT INTO revisions"));
  fs.writeFileSync(
    "tests/api-results.json",
    JSON.stringify(
      {
        status: "passed",
        checks: [
          "owner login",
          "private preview",
          "draft 404",
          "publish gates",
          "explicit publish",
          "regeneration isolation",
          "rollback",
          "enquiry validation",
          "deduplication",
          "origin rejection",
          "lead inbox",
          "queue creation",
          "unpublish",
          "SQL export",
        ],
      },
      null,
      2,
    ),
  );
  console.log("API integration checks passed");
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
