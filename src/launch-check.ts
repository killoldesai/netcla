/** Misconfigurations that would make a live site invisible to Google or point its signals at the wrong address. */
export function launchProblems(env: Record<string, string | undefined> = process.env): string[] {
  if (env.STAGING !== "false") return [];
  const problems: string[] = [];
  const site = env.SITE_URL?.trim() ?? "";
  if (!site) problems.push("SITE_URL is not set, so canonicals, the sitemap and structured data fall back to localhost.");
  else if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(site))
    problems.push(`SITE_URL is ${site}: canonicals and the sitemap would point at a local address.`);
  else if (!site.startsWith("https://")) problems.push(`SITE_URL is ${site}: it must be the https:// public origin.`);
  if (!env.GA4_ID) problems.push("GA4_ID is not set, so no analytics will run on the live site.");
  return problems;
}
