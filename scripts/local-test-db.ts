import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { passwordHash } from "../src/auth";
const db = await PGlite.create();
for (const file of fs
  .readdirSync("db")
  .filter((f) => f.endsWith(".sql"))
  .sort())
  await db.exec(
    fs
      .readFileSync("db/" + file, "utf8")
      .replace("CREATE EXTENSION IF NOT EXISTS pgcrypto;", ""),
  );
await db.query("INSERT INTO owners(email,password_hash) VALUES($1,$2)", [
  "owner@example.test",
  passwordHash("local-test-password-only"),
]);
const server = new PGLiteSocketServer({
  db,
  host: "127.0.0.1",
  maxConnections: 20,
  port: Number(process.env.TEST_DATABASE_PORT ?? 5439),
});
await server.start();
console.log(
  "Disposable local test database ready on port " +
    (process.env.TEST_DATABASE_PORT ?? 5439),
);
process.on("SIGINT", async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
