const { chromium } = require("@playwright/test");
const { build } = require("esbuild");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const bundle = await build({
    stdin: {
      contents:
        'import React from "react";import {createRoot} from "react-dom/client";import Page from "./app/admin/login/page";createRoot(document.getElementById("root")).render(<Page/>);',
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    let mode = "invalid",
      requests = 0;
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const css =
      fs.readFileSync("app/globals.css", "utf8").replace(/^@import.*$/gm, "") +
      "\n" +
      fs.readFileSync("app/admin.css", "utf8");
    await page.route("http://admin.test/**", async (route) => {
      const req = route.request(),
        path = new URL(req.url()).pathname;
      if (path === "/api/auth/login") {
        requests++;
        assert.deepEqual(Object.keys(req.postDataJSON()).sort(), [
          "email",
          "password",
        ]);
        if (mode === "network") return route.abort();
        if (mode === "success") return route.fulfill({ json: { ok: true } });
        if (mode === "slow") {
          await new Promise((r) => setTimeout(r, 500));
          return route.fulfill({
            status: 401,
            json: { error: "Invalid credentials" },
          });
        }
        return route.fulfill({
          status: mode === "rate" ? 429 : 401,
          json: {
            error: mode === "rate" ? "Try again later" : "Invalid credentials",
          },
        });
      }
      if (path === "/admin")
        return route.fulfill({
          contentType: "text/html",
          body: "<h1>Dashboard</h1>",
        });
      if (path === "/assets/logo.png")
        return route.fulfill({
          contentType: "image/png",
          body: fs.readFileSync("public/assets/logo.png"),
        });
      if (path.startsWith("/assets/"))
        return route.fulfill({ status: 404, body: "" });
      return route.fulfill({
        contentType: "text/html",
        body: `<title>Sign in | Netofficials Admin</title><style>${css}</style><div id="root"></div><script>${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script>`,
      });
    });
    await page.goto("http://admin.test/admin/login");
    await page
      .getByRole("heading", { name: "Sign in to admin", exact: true })
      .waitFor();
    await page.screenshot({ path: "admin-login-preview.png", fullPage: true });
    await page
      .getByLabel("Email address", { exact: true })
      .fill("owner@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("test-password-only");
    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("Password", { exact: true }).getAttribute("type"),
      "text",
    );
    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("Password", { exact: true }).getAttribute("type"),
      "password",
    );
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "The email or password is incorrect." })
      .waitFor();
    assert.equal(
      await page
        .getByLabel("Email address", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    mode = "rate";
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Too many sign-in attempts" })
      .waitFor();
    mode = "network";
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Unable to connect" })
      .waitFor();
    mode = "slow";
    const before = requests;
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Signing in…", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(
      await page.getByLabel("Email address", { exact: true }).isDisabled(),
      true,
    );
    await page
      .getByRole("alert")
      .filter({ hasText: "The email or password is incorrect." })
      .waitFor();
    assert.equal(requests, before + 1);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: "admin-login-mobile-preview.png",
      fullPage: true,
    });
    mode = "success";
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("http://admin.test/admin#content");
    assert.deepEqual(errors, []);
    console.log(
      "Login labels, password visibility, invalid credentials, rate limiting, network failure, loading state, mobile layout, and success redirect passed.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
