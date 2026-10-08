export type PlanStatus =
  | "empty"
  | "manual"
  | "queued"
  | "running"
  | "failed"
  | "fixes"
  | "review"
  | "reviewed"
  | "published";
export const statusLabels: Record<PlanStatus, string> = {
  empty: "Awaiting generation",
  manual: "Manual content needed",
  queued: "Queued",
  running: "Generating",
  failed: "Generation failed",
  fixes: "Needs fixes",
  review: "Needs review",
  reviewed: "Content reviewed",
  published: "Published",
};
export function planStatus(page: any, job?: any): PlanStatus {
  if (
    page.published_revision_id &&
    page.published_revision_id === page.draft_revision_id
  )
    return "published";
  if (job?.status === "queued" || job?.status === "running") return job.status;
  // A newer saved revision supersedes an earlier failed generation attempt.
  if (
    job?.status === "failed" &&
    job.base_revision_id === page.draft_revision_id
  )
    return "failed";
  const hasContent =
    page.content?.schemaVersion === 2
      ? !!page.content?.hero?.body?.trim()
      : !!page.content &&
        Object.values(page.content.texts ?? {}).some((v: any) => v.trim());
  if (!hasContent) return page.brief.generationAllowed ? "empty" : "manual";
  if ((page.validation?.errors ?? []).length) return "fixes";
  return "review";
}
export function fileGroups(pages: any[], jobs: any[] = []) {
  const latest = new Map(jobs.map((j) => [j.page_id, j]));
  const groups = new Map<string, any[]>();
  for (const p of pages) {
    for (const file of new Set<string>(
      (p.brief.provenance ?? []).map((s: any) => s.file),
    )) {
      groups.set(file, [...(groups.get(file) ?? []), p]);
    }
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([file, entries]) => ({
      file,
      label: file
        .replace(/^\d+_/, "")
        .replace(/_v\d+(?=\.csv$)/, "")
        .replace(/\.csv$/, "")
        .replaceAll("_", " "),
      pages: entries,
      total: entries.length,
      counts: entries.reduce(
        (a, p) => {
          const s = planStatus(p, latest.get(p.id));
          a[s] = (a[s] ?? 0) + 1;
          return a;
        },
        {} as Record<PlanStatus, number>,
      ),
      designPending: entries.filter(
        (p) =>
          p.designReady === false ||
          (p.designReady === undefined && p.template === "site-plan"),
      ).length,
    }));
}
