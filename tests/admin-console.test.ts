import test from "node:test";
import assert from "node:assert/strict";
import { adminReturn,legacyAdminReturn } from "../src/admin-return";
import { listSchema } from "../src/admin-console-data";
test("admin return destinations remain local and avoid login loops", () => {
  assert.equal(
    adminReturn("/admin/pages/abc?view=seo"),
    "/admin/pages/abc?view=seo",
  );
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/admin/login?next=/admin",
    "/admin\\evil",
    "/admin\n/evil",
  ])
    assert.equal(adminReturn(path), "/admin");
  assert.equal(adminReturn(null), "/admin");
  assert.equal(legacyAdminReturn('#content?page=b7b60dd4-b351-4775-b506-eae1bbc06d32'),'/admin/pages/b7b60dd4-b351-4775-b506-eae1bbc06d32');
  assert.equal(legacyAdminReturn('#publishing'),'/admin/production');
});
test("inventory inputs bound pagination and allowlist sorting", () => {
  assert.equal(listSchema.parse({}).size, 25);
  assert.throws(() => listSchema.parse({ page: -1 }));
  assert.throws(() => listSchema.parse({ size: 1000 }));
  assert.throws(() => listSchema.parse({ sort: "title; DROP TABLE pages" }));
});
