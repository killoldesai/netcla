"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { pillars, sitePage } from "../site-structure";
import { Drawer, Empty, GenerationForm, Panel, useAdminData } from "../admin-console";

type Row = {
  id: string;
  path: string;
  title: string;
  published: boolean;
  version: string;
  qa: number | null;
  review_status: string;
  run_status: string | null;
  has_spec: boolean;
};
type Stage = "Planned" | "Generating" | "Needs review" | "Ready" | "Published";
// Filters: draft stages plus "Live" (has a published version, whatever the draft state).
type Filter = Stage | "Live" | "All";

export function pageStage(row: Row): Stage {
  if (row.run_status === "queued" || row.run_status === "running") return "Generating";
  if (row.version === "3" && row.published && row.review_status === "accepted") return "Published";
  if (row.version === "3" && row.review_status === "accepted") return "Ready";
  if (row.version === "3") return "Needs review";
  return row.published ? "Published" : "Planned";
}
const lozenge: Record<Stage, string> = {
  Planned: "uc-loz-todo",
  Generating: "uc-loz-progress",
  "Needs review": "uc-loz-review",
  Ready: "uc-loz-done",
  Published: "uc-loz-done",
};

/** Every page grouped by pillar, with progress and bulk generation. */
export function SiteMap({
  action,
  busy,
}: {
  action: (path: string, body: unknown, success?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const { data, error, refresh } = useAdminData("sitemap", "", 15000);
  const settings = useAdminData("settings", "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [generate, setGenerate] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");

  const groups = useMemo(() => {
    const rows: Row[] = data?.pages ?? [];
    const byPillar = new Map<string, Row[]>();
    for (const row of rows) {
      const key = sitePage(row.path)?.pillar ?? (row.path.startsWith("/blog") ? "guides" : "other");
      byPillar.set(key, [...(byPillar.get(key) ?? []), row]);
    }
    return [
      ...pillars.map((p) => ({ id: p.id as string, label: p.label, rows: byPillar.get(p.id) ?? [] })),
      { id: "guides", label: "Guides", rows: byPillar.get("guides") ?? [] },
      { id: "other", label: "Company, locations & other", rows: byPillar.get("other") ?? [] },
    ].filter((g) => g.rows.length);
  }, [data]);

  if (error) return <Empty title="Site map unavailable" body={error} />;
  if (!data) return <p className="uc-loading">Loading site map…</p>;
  const all: Row[] = data.pages;
  const matches = (r: Row, f: Filter) => f === "All" || (f === "Live" ? r.published : pageStage(r) === f);
  const count = (f: Filter) => all.filter((r) => matches(r, f)).length;
  const generatable = [...selected].filter((p) => all.find((r) => r.path === p)?.has_spec);
  const toggle = (paths: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      paths.forEach((p) => (on ? next.add(p) : next.delete(p)));
      return next;
    });

  return (
    <div className="uc-sitemap">
      <div className="uc-summary-strip">
        {(["Planned", "Generating", "Needs review", "Ready", "Live"] as Filter[]).map((stage) => (
          <button
            key={stage}
            className={filter === stage ? "is-active" : ""}
            onClick={() => setFilter(filter === stage ? "All" : stage)}
          >
            <strong>{count(stage)}</strong>
            <span>{stage}</span>
          </button>
        ))}
      </div>
      <div className="uc-bulkbar" aria-live="polite">
        <span>{selected.size ? `${selected.size} selected` : "Select pages to generate them in bulk"}</span>
        {!selected.size && count("Needs review") > 0 && (
          <button
            className="uc-primary"
            disabled={busy}
            title="Publishes every new draft that passes all quality checks and accepts its images. Failing drafts stay as drafts."
            onClick={async () => {
              if (!confirm("Publish every new draft that passes all quality checks? Their generated images are accepted. Failing drafts stay as drafts.")) return;
              if (await action("/api/admin/console/pages", { action: "publish-passing" }, "Passing drafts published")) refresh();
            }}
          >
            Publish all passing drafts
          </button>
        )}
        {selected.size > 0 && (
          <>
            <button onClick={() => setSelected(new Set())}>Clear</button>
            <button className="uc-primary" disabled={!generatable.length || busy} onClick={() => setGenerate(true)}>
              Generate {generatable.length} page{generatable.length === 1 ? "" : "s"}
            </button>
          </>
        )}
      </div>
      {groups.map((group) => {
        const rows = group.rows.filter((r) => matches(r, filter));
        const done = group.rows.filter((r) => ["Ready", "Published"].includes(pageStage(r)) && r.version === "3").length;
        const expanded = open === group.id || filter !== "All";
        if (!rows.length) return null;
        return (
          <Panel
            key={group.id}
            title={group.label}
            action={
              <span className="uc-pillar-meta">
                <span className="uc-progress" aria-label={`${done} of ${group.rows.length} pages done`}>
                  <span style={{ width: `${(done / group.rows.length) * 100}%` }} />
                </span>
                {done}/{group.rows.length} done
                <button onClick={() => setOpen(expanded && filter === "All" ? null : group.id)}>
                  {expanded ? "Collapse" : "Show pages"}
                </button>
              </span>
            }
          >
            {expanded && (
              <table className="uc-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label={`Select all ${group.label} pages`}
                        checked={rows.every((r) => selected.has(r.path))}
                        onChange={(e) => toggle(rows.map((r) => r.path), e.target.checked)}
                      />
                    </th>
                    <th>Page</th>
                    <th>Status</th>
                    <th>Quality</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const stage = pageStage(row);
                    return (
                      <tr key={row.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.path}`}
                            checked={selected.has(row.path)}
                            onChange={(e) => toggle([row.path], e.target.checked)}
                          />
                        </td>
                        <td>
                          <strong>{sitePage(row.path)?.label ?? row.title}</strong>
                          <small className="uc-path">{row.path}</small>
                        </td>
                        <td>
                          <span className={"uc-loz " + lozenge[stage]}>{stage}</span>
                          {row.published && stage !== "Published" && <span className="uc-loz uc-loz-done uc-loz-gap">Live</span>}
                          {row.version !== "3" && stage !== "Generating" && <small className="uc-path">Old format: regenerate</small>}
                        </td>
                        <td>{row.qa == null ? "—" : <span className={"uc-score " + (row.qa >= 80 ? "good" : row.qa >= 60 ? "ok" : "low")}>{row.qa}</span>}</td>
                        <td className="uc-row-actions">
                          <Link href={"/admin/pages/" + row.id}>Edit</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Panel>
        );
      })}
      {generate && (
        <Drawer title={`Generate ${generatable.length} pages`} close={() => setGenerate(false)}>
          <GenerationForm
            settings={settings.data}
            paths={generatable}
            busy={busy}
            submit={async (values) => {
              // The pipeline accepts up to five pages per request.
              let ok = true;
              for (let i = 0; i < generatable.length && ok; i += 5)
                ok = await action(
                  "/api/admin/publishing",
                  { action: "queue", input: { ...values, paths: generatable.slice(i, i + 5) } },
                  `${generatable.length} pages queued. Follow progress in Generation.`,
                );
              if (ok) {
                setGenerate(false);
                setSelected(new Set());
                refresh();
              }
            }}
          />
        </Drawer>
      )}
    </div>
  );
}

