import test from "node:test";
import assert from "node:assert/strict";
import { generate as rawGenerate } from "../src/providers";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
test("OpenRouter pins the chosen model, validates availability and records usage", async () => {
  const original = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = "mock-only";
  let request: any;
  globalThis.fetch = async (_url, options) => {
    if (!options?.body)
      return Response.json({
        data: [
          {
            id: "test/model",
            context_length: 10000,
            top_provider: { max_completion_tokens: 2000 },
            supported_parameters: ["response_format"],
          },
        ],
      });
    request = JSON.parse(options.body as string);
    return Response.json({
      choices: [{ finish_reason: "stop", message: { content: '{"ok":true}' } }],
      usage: { total_tokens: 10 },
    });
  };
  try {
    const r = await generate("openrouter", "test/model", "Return JSON", 100);
    assert.equal(r.text, '{"ok":true}');
    assert.equal(request.model, "test/model");
    assert.equal(request.provider.allow_fallbacks, false);
    assert.equal(request.response_format.type, "json_object");
    assert.equal((r.usage as any).total_tokens, 10);
    await assert.rejects(
      () => generate("openrouter", "not-available", "Test", 100),
      /unavailable/,
    );
  } finally {
    globalThis.fetch = original;
    delete process.env.OPENROUTER_API_KEY;
  }
});
test("Truncated output and provider timeouts fail without a fallback request", async () => {
  const original = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = "mock-only";
  globalThis.fetch = async (_url, options) =>
    !options?.body
      ? Response.json({ data: [{ id: "test/model" }] })
      : Response.json({
          choices: [{ finish_reason: "length", message: { content: "{}" } }],
        });
  try {
    await assert.rejects(
      () => generate("openrouter", "test/model", "Test", 100),
      /truncated/,
    );
    globalThis.fetch = async () => {
      throw new Error("timeout");
    };
    await assert.rejects(
      () => generate("openrouter", "test/model", "Test", 100),
      /timeout/,
    );
  } finally {
    globalThis.fetch = original;
    delete process.env.OPENROUTER_API_KEY;
  }
});
test("Bedrock uses Converse and returns structured text and usage", async () => {
  const original = BedrockRuntimeClient.prototype.send;
  process.env.AWS_REGION = "us-east-1";
  let input: any;
  (BedrockRuntimeClient.prototype.send as any) = async (command: any) => {
    input = command.input;
    return {
      stopReason: "end_turn",
      output: { message: { content: [{ text: '{"ok":true}' }] } },
      usage: { inputTokens: 8, outputTokens: 4 },
    };
  };
  try {
    const r = await generate("bedrock", "test-model", "Return JSON", 100);
    assert.equal(input.modelId, "test-model");
    assert.equal(input.inferenceConfig.maxTokens, 100);
    assert.equal(r.text, '{"ok":true}');
    (BedrockRuntimeClient.prototype.send as any) = async () => ({
      stopReason: "max_tokens",
    });
    await assert.rejects(
      () => generate("bedrock", "test-model", "Return JSON", 100),
      /truncated/,
    );
  } finally {
    BedrockRuntimeClient.prototype.send = original;
  }
});

function generate(
  provider: any,
  model: string,
  prompt: string,
  tokens: number,
) {
  return rawGenerate(
    provider,
    model,
    prompt,
    tokens,
    provider === "openrouter"
      ? { provider, apiKey: "mock-only-key" }
      : {
          provider,
          region: "us-east-1",
          accessKeyId: "MOCKACCESSKEY123456",
          secretAccessKey: "mock-secret-key-only-for-tests",
        },
  );
}
