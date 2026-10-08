import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import { query } from "./db";
import { openSecret, sealSecret } from "./provider-credentials";

export const s3Regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1",
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-north-1",
  "ap-south-1", "ap-south-2", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
  "ap-northeast-2", "me-central-1", "sa-east-1",
] as const;

export const storageSettingsSchema = z.object({
  provider: z.enum(["local", "s3"]),
  bucket: z.string().trim().regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/, "Enter a valid S3 bucket name").optional(),
  region: z.enum(s3Regions).optional(),
  prefix: z.string().trim().regex(/^[a-zA-Z0-9/_-]*$/).max(100).default("netofficials/"),
  accessKeyId: z.string().trim().regex(/^[A-Z0-9]{16,128}$/, "Enter a valid access key ID").optional(),
  secretAccessKey: z.string().trim().min(20).max(200).optional(),
  // Optional CDN or bucket website origin; when set, published images are linked there directly.
  publicBaseUrl: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith("https://"), "Use an https:// URL")
    .optional()
    .or(z.literal("")),
});
export type StorageSettings = z.infer<typeof storageSettingsSchema>;

const local = () => path.resolve(process.env.PERSISTENT_ASSET_DIR ?? ".data/assets");

export async function storageSettings(): Promise<StorageSettings> {
  const [row] = await query("SELECT value FROM settings WHERE key='asset_storage'");
  if (!row) return { provider: "local", prefix: "netofficials/" };
  const value = row.value as any;
  return {
    ...value,
    secretAccessKey: value.secret ? (openSecret("asset_storage", value.secret) as string) : undefined,
    secret: undefined,
  };
}

/** Owner-safe view: never returns the secret. */
export async function storageStatus() {
  const s = await storageSettings();
  return {
    provider: s.provider,
    bucket: s.bucket ?? "",
    region: s.region ?? "",
    prefix: s.prefix ?? "",
    accessKeyId: s.accessKeyId ? s.accessKeyId.slice(0, 4) + "…" + s.accessKeyId.slice(-4) : "",
    hasSecret: !!s.secretAccessKey,
    publicBaseUrl: s.publicBaseUrl ?? "",
  };
}

function client(s: StorageSettings) {
  if (!s.bucket || !s.region || !s.accessKeyId || !s.secretAccessKey)
    throw new Error("Complete the bucket, region, access key and secret first");
  return new S3Client({
    region: s.region,
    credentials: { accessKeyId: s.accessKeyId, secretAccessKey: s.secretAccessKey },
    maxAttempts: 2,
  });
}

/** Checks bucket access and write/read/delete permission with a small probe object. */
export async function testStorage(input: StorageSettings) {
  const s3 = client(input);
  await s3.send(new HeadBucketCommand({ Bucket: input.bucket! }));
  const key = `${input.prefix ?? ""}.connection-test-${Date.now()}.txt`;
  await s3.send(new PutObjectCommand({ Bucket: input.bucket!, Key: key, Body: "netofficials", ContentType: "text/plain" }));
  const read = await s3.send(new GetObjectCommand({ Bucket: input.bucket!, Key: key }));
  const body = await read.Body?.transformToString();
  await s3.send(new DeleteObjectCommand({ Bucket: input.bucket!, Key: key }));
  if (body !== "netofficials") throw new Error("Bucket read-back did not match");
  return { ok: true, message: `Connected to s3://${input.bucket} in ${input.region}. Write, read and delete succeeded.` };
}

/** Save settings; a blank secret keeps the stored one. Switching to S3 requires a passing test. */
export async function saveStorageSettings(input: unknown) {
  const next = storageSettingsSchema.parse(input);
  const current = await storageSettings();
  const merged: StorageSettings = {
    ...next,
    secretAccessKey: next.secretAccessKey || current.secretAccessKey,
  };
  if (merged.provider === "s3") await testStorage(merged);
  const { secretAccessKey, ...rest } = merged;
  await query(
    "INSERT INTO settings(key,value) VALUES('asset_storage',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [JSON.stringify({ ...rest, secret: secretAccessKey ? sealSecret("asset_storage", secretAccessKey) : undefined })],
  );
  return storageStatus();
}

/** Store a file under the active backend. Returns where it went. */
export async function storeFile(filename: string, bytes: Buffer, contentType: string, meta: Record<string, string> = {}) {
  const s = await storageSettings();
  if (s.provider === "s3") {
    const key = (s.prefix ?? "") + filename;
    await client(s).send(
      new PutObjectCommand({
        Bucket: s.bucket!,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: meta,
      }),
    );
    return { storage: "s3" as const, key };
  }
  await mkdir(local(), { recursive: true });
  await writeFile(path.join(local(), filename), bytes, { flag: "wx" }).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "EEXIST") throw e;
  });
  return { storage: "local" as const, key: filename };
}

/** Read a stored file, from S3 when it was stored there. */
export async function readStoredFile(asset: { filename: string; storage?: string | null; storage_key?: string | null }) {
  if (!/^[a-f0-9]{64}\.(png|webp|svg)$/.test(asset.filename)) throw new Error("Invalid asset filename");
  if (asset.storage === "s3") {
    const s = await storageSettings();
    const out = await client(s).send(new GetObjectCommand({ Bucket: s.bucket!, Key: asset.storage_key ?? (s.prefix ?? "") + asset.filename }));
    return Buffer.from(await out.Body!.transformToByteArray());
  }
  return readFile(path.join(local(), asset.filename));
}

/** Public URL for a published image when a CDN/bucket origin is configured. */
export async function publicAssetUrl(asset: { storage?: string | null; storage_key?: string | null }) {
  if (asset.storage !== "s3" || !asset.storage_key) return undefined;
  const s = await storageSettings();
  return s.publicBaseUrl ? s.publicBaseUrl.replace(/\/$/, "") + "/" + asset.storage_key : undefined;
}

/** EXIF/XMP written into every WebP: author, copyright and description for image search. */
export function imageExif(alt: string) {
  return {
    IFD0: {
      Artist: "Netofficials",
      Copyright: `© ${new Date().getFullYear()} Netofficials`,
      ImageDescription: alt.slice(0, 250),
      Software: "Netofficials",
    },
  };
}
