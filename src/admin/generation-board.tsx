"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Empty, Panel } from "../admin-console";

type Task = {
  kind: "blueprint" | "brief" | "section" | "asset";
  section_id: string | null;
  status: "queued" | "running" | "completed" | "failed";
  attempts: number;
  error: string | null;
  next_attempt_at: string;
};
type Run = {
  id: string;
  status: string;
  review_status: string;
  scope: string;
  error: string | null;
  created_at: string;
  updated_at: string;
  page_id: string;
  path: string;
  title: string;
  tasks: Task[];
};

const label = (t: Task) =>
  t.kind === "brief" ? "Strategy brief" : t.kind === "blueprint" ? "Layout" : t.kind === "asset" ? `Image · ${t.section_id}` : t.section_id ?? t.kind;

function elapsed(from: string, to?: string) {
  const s = Math.max(0, Math.round(((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Live generation progress, pushed from the server over Server-Sent Events. */
export function GenerationBoard({
  action,
  busy,
}: {
  action: (path: string, body: unknown, success?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const source = new EventSource("/api/admin/runs/stream");
    source.addEventListener("board", (e) => {
      setRuns(JSON.parse((e as MessageEvent).data));
      setConnected(true);
    });
    source.onerror = () => setConnected(false);
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    return () => {
      source.close();
      clearInterval(clock);
    };
  }, []);

  if (!runs) return <p className="uc-loading">Connecting to live progress…</p>;
  const active = runs.filter((r) => ["queued", "running"].includes(r.status));
  const recent = runs.filter((r) => !["queued", "running", "cancelled"].includes(r.status));
  const tasks = active.flatMap((r) => r.tasks);
  const done = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="uc-generation">
      <div className="uc-summary-strip">
        <div>
          <strong>{active.length}</strong>
          <span>Pages generating</span>
        </div>
        <div>
          <strong>{tasks.length ? Math.round((done / tasks.length) * 100) : 100}%</strong>
          <span>
            {done} of {tasks.length} steps done
          </span>
        </div>
        <div>
          <strong>{recent.filter((r) => r.status === "review").length}</strong>
          <span>Ready for review</span>
        </div>
        <div>
          <strong>{recent.filter((r) => r.status === "failed").length}</strong>
          <span>Need attention</span>
        </div>
        <p className={"uc-live " + (connected ? "on" : "off")}>{connected ? "Live" : "Reconnecting…"}</p>
      </div>
      <Panel title="In progress">
        {active.length ? (
          <ul className="uc-run-list">
            {active.map((run) => (
              <RunRow key={run.id} run={run} action={action} busy={busy} />
            ))}
          </ul>
        ) : (
          <Empty title="Nothing generating" body="Select pages in Site map and choose Generate. Progress appears here as each step finishes." />
        )}
      </Panel>
      {recent.length > 0 && (
        <Panel title="Finished in the last 30 minutes">
          <ul className="uc-run-list">
            {recent.map((run) => (
              <RunRow key={run.id} run={run} action={action} busy={busy} />
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function RunRow({ run, action, busy }: { run: Run; action: (path: string, body: unknown, success?: string) => Promise<boolean>; busy: boolean }) {
  const done = run.tasks.filter((t) => t.status === "completed").length;
  const failed = run.tasks.filter((t) => t.status === "failed");
  const retrying = run.tasks.filter((t) => t.status === "queued" && t.error);
  const finished = !["queued", "running"].includes(run.status);
  return (
    <li className="uc-run">
      <div className="uc-run-head">
        <div>
          <Link href={"/admin/pages/" + run.page_id}>
            <strong>{run.title}</strong>
          </Link>
          <small className="uc-path">{run.path}</small>
        </div>
        <span className="uc-run-meta">
          {done}/{run.tasks.length} steps
          {run.status === "queued" ? " · in queue" : ` · ${elapsed(run.created_at, finished ? run.updated_at : undefined)}`}
        </span>
        <span className={"uc-loz " + (run.status === "failed" ? "uc-loz-failed" : run.status === "review" ? "uc-loz-review" : "uc-loz-progress")}>
          {run.status === "review" ? "Ready for review" : run.status}
        </span>
      </div>
      <ol className="uc-segments" aria-label={`${done} of ${run.tasks.length} steps complete`}>
        {run.tasks.map((t, i) => (
          <li key={i} className={"seg-" + t.status} title={`${label(t)}: ${t.status}${t.error ? " — " + t.error : ""}`} />
        ))}
      </ol>
      <p className="uc-run-now">
        {run.tasks
          .filter((t) => t.status === "running")
          .map(label)
          .join(", ") || (finished ? "" : "Waiting for a free worker slot")}
      </p>
      {retrying.length > 0 && (
        <p className="uc-run-note">Retrying automatically: {retrying.map((t) => label(t)).join(", ")}</p>
      )}
      {failed.length > 0 && (
        <p className="uc-run-error" role="alert">
          {failed.map((t) => `${label(t)}: ${t.error}`).join(" · ")}
        </p>
      )}
      <div className="uc-row-actions">
        {run.status === "review" && <Link href={"/admin/pages/" + run.page_id}>Review draft</Link>}
        {run.status === "failed" && (
          <button disabled={busy} onClick={() => action("/api/admin/publishing", { action: "retry", id: run.id }, "Failed steps queued again")}>
            Retry failed steps
          </button>
        )}
        {!finished && (
          <button
            disabled={busy}
            onClick={() => confirm("Cancel this generation?") && action("/api/admin/publishing", { action: "cancel", id: run.id }, "Generation cancelled")}
          >
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}
