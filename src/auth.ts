import { cookies } from "next/headers";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHmac,
} from "node:crypto";
import { query } from "./db";
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function passwordMatches(password: string, value: string) {
  try {
    const [salt, key] = value.split(":");
    return timingSafeEqual(
      Buffer.from(key, "hex"),
      scryptSync(password, salt, 64),
    );
  } catch {
    return false;
  }
}
export async function owner() {
  const token = (await cookies()).get("netofficials_session")?.value;
  if (!token) return null;
  const [row] = await query<{ id: string; email: string }>(
    "SELECT o.id,o.email FROM sessions s JOIN owners o ON o.id=s.owner_id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [hash(token)],
  );
  return row ?? null;
}
export async function requireOwner() {
  const o = await owner();
  if (!o) throw new Error("Unauthorized");
  return o;
}
export function assertOrigin(request: Request) {
  const expected = new URL(process.env.SITE_URL ?? "http://localhost:3000")
    .origin;
  if (request.headers.get("origin") !== expected)
    throw new Error("Invalid origin");
}
export function clientKey(request: Request) {
  if (
    process.env.NODE_ENV === "production" &&
    !(process.env.RATE_LIMIT_SECRET ?? process.env.SESSION_SECRET)
  )
    throw new Error("Rate limit secret is required");
  const ip =
    process.env.TRUST_PROXY === "true"
      ? (request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
        "unknown")
      : "untrusted";
  return createHmac(
    "sha256",
    process.env.RATE_LIMIT_SECRET ??
      process.env.SESSION_SECRET ??
      "development-only",
  )
    .update(ip)
    .digest("hex");
}
export async function limit(key: string, max: number, seconds: number) {
  const [row] = await query<{ count: number }>(
    `INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END,expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+$2*interval '1 second' ELSE rate_limits.expires_at END RETURNING count`,
    [key, seconds],
  );
  return row.count <= max;
}
