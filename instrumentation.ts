export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { launchProblems } = await import("./src/launch-check");
  for (const problem of launchProblems()) console.error(`[launch-check] ${problem}`);
}
