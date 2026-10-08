import { query, pool } from "../src/db";
const [r] = await query<{ ok: boolean }>(
  "SELECT (value #>> '{}')::timestamptz>now()-interval '30 seconds' AS ok FROM settings WHERE key='worker_heartbeat'",
);
await pool().end();
if (!r?.ok) process.exit(1);
