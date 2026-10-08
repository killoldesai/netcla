import { query, pool } from "../src/db";
import { passwordHash } from "../src/auth";
if (
  !process.env.OWNER_EMAIL ||
  !process.env.OWNER_PASSWORD ||
  process.env.OWNER_PASSWORD.length < 14
)
  throw new Error(
    "Set OWNER_EMAIL and OWNER_PASSWORD (at least 14 characters)",
  );
if ((await query("SELECT id FROM owners")).length)
  throw new Error("Owner already exists; use documented password rotation");
await query("INSERT INTO owners(email,password_hash) VALUES($1,$2)", [
  process.env.OWNER_EMAIL.toLowerCase().trim(),
  passwordHash(process.env.OWNER_PASSWORD),
]);
await pool().end();
console.log("Owner created");
