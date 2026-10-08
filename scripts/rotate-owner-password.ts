import { query, transaction, pool } from "../src/db";
import { passwordHash } from "../src/auth";
if (!process.env.OWNER_PASSWORD || process.env.OWNER_PASSWORD.length < 14)
  throw new Error("Set OWNER_PASSWORD with at least 14 characters");
await transaction(async (c) => {
  await c.query("UPDATE owners SET password_hash=$1", [
    passwordHash(process.env.OWNER_PASSWORD!),
  ]);
  await c.query("DELETE FROM sessions");
});
await pool().end();
console.log("Owner password rotated; active sessions revoked.");
