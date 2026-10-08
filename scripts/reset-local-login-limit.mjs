import { Pool } from 'pg';
import { createHmac } from 'node:crypto';
if (!['localhost', '127.0.0.1'].includes(new URL(process.env.SITE_URL).hostname)) {
  throw new Error('This helper is restricted to local development');
}
const key = 'login:' + createHmac('sha256', process.env.RATE_LIMIT_SECRET ?? process.env.SESSION_SECRET ?? 'development-only').update('untrusted').digest('hex');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  const result = await pool.query('DELETE FROM rate_limits WHERE key=$1', [key]);
  console.log('Local login rate limit cleared:', result.rowCount);
} finally {
  await pool.end();
}
