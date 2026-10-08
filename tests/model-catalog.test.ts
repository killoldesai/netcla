import test from "node:test";
import assert from "node:assert/strict";
import { BedrockClient } from "@aws-sdk/client-bedrock";
import { modelCatalog as rawCatalog } from "../src/model-catalog";
test("OpenRouter catalog filters text models and exposes output/context limits", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      data: [
        {
          id: "mock/text",
          name: "Text model",
          architecture: { output_modalities: ["text"] },
          context_length: 10000,
          top_provider: { max_completion_tokens: 2000 },
        },
        { id: "mock/image", architecture: { output_modalities: ["image"] } },
      ],
    });
  try {
    const result = await modelCatalog("openrouter");
    assert.equal(result.models.length, 1);
    assert.equal(result.models[0].outputLimit, 2000);
    assert.equal(result.models[0].context, 10000);
  } finally {
    globalThis.fetch = original;
  }
});
test("Bedrock catalog includes paginated active profiles and handles partial permission failures", async () => {
  const original = BedrockClient.prototype.send;
  process.env.AWS_REGION = "us-east-1";
  let calls = 0;
  (BedrockClient.prototype as any).send = async (cmd: any) => {
    if (cmd.constructor.name === "ListFoundationModelsCommand")
      throw new Error("Access denied");
    calls++;
    return calls === 1
      ? {
          inferenceProfileSummaries: [
            {
              inferenceProfileId: "us.mock",
              inferenceProfileName: "Mock",
              status: "ACTIVE",
            },
          ],
          nextToken: "page2",
        }
      : {
          inferenceProfileSummaries: [
            { inferenceProfileId: "disabled", status: "INACTIVE" },
            { inferenceProfileId: "us.mock", status: "ACTIVE" },
          ],
        };
  };
  try {
    const result = await modelCatalog("bedrock");
    assert.equal(calls, 2);
    assert.equal(result.models.length, 1);
    assert.equal(result.warnings.length, 1);
    assert.equal(result.models[0].id, "us.mock");
  } finally {
    BedrockClient.prototype.send = original;
  }
});
test("Catalog failures remain visible rather than substituting guessed models", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 503 });
  try {
    await assert.rejects(() => modelCatalog("openrouter"), /unavailable/);
  } finally {
    globalThis.fetch = original;
  }
});

function modelCatalog(provider: any) {
  return rawCatalog(provider, {
    provider: "bedrock",
    region: "us-east-1",
    accessKeyId: "MOCKACCESSKEY123456",
    secretAccessKey: "mock-secret-key-only-for-tests",
  });
}
