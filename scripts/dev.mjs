import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Keep generation available whenever the local website is running.
const cwd = fileURLToPath(new URL("../", import.meta.url));
let stopping = false;
let worker;
let restartTimer;
let failures = 0;
function startWorker() {
  if (stopping || !process.env.DATABASE_URL) return;
  console.log("Starting content writing worker…");
  const started = Date.now();
  worker = spawn(
    process.execPath,
    ["--env-file-if-exists=.env", "--import", "tsx", "src/worker.ts"],
    {
      cwd,
      stdio: "inherit",
      windowsHide: true,
      env: process.env,
    },
  );
  worker.on("error", (error) =>
    console.error("Unable to start writing worker:", error.message),
  );
  worker.on("close", () => {
    if (stopping) return;
    failures = Date.now() - started > 60000 ? 0 : failures + 1;
    const delay = Math.min(30000, 3000 * Math.max(1, failures));
    console.error(
      `Writing worker stopped; restarting in ${delay / 1000} seconds.`,
    );
    restartTimer = setTimeout(startWorker, delay);
  });
}
const web = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--port", "3010"],
  {
    cwd,
    stdio: "inherit",
    windowsHide: true,
    env: process.env,
  },
);
function stop() {
  if (stopping) return;
  stopping = true;
  clearTimeout(restartTimer);
  worker?.kill();
  web.kill();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
web.on("error", (error) => {
  console.error("Unable to start website:", error.message);
  stop();
  process.exitCode = 1;
});
web.on("close", (code) => {
  stop();
  process.exitCode = code ?? 0;
});
startWorker();
