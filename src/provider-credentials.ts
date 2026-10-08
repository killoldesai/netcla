import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";
import { query } from "./db";
export const credentialsSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("openrouter"),
    apiKey: z.string().trim().min(10).max(2048),
  }),
  z.object({
    provider: z.literal("bedrock"),
    region: z
      .string()
      .trim()
      .regex(/^[a-z]{2}(?:-[a-z]+)+-\d+$/),
    accessKeyId: z.string().trim().min(16).max(128),
    secretAccessKey: z.string().trim().min(20).max(2048),
    sessionToken: z.string().trim().max(8192).optional(),
  }),
]);
export type ProviderCredentials = z.infer<typeof credentialsSchema>;
function encryptionKey() {
  const value = process.env.PROVIDER_ENCRYPTION_KEY ?? "";
  if (!/^[a-f\d]{64}$/i.test(value))
    throw new Error(
      "Provider credential encryption is not configured on this server",
    );
  return Buffer.from(value, "hex");
}
export function sealCredentials(value: ProviderCredentials) {
  return sealSecret(value.provider, value);
}
export function sealSecret(namespace: string, value: unknown) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(namespace));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return {
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}
export function openCredentials(
  provider: string,
  envelope: any,
): ProviderCredentials {
  return credentialsSchema.parse(openSecret(provider, envelope));
}
export function openSecret(provider: string, envelope: any): unknown {
  try {
    if (envelope.version !== 1) throw new Error();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(envelope.iv, "base64"),
    );
    decipher.setAAD(Buffer.from(provider));
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    return JSON.parse(
        Buffer.concat([
          decipher.update(Buffer.from(envelope.ciphertext, "base64")),
          decipher.final(),
        ]).toString("utf8"),
    );
  } catch {
    throw new Error(
      "Saved provider credentials cannot be decrypted; check the server encryption key",
    );
  }
}
export async function providerCredentials(provider: string) {
  const [row] = await query("SELECT value FROM settings WHERE key=$1", [
    "provider_credentials_" + provider,
  ]);
  if (!row)
    throw new Error(
      "Save " +
        (provider === "bedrock" ? "AWS Bedrock" : "OpenRouter") +
        " credentials in Admin Settings first",
    );
  return openCredentials(provider, row.value);
}
export async function saveProviderCredentials(input: unknown) {
  const value = credentialsSchema.parse(input);
  await query(
    "INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [
      "provider_credentials_" + value.provider,
      JSON.stringify(sealCredentials(value)),
    ],
  );
  await query("DELETE FROM settings WHERE key='ai_model_test'");
}
export async function credentialStatus() {
  const rows = await query(
    "SELECT key FROM settings WHERE key IN ('provider_credentials_bedrock','provider_credentials_openrouter')",
  );
  return {
    bedrock: rows.some((r) => r.key.endsWith("bedrock")),
    openrouter: rows.some((r) => r.key.endsWith("openrouter")),
  };
}
