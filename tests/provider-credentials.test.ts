import test from "node:test";
import assert from "node:assert/strict";
import {
  sealCredentials,
  openCredentials,
  credentialsSchema,
} from "../src/provider-credentials";
test("Provider credentials are encrypted, randomized and authenticated", () => {
  process.env.PROVIDER_ENCRYPTION_KEY = "ab".repeat(32);
  const input = credentialsSchema.parse({
    provider: "openrouter",
    apiKey: "test-secret-never-expose",
  });
  const envelope = sealCredentials(input);
  assert.ok(!JSON.stringify(envelope).includes("test-secret-never-expose"));
  assert.notEqual(envelope.ciphertext, sealCredentials(input).ciphertext);
  assert.deepEqual(openCredentials("openrouter", envelope), input);
  assert.throws(
    () => openCredentials("bedrock", envelope),
    /cannot be decrypted/,
  );
  assert.throws(
    () =>
      openCredentials("openrouter", {
        ...envelope,
        tag: Buffer.alloc(16).toString("base64"),
      }),
    /cannot be decrypted/,
  );
  process.env.PROVIDER_ENCRYPTION_KEY = "cd".repeat(32);
  assert.throws(
    () => openCredentials("openrouter", envelope),
    /cannot be decrypted/,
  );
  delete process.env.PROVIDER_ENCRYPTION_KEY;
  assert.throws(() => sealCredentials(input), /encryption is not configured/);
});
test("AWS keys and region require valid structured input", () => {
  assert.equal(
    credentialsSchema.safeParse({
      provider: "bedrock",
      region: "invalid",
      accessKeyId: "short",
      secretAccessKey: "short",
    }).success,
    false,
  );
});
