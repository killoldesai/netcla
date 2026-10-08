import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
let instance: Pool | undefined;
export function pool() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  if (instance) return instance;
  instance = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
  });
  instance.on("error", () => console.error("Database connection unavailable"));
  return instance;
}
export function db() {
  return drizzle(pool());
}
export async function query<T = Record<string, any>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return (await pool().query(sql, params)).rows;
}
export async function transaction<T>(fn: (c: PoolClient) => Promise<T>) {
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
