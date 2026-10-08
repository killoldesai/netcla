const assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const p = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await p.goto(process.env.SITE_URL + "/admin/login");
    await p.locator("[name=email]").fill(process.env.OWNER_EMAIL);
    await p.locator("[name=password]").fill(process.env.OWNER_PASSWORD);
    await p.getByRole("button", { name: "Sign in", exact: true }).click();
    await p.waitForURL("**/admin");
    const data = await p.evaluate(async () =>
      (await fetch("/api/admin")).json(),
    );
    const page = data.pages.find(
      (p) =>
        !p.archived_at &&
        p.content?.schemaVersion === 2 &&
        p.brief.generationAllowed,
    );
    assert.ok(page);
    data.settings = data.settings.filter((s) => s.key !== "ai");
    data.settings.push({
      key: "ai",
      value: { provider: "openrouter", model: "mock/model" },
    });
    data.jobs = [];
    let polls = 0,
      requests = 0;
    await p.route("**/api/admin*", async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (request.method() === "POST") {
        const body = request.postDataJSON();
        assert.equal(body.action, "generate");
        requests++;
        polls = 0;
        data.jobs = [
          {
            id: require("crypto").randomUUID(),
            page_id: page.id,
            status: "queued",
            stage: "queued",
            progress: 0,
            attempts: 0,
            model: "mock/model",
          },
        ];
        return route.fulfill({
          json: { ok: true, message: "Generation queued" },
        });
      }
      if (url.searchParams.get("type") === "generation-status") {
        polls++;
        Object.assign(
          data.jobs[0],
          polls === 1
            ? {
                status: "running",
                stage: "generating",
                progress: 35,
                attempts: 1,
              }
            : {
                status: "completed",
                stage: "completed",
                progress: 100,
                result_revision_id: require("crypto").randomUUID(),
              },
        );
        if (polls === 2) {
          page.draft_revision_id = data.jobs[0].result_revision_id;
          page.content = {
            ...page.content,
            hero: {
              ...page.content.hero,
              heading: "Automatically saved generation " + requests,
            },
          };
          data.revisions.unshift({
            id: page.draft_revision_id,
            page_id: page.id,
            origin: "ai:openrouter",
            created_at: new Date().toISOString(),
          });
        }
        return route.fulfill({
          json: { jobs: data.jobs, workerHeartbeat: new Date().toISOString() },
        });
      }
      return route.fulfill({
        json: { ...data, workerHeartbeat: new Date().toISOString() },
      });
    });
    await p.reload();
    await p
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("button", { name: "Content", exact: true })
      .click();
    await p
      .getByRole("row")
      .filter({ has: p.getByText(page.path, { exact: true }) })
      .getByRole("button")
      .click();
    const generate = p.getByRole("button", {
      name: "Generate page draft",
      exact: true,
    });
    await generate.click();
    await p
      .getByRole("progressbar", { name: "Content generation progress" })
      .waitFor();
    await p.getByText("AI is writing your content", { exact: true }).waitFor();
    assert.equal(await p.getByRole("progressbar").getAttribute("value"), "35");
    await p
      .getByRole("heading", {
        name: "Automatically saved generation 1",
        exact: true,
      })
      .waitFor();
    await p.getByText("New draft revision saved", { exact: true }).waitFor();
    await generate.click();
    await p.getByText("AI is writing your content", { exact: true }).waitFor();
    await p.getByRole("button", { name: "SEO", exact: true }).click();
    await p
      .getByLabel(/Search title/)
      .fill("Owner edits while generation runs");
    await p
      .getByText(
        "The new version is saved in History. Your unsaved edits have been kept.",
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await p.getByLabel(/Search title/).inputValue(),
      "Owner edits while generation runs",
    );
    console.log(
      "Live progress, automatic saved-draft loading and preservation of unsaved edits passed; generation and writes were mocked.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
