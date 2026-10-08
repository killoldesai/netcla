import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { validateSns } from "../src/ses-newsletter";
import { boundedBody } from "../src/request-limits";
test("SNS signatures bind payload and configured topic, and reject external certificate URLs", async () => {
  const topic = "arn:aws:sns:us-east-1:123456789012:netofficials",
    keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const message = {
    Type: "Notification",
    MessageId: "test-message",
    Message: JSON.stringify({ eventType: "Bounce" }),
    Timestamp: new Date().toISOString(),
    TopicArn: topic,
    SignatureVersion: "2",
    Signature: "",
    SigningCertURL:
      "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-test.pem",
  };
  const canonical = ["Message", "MessageId", "Timestamp", "TopicArn", "Type"]
    .map((k) => k + "\n" + message[k as keyof typeof message] + "\n")
    .join("");
  message.Signature = sign(
    "RSA-SHA256",
    Buffer.from(canonical),
    keys.privateKey,
  ).toString("base64");
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      keys.publicKey.export({ type: "spki", format: "pem" }).toString(),
    );
  try {
    assert.equal((await validateSns(message, topic)).Message, message.Message);
    await assert.rejects(
      validateSns({ ...message, Message: "tampered" }, topic),
      /signature/,
    );
    await assert.rejects(
      validateSns(
        { ...message, SigningCertURL: "http://127.0.0.1/private" },
        topic,
      ),
      /certificate/,
    );
    await assert.rejects(
      validateSns(message, "arn:aws:sns:us-east-1:123456789012:other"),
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("request size guard checks actual bytes even without content-length", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: "a".repeat(4096),
  });
  await assert.rejects(boundedBody(request, 1024), /too large/);
});
