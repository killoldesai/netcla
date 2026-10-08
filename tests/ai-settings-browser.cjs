const assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    let saved,
      tests = 0,
      credentialWrites = 0;
    await p.goto(process.env.SITE_URL + "/admin/login");
    await p.locator("[name=email]").fill(process.env.OWNER_EMAIL);
    await p.locator("[name=password]").fill(process.env.OWNER_PASSWORD);
    await p.getByRole("button", { name: "Sign in", exact: true }).click();
    await p.waitForURL("**/admin");
    await p.route("**/api/admin*", async (route) => {
      const req = route.request(),
        url = new URL(req.url());
      if (url.searchParams.get("type") === "ai-models")
        return route.fulfill({
          json: {
            models: [
              { id: "mock/text", name: "Mock writing model", kind: "Model" },
            ],
            warnings: [],
          },
        });
      if (req.method() === "POST") {
        const body = req.postDataJSON();
        if (body.action === "test-provider") {
          tests++;
          if (tests === 1)
            return route.fulfill({
              status: 400,
              json: { error: "Mock model access denied" },
            });
          return route.fulfill({
            json: {
              ok: true,
              test: {
                provider: body.provider,
                model: body.model,
                testedAt: new Date().toISOString(),
                elapsedMs: 123,
              },
            },
          });
        }
        if (body.action === "provider-credentials") {
          credentialWrites++;
          assert.ok(body.value.provider);
          return route.fulfill({ json: { ok: true } });
        }
        if (body.action === "settings") {
          saved = body.value;
          return route.fulfill({ json: { ok: true } });
        }
        throw new Error("Unexpected mutation " + body.action);
      }
      const response = await route.fetch(),
        data = await response.json();
      data.configured = { openrouter: true, bedrock: true };
      data.settings = data.settings.filter((s) => s.key !== "ai");
      if (saved) data.settings.push({ key: "ai", value: saved });
      return route.fulfill({ json: data });
    });
    await p
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("button", { name: "Settings", exact: true })
      .click();
    // Refresh mocked configuration through the normal Save callback after first initialization is not needed: switch to the configured Bedrock provider for test-button availability if the initial OpenRouter key is absent.
    await p.locator('select[aria-label="AI provider"]').selectOption("bedrock");
    await p
      .getByLabel("AWS access key ID", { exact: true })
      .fill("MOCKACCESSKEY123456");
    await p
      .getByLabel("AWS secret access key", { exact: true })
      .fill("mock-secret-key-only-for-tests");
    await p
      .getByRole("button", { name: /Save credentials|Replace credentials/ })
      .click();
    await p
      .getByText(
        "Credentials saved securely. Load models and test your selection below.",
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await p.getByLabel("AWS secret access key", { exact: true }).inputValue(),
      "",
    );
    await p
      .getByRole("button", { name: "Load available models", exact: true })
      .click();
    await p.getByLabel("Available models").selectOption("mock/text");
    await p
      .getByRole("button", { name: "Test selected model", exact: true })
      .click();
    await p
      .getByRole("alert")
      .filter({ hasText: "Mock model access denied" })
      .waitFor();
    assert.equal(saved, undefined);
    await p
      .getByRole("button", { name: "Test selected model", exact: true })
      .click();
    await p
      .getByText("Selected model tested successfully", { exact: true })
      .waitFor();
    await p
      .getByRole("button", { name: "Save for content generation", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Saved for content generation",
        exact: true,
      })
      .waitFor();
    assert.deepEqual(saved, { provider: "bedrock", model: "mock/text" });
    await p
      .locator('select[aria-label="AI provider"]')
      .selectOption("openrouter");
    await p
      .getByText("Selected model has not passed a test", { exact: true })
      .waitFor();
    assert.equal(credentialWrites, 1);
    console.log(
      "Credentials and model selection, failed/successful tests, saving and changed-selection feedback passed. Provider calls and settings writes were mocked.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
