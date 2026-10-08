"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AISettings } from "./ai-settings";
import { ConsoleEditor } from "./admin-console-editor";
import { legacyAdminReturn } from './admin-return';
import { SiteMap } from "./admin/site-map";
import { GenerationBoard } from "./admin/generation-board";
import { StorageSettings } from "./admin/storage-settings";
import { Dashboard } from "./admin/dashboard";
import { AdminSidebar, useSidebarCollapsed } from "./admin/sidebar";
const titles: Record<string, string> = {
  dashboard: "Dashboard",
  sitemap: "Site map",
  pages: "Pages",
  generation: "Generation",
  production: "Review queue",
  media: "Media",
  leads: "Leads",
  newsletter: "Newsletter",
  careers: "Careers",
  settings: "Settings",
};
const descriptions: Record<string, string> = {
  dashboard: "Your enquiries, publishing progress, and operational health.",
  sitemap: "Every page by pillar: what is planned, generating, ready for review and live.",
  generation: "Live progress for every page being written. Nothing to do here unless a step fails.",
  pages: "Manage website pages, review drafts, and publish with confidence.",
  production:
    "Follow generation, resolve failures, and review completed drafts.",
  media: "Review illustrations and manage their page associations.",
  leads: "Review enquiries and keep your next actions clear.",
  newsletter: "Manage subscribers and follow email delivery.",
  careers: "Manage verified vacancies and private applications.",
  settings: "Configure services and website operations in one place.",
};
export async function adminFetch(path: string, body?: unknown) {
  const response = await fetch(path, {
    cache: "no-store",
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error ?? "Request failed");
  return value;
}
export function useAdminData(resource: string, search: string, interval = 0) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    async function read() {
      try {
        const response = await fetch(
          "/api/admin/console/" + resource + "?" + search,
          { cache: "no-store", signal: controller.signal },
        );
        const value = await response.json();
        if (!response.ok) throw new Error(value.error ?? "Data unavailable");
        if (alive) {
          setData(value);
          setError("");
        }
      } catch (e) {
        if (alive && !controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load");
      }
    }
    setData(null);
    read();
    const timer = interval
      ? setInterval(() => {
          if (!document.hidden) read();
        }, interval)
      : null;
    return () => {
      alive = false;
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [resource, search, revision, interval]);
  return { data, error, refresh: () => setRevision((v) => v + 1) };
}
export function Badge({ value }: { value: unknown }) {
  const text = String(value ?? "Unavailable");
  return (
    <span
      className={
        "uc-badge uc-status-" + text.toLowerCase().replace(/[^a-z]/g, "")
      }
    >
      {text.replaceAll("_", " ")}
    </span>
  );
}
export function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="uc-empty">
      <span aria-hidden="true">◇</span>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
    </div>
  );
}
export function Panel({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="uc-panel">
      {title && (
        <div className="uc-panel-title">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Drawer({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog className="uc-drawer" ref={ref} onCancel={close} aria-label={title}>
      <header>
        <h2>{title}</h2>
        <button onClick={close} aria-label="Close details">
          ×
        </button>
      </header>
      <div>{children}</div>
    </dialog>
  );
}
export function AdminConsole({
  section,
  id,
}: {
  section: string;
  id?: string;
}) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState(false),
    [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (location.hash) {
      location.replace(legacyAdminReturn(location.hash));
      return;
    }
    setQuery(location.search.slice(1));
    const back = () => setQuery(location.search.slice(1));
    addEventListener("popstate", back);
    return () => removeEventListener("popstate", back);
  }, []);
  const update = (values: Record<string, string>) => {
    const params = new URLSearchParams(query);
    Object.entries(values).forEach(([k, v]) => {
      if (v === "all" || !v) params.delete(k);
      else params.set(k, v);
    });
    if (!("page" in values)) params.delete("page");
    const next = params.toString();
    history.replaceState(
      null,
      "",
      location.pathname + (next ? "?" + next : ""),
    );
    setQuery(next);
  };
  async function action(
    path: string,
    body: unknown,
    success = "Changes saved",
  ) {
    setPending(true);
    setMessage("");
    try {
      await adminFetch(path, body);
      setMessage(success);
      setRefreshKey((v) => v + 1);
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setPending(false);
    }
  }
  const nav = [
    ["Overview", ["dashboard"]],
    ["Website", ["sitemap", "generation", "production", "pages", "media"]],
    ["Business", ["leads", "newsletter", "careers"]],
    ["Administration", ["settings"]],
  ] as [string, string[]][];
  return (
    <main className={"uc-admin" + (collapsed ? " uc-collapsed" : "")}>
      <button
        className="uc-mobile-toggle"
        aria-expanded={menu}
        onClick={() => setMenu(!menu)}
      >
        Menu
      </button>
      <AdminSidebar
        section={id ? "pages" : section}
        open={menu}
        close={() => setMenu(false)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="uc-main">
        <header className="uc-topbar">
          <nav className="uc-crumbs" aria-label="Breadcrumb">
            <Link href="/admin">Admin</Link>
            <span aria-hidden="true">/</span>
            {id ? (
              <>
                <Link href="/admin/pages">Pages</Link>
                <span aria-hidden="true">/</span>
                <strong>Editor</strong>
              </>
            ) : (
              <strong>{titles[section]}</strong>
            )}
          </nav>
          <div className="uc-top-actions">
            <Link className="uc-button" href="/admin/generation">
              Generation
            </Link>
            <Link className="uc-button uc-primary" href="/admin/sitemap">
              Generate pages
            </Link>
            <a className="uc-button" href="/" target="_blank" rel="noreferrer">
              View site ↗
            </a>
            <span className="uc-avatar" title="Owner">N</span>
          </div>
        </header>
        <div className="uc-body">
          {!id && <div className="uc-heading">
            <div>
              <h1>{id ? "Page editor" : titles[section]}</h1>
              {!id && <p>{descriptions[section]}</p>}
            </div>
          </div>}
          {message && (
            <p className="uc-notice" role="status">
              {message}
              <button
                aria-label="Dismiss message"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </p>
          )}
          {id ? (
            <ConsoleEditor id={id} action={action} busy={pending} />
          ) : (
            <ConsoleScreen
              key={section}
              section={section}
              query={query}
              update={update}
              action={action}
              busy={pending}
              refreshKey={refreshKey}
            />
          )}
        </div>
      </div>
    </main>
  );
}
type ScreenProps = {
  section: string;
  query: string;
  update: (v: Record<string, string>) => void;
  action: (path: string, body: unknown, success?: string) => Promise<boolean>;
  busy: boolean;
  refreshKey: number;
};
function ConsoleScreen(props: ScreenProps) {
  if (props.section === "dashboard")
    return (
      <Dashboard
        days={new URLSearchParams(props.query).get("days") ?? "30"}
        setDays={(days) => props.update({ days })}
      />
    );
  if (props.section === "settings") return <Settings {...props} />;
  if (props.section === "sitemap") return <SiteMap action={props.action} busy={props.busy} />;
  if (props.section === "generation") return <GenerationBoard action={props.action} busy={props.busy} />;
  return <Inventory {...props} />;
}
function Loading() {
  return (
    <div className="uc-skeleton" role="status" aria-label="Loading admin data">
      <div />
      <div />
      <div />
    </div>
  );
}
function Inventory({
  section,
  query,
  update,
  action,
  busy,
  refreshKey,
}: ScreenProps) {
  const params = new URLSearchParams(query);
  const view =
    params.get("view") ??
    (section === "production"
      ? "queue"
      : section === "careers"
        ? "vacancies"
        : section === "newsletter"
          ? "subscribers"
          : "all");
  const resource =
    section === "newsletter"
      ? view === "delivery"
        ? "outbox"
        : "subscribers"
      : section === "careers"
        ? view === "applications"
          ? "applications"
          : "vacancies"
        : section;
  const search = new URLSearchParams(query);
  search.delete("view");
  if (section === "production" && !search.has("status"))
    search.set("status", view);
  search.set("v", String(refreshKey));
  const { data, error, refresh } = useAdminData(
    resource,
    search.toString(),
    section === "production" || resource === "outbox" ? 10000 : 0,
  );
  const [selected, setSelected] = useState<string[]>([]),
    [detail, setDetail] = useState<any>(null),
    [generation, setGeneration] = useState(false);
  const options = useAdminData("options", "");
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    setSelected([]);
    setDetail(null);
  }, [section, query]);
  async function open(row: any) {
    try {
      setDetail({
        loading: true,
        title: row.title ?? row.name ?? row.alt ?? row.email ?? row.path,
      });
      const result = await adminFetch(
        `/api/admin/console/${resource}?id=${row.id}`,
      );
      setDetail({
        ...row,
        ...result,
        id: row.id,
        ...(resource === "production" ? row : {}),
      });
    } catch (e) {
      setDetail({ error: e instanceof Error ? e.message : "Unable to open" });
    }
  }
  async function queue() {
    setSettings(await adminFetch("/api/admin/console/settings"));
    setGeneration(true);
  }
  const tabs =
    section === "production"
      ? ["queue", "review", "history"]
      : section === "careers"
        ? ["vacancies", "applications"]
        : section === "newsletter"
          ? ["subscribers", "delivery"]
          : section === "pages"
            ? ["all", "evidence"]
            : [];
  const remove = (path: string, body: unknown, label: string) => {
    if (confirm(label)) return action(path, body);
  };
  if (section === "pages" && view === "evidence")
    return (
      <>
        <Tabs
          names={tabs}
          active={view}
          change={(view) => update({ view, status: "all" })}
        />
        <Evidence action={action} busy={busy} refreshKey={refreshKey} />
      </>
    );
  return (
    <>
      {tabs.length > 0 && (
        <Tabs
          names={tabs}
          active={view}
          change={(view) => update({ view, status: "all" })}
        />
      )}
      {data?.states && ["leads", "newsletter", "careers"].includes(section) && (
        <div className="uc-inventory-kpis">
          {data.states.map((s: any) => (
            <button key={s.status} onClick={() => update({ status: s.status })}>
              <strong>{s.count}</strong>
              <span>{s.status}</span>
            </button>
          ))}
        </div>
      )}
      <Panel>
        <div className="uc-toolbar">
          <div className="uc-filter-search">
            <label htmlFor="inventory-search">Search</label>
            <input
              id="inventory-search"
              type="search"
              placeholder={"Search " + titles[section].toLowerCase() + "…"}
              value={params.get("q") ?? ""}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>
          <label>
            Status
            <select
              value={params.get("status") ?? "all"}
              onChange={(e) => update({ status: e.target.value })}
            >
              <option value="all">All statuses</option>
              {(resource === "pages"
                ? ["published", "unpublished", "archived"]
                : resource === "production"
                  ? [
                      "queued",
                      "running",
                      "failed",
                      "review",
                      "cancelled",
                      "completed",
                    ]
                  : resource === "leads"
                    ? ["New", "Qualified", "Unqualified", "Contacted", "Closed"]
                    : resource === "subscribers"
                      ? ["pending", "active", "unsubscribed", "suppressed"]
                      : resource === "vacancies"
                        ? ["open", "closed"]
                        : resource === "applications"
                          ? [
                              "new",
                              "reviewing",
                              "interview",
                              "declined",
                              "hired",
                            ]
                          : resource === "media"
                            ? ["pending", "accepted", "rejected"]
                            : [
                                "queued",
                                "sending",
                                "sent",
                                "failed",
                                "suppressed",
                              ]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {section === "pages" && (
            <button
              className="uc-primary"
              disabled={!selected.length || busy}
              onClick={queue}
            >
              Generate {selected.length ? `(${selected.length})` : ""}
            </button>
          )}
          {resource === "vacancies" && (
            <button
              className="uc-primary"
              onClick={() => setDetail({ newVacancy: true })}
            >
              Add vacancy
            </button>
          )}
          {resource === "subscribers" && (
            <a
              className="uc-button"
              href="/api/admin/publishing?export=subscribers"
            >
              Export confirmed
            </a>
          )}
        </div>
        {section === "pages" && (
          <div className="uc-filter-row">
            {[
              [
                "category",
                "Category",
                options.data?.categories?.map((r: any) => r.value) ?? [],
              ],
              [
                "kind",
                "Page type",
                options.data?.kinds?.map((r: any) => r.value) ?? [],
              ],
              ["review", "Review", ["pending", "accepted", "rejected"]],
              [
                "generation",
                "Generation",
                ["idle", "queued", "running", "review", "failed"],
              ],
              ["spec", "Specification", ["yes", "no"]],
              ["sort", "Sort", ["updated", "title", "created"]],
            ].map(([key, label, choices]) => (
              <label key={String(key)}>
                {label as string}
                <select
                  value={
                    params.get(String(key)) ??
                    (key === "sort" ? "updated" : "all")
                  }
                  onChange={(e) => update({ [String(key)]: e.target.value })}
                >
                  {key !== "sort" && <option value="all">All</option>}
                  {(choices as string[]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        {error ? (
          <p role="alert">{error}</p>
        ) : !data ? (
          <Loading />
        ) : !data.rows.length ? (
          <Empty
            title="No matching records"
            body="Try another search or change the filters."
          />
        ) : resource === "media" ? (
          <div className="uc-media-grid">
            {data.rows.map((r: any) => (
              <button
                className="uc-media-card"
                key={r.id}
                onClick={() => open(r)}
              >
                <img src={"/media/" + r.id} alt={r.alt} loading="lazy" />
                <span>{r.path ?? r.alt}</span>
                <Badge value={r.status} />
              </button>
            ))}
          </div>
        ) : (
          <div className="uc-table-wrap">
            <table>
              <thead>
                <tr>
                  {section === "pages" && <th aria-label="Select pages" />}
                  <th>
                    {section === "pages"
                      ? "Page"
                      : resource === "production"
                        ? "Operation"
                        : resource === "outbox"
                          ? "Email"
                          : "Record"}
                  </th>
                  <th>Status</th>
                  <th>
                    {section === "pages" ? "Review & production" : "Details"}
                  </th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r: any) => (
                  <tr key={r.id}>
                    {section === "pages" && (
                      <td>
                        <input
                          type="checkbox"
                          aria-label={"Select " + r.path}
                          checked={selected.includes(r.path)}
                          disabled={
                            !r.has_spec ||
                            (!selected.includes(r.path) && selected.length >= 5)
                          }
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, r.path]
                                : selected.filter((p) => p !== r.path),
                            )
                          }
                        />
                      </td>
                    )}
                    <td>
                      {section === "pages" ? (
                        <Link href={"/admin/pages/" + r.id}>{r.title}</Link>
                      ) : (
                        <button
                          className="uc-text-button"
                          onClick={() => open(r)}
                        >
                          {r.title ?? r.name ?? r.email ?? r.subject ?? r.path}
                        </button>
                      )}
                      <small>
                        {r.path ?? r.email ?? r.recipient ?? r.department}
                      </small>
                    </td>
                    <td>
                      <Badge
                        value={
                          section === "pages"
                            ? r.archived_at
                              ? "Archived"
                              : r.published_revision_id
                                ? r.published_version === "3" ? "V3 published" : `V${r.published_version || "1"} published`
                                : "Unpublished"
                            : r.status
                        }
                      />
                      {section === "pages" &&
                        r.published_revision_id !== r.draft_revision_id && (
                          <small>Draft changes</small>
                        )}
                    </td>
                    <td>
                      {section === "pages" ? (
                        <>
                          <Badge value={r.review_status} />
                          <small>
                            {r.has_spec ? r.version === "3" ? "V3 draft ready" : "Mapped · generate V3 draft" : "Missing mapping"}{" "}
                            · {r.generation_status}
                          </small>
                        </>
                      ) : resource === "production" ? (
                        <>
                          <progress max={r.total || 1} value={r.completed} />
                          <small>
                            {r.completed}/{r.total}{" "}
                            {r.engine === "legacy" ? "job" : "tasks"} ·{" "}
                            {r.scope}
                          </small>
                        </>
                      ) : resource === "applications" ? (
                        r.title
                      ) : resource === "outbox" ? (
                        `${r.attempts} attempts`
                      ) : resource === "leads" ? (
                        <>
                          {r.service ?? "—"}
                          <small className="uc-path">
                            {r.pillar} · {r.landing_page ?? "unknown page"}
                            {r.utm_source ? " · " + r.utm_source : ""}
                          </small>
                        </>
                      ) : (
                        (r.service ?? r.location ?? "—")
                      )}
                    </td>
                    <td>
                      <small>{date(r.updated_at ?? r.created_at)}</small>
                    </td>
                    <td>
                      {resource === "production" ? (
                        <div className="uc-row-actions">
                          {r.result_revision_id && (
                            <Link
                              href={
                                "/admin/preview/" +
                                r.page_id +
                                "?revision=" +
                                r.result_revision_id
                              }
                            >
                              Preview
                            </Link>
                          )}
                          {r.engine === "pipeline" && r.result_revision_id && (
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  confirm(
                                    "Use this generated revision as the current draft? Any newer saved draft stays in History.",
                                  )
                                )
                                  action(
                                    "/api/admin/publishing",
                                    { action: "adopt-draft", id: r.id },
                                    "Generated revision adopted as draft",
                                  );
                              }}
                            >
                              Use as draft
                            </button>
                          )}
                          {r.status === "failed" && r.engine !== "legacy" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                action(
                                  "/api/admin/publishing",
                                  { action: "retry", id: r.id },
                                  "Only failed tasks queued. Completed content and illustrations are preserved.",
                                )
                              }
                            >
                              Retry failed tasks only
                            </button>
                          )}
                          {["queued", "running"].includes(r.status) && r.engine !== "legacy" && (
                            <button
                              onClick={() =>
                                remove(
                                  "/api/admin/publishing",
                                  { action: "cancel", id: r.id },
                                  "Cancel this generation operation?",
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                          {r.status === "review" && (
                            <button
                              onClick={() =>
                                action(
                                  "/api/admin/publishing",
                                  {
                                    action: "review",
                                    id: r.id,
                                    status: "accepted",
                                  },
                                  "Page accepted; publication remains separate",
                                )
                              }
                            >
                              Accept
                            </button>
                          )}
                        </div>
                      ) : section === "pages" ? (
                        <div className="uc-row-actions"><Link href={"/admin/pages/" + r.id}>Edit →</Link>{r.published_revision_id && <a href={r.path} target="_blank" rel="noreferrer">Visit live ↗</a>}</div>
                      ) : (
                        <button onClick={() => open(r)}>Details</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && (
          <div className="uc-pagination">
            <span>{data.total} records</span>
            <label>
              Rows
              <select
                value={params.get("size") ?? "25"}
                onChange={(e) => update({ size: e.target.value })}
              >
                {[25, 50, 100].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              disabled={data.page <= 1}
              onClick={() => update({ page: String(data.page - 1) })}
            >
              Previous
            </button>
            <span>
              {data.page} / {Math.max(1, Math.ceil(data.total / data.size))}
            </span>
            <button
              disabled={data.page * data.size >= data.total}
              onClick={() => update({ page: String(data.page + 1) })}
            >
              Next
            </button>
          </div>
        )}
      </Panel>
      {generation && (
        <Drawer title="Generate drafts" close={() => setGeneration(false)}>
          <GenerationForm
            settings={settings}
            paths={selected}
            busy={busy}
            submit={async (input) => {
              if (
                await action(
                  "/api/admin/publishing",
                  { action: "queue", input },
                  "Generation queued. Results become a draft; use Publish to update the live page.",
                )
              ) {
                setGeneration(false);
                refresh();
              }
            }}
          />
        </Drawer>
      )}
      {detail && (
        <Drawer
          title={detail.title ?? detail.name ?? "Record details"}
          close={() => setDetail(null)}
        >
          {detail.loading ? (
            <Loading />
          ) : detail.error ? (
            <p role="alert">{detail.error}</p>
          ) : (
            <RecordDetail
              resource={resource}
              detail={detail}
              action={action}
              busy={busy}
              close={() => setDetail(null)}
              remove={remove}
            />
          )}
        </Drawer>
      )}
    </>
  );
}
export function Tabs({
  names,
  active,
  change,
}: {
  names: string[];
  active: string;
  change: (v: string) => void;
}) {
  return (
    <nav className="uc-tabs" aria-label="Screen views">
      {names.map((n) => (
        <button key={n} aria-pressed={active === n} onClick={() => change(n)}>
          {(
            { ai: "AI providers", data: "Data & activity", seo: "SEO", qa: "Quality", assets: "Images" } as Record<
              string,
              string
            >
          )[n] ?? n.replaceAll("-", " ")}
        </button>
      ))}
    </nav>
  );
}
export function date(value: string) {
  return value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
}
export function GenerationForm({
  settings,
  paths,
  submit,
  busy,
  scope = "page",
  sectionIds = [],
  baseRevisionId,
  illustrationCount,
}: {
  settings: any;
  paths: string[];
  submit: (v: any) => Promise<void>;
  busy: boolean;
  scope?: string;
  sectionIds?: string[];
  baseRevisionId?: string;
  illustrationCount?: number;
}) {
  const defaults =
    settings?.values.generation_defaults ?? settings?.values.ai ?? {};
  const [provider, setProvider] = useState(defaults.provider ?? "openrouter"),
    [model, setModel] = useState(defaults.model ?? ""),
    [imageModel, setImageModel] = useState(defaults.imageModel ?? "openai/gpt-image-2.5-flare"),
    [imageQuality, setImageQuality] = useState(defaults.imageQuality ?? "medium"),
    [models, setModels] = useState<any[]>([]),
    [instruction, setInstruction] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          paths,
          provider,
          model,
          imageModel,
          imageQuality,
          scope,
          sectionIds,
          ...(baseRevisionId ? { baseRevisionId } : {}),
          ...(instruction.trim() && scope !== "image" ? { instruction: instruction.trim() } : {}),
        });
      }}
    >
      <p>Creates a replacement draft. Publication remains a separate action.</p>
      <div className="uc-validation">
        <strong>What this run changes</strong>
        <p>{scope === "image" ? "Regenerates the page illustrations." : "Plans keywords and questions first, then writes each section within the page structure. It does not redesign the page."}</p>
        {illustrationCount !== undefined && <p>{illustrationCount === 0 ? "This specification has no illustrations. No images will be generated, regardless of the image model selected below." : scope === "sections" ? "Selected-copy generation preserves existing artwork." : `${illustrationCount} designated illustration(s) will be generated.`}</p>}
      </div>
      {scope !== "image" && (
        <label>
          Instruction for the writer <span className="uc-muted">(optional)</span>
          <textarea
            rows={3}
            maxLength={1000}
            placeholder="For example: make the FAQ focus on cost and timeline, or add a comparison table to the overview."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </label>
      )}
      <label>
        Text provider
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option>openrouter</option>
          <option>bedrock</option>
        </select>
      </label>
      <label>
        Text model
        <input
          required
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </label>
      <label>
        Image model
        <input
          list="console-image-models"
          required
          value={imageModel}
          onChange={(e) => setImageModel(e.target.value)}
        />
        <datalist id="console-image-models">
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </datalist>
      </label>
      <label>Image quality<select value={imageQuality} onChange={e=>setImageQuality(e.target.value)}>{["auto","low","medium","high","xhigh","max"].map(q=><option key={q}>{q}</option>)}</select></label>
      <p>
        OpenRouter:{" "}
        {settings?.configured.openrouter
          ? "saved key connected"
          : "configure credentials in Settings"}
        .
      </p>
      <button
        type="button"
        onClick={async () => {
          try {
            setModels(
              (await adminFetch("/api/admin/publishing?models=images")).models,
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Discovery failed");
          }
        }}
      >
        Discover image models
      </button>
      {error && <p role="alert">{error}</p>}
      <div className="uc-form-footer">
        <button className="uc-primary" disabled={busy}>
          Generate{" "}
          {scope === "image"
            ? "illustration"
            : scope === "sections"
              ? "selected sections"
              : "drafts"}
        </button>
      </div>
    </form>
  );
}
function RecordDetail({
  resource,
  detail: d,
  action,
  busy,
  close,
  remove,
}: any) {
  if (resource === "production")
    return (
      <>
        {d.error && <p role="alert">{d.error}</p>}
        {d.tasks?.map((t: any) => (
          <details key={t.id}>
            <summary>
              {t.kind} · {t.section_id ?? "Blueprint"}{" "}
              <Badge value={t.status} />
            </summary>
            <p>{t.error}</p>
            <pre>
              {JSON.stringify(
                {
                  usage: t.usage,
                  request: t.request_snapshot,
                  result: t.result,
                },
                null,
                2,
              )}
            </pre>
          </details>
        ))}
      </>
    );
  if (resource === "vacancies")
    return (
      <VacancyForm
        vacancy={d.newVacancy ? undefined : d}
        busy={busy}
        save={async (input: any) => {
          if (
            await action("/api/admin/publishing", {
              action: "vacancy-save",
              input,
            })
          )
            close();
        }}
      />
    );
  if (resource === "media")
    return (
      <>
        <img className="uc-detail-image" src={"/media/" + d.id} alt={d.alt} />
        <p>
          {d.path} · {d.width} × {d.height}
        </p>
        <p>{d.alt}</p>
        <Badge value={d.review_status} />
        <details>
          <summary>Generation details</summary>
          <p>
            {d.provider} · {d.model}
          </p>
          <pre>{d.source_prompt}</pre>
        </details>
        <div className="uc-form-footer">
          {["accepted", "rejected"].map((status) => (
            <button
              key={status}
              disabled={busy}
              onClick={async () => {
                if (
                  await action("/api/admin/publishing", {
                    action: "asset-review",
                    id: d.id,
                    status,
                  })
                )
                  close();
              }}
            >
              {status === "accepted" ? "Accept illustration" : "Reject"}
            </button>
          ))}
        </div>
      </>
    );
  if (resource === "leads")
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          if (
            await action("/api/admin", {
              action: "lead",
              id: d.id,
              status: fd.get("status"),
              notes: fd.get("notes"),
            })
          )
            close();
        }}
      >
        <dl>
          {Object.entries(d.data ?? {}).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt>{key}</dt>
              <dd>{String(value ?? "—")}</dd>
            </React.Fragment>
          ))}
        </dl>
        <label>
          Status
          <select name="status" defaultValue={d.status}>
            {["New", "Qualified", "Unqualified", "Contacted", "Closed"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Notes
          <textarea name="notes" rows={5} defaultValue={d.notes} />
        </label>
        <button className="uc-primary" disabled={busy}>
          Save lead
        </button>
      </form>
    );
  if (resource === "applications")
    return (
      <>
        <p>
          {d.email} · {d.phone ?? "No phone supplied"}
        </p>
        <p>{d.cover_message}</p>
        <p>Consent: {date(d.consent_at)}</p>
        <a
          className="uc-button"
          href={"/api/admin/applications/" + d.id + "/cv"}
        >
          Download scanned CV
        </a>
        <label>
          Status
          <select
            value={d.status}
            onChange={async (e) => {
              await action("/api/admin/publishing", {
                action: "application-status",
                id: d.id,
                status: e.target.value,
              });
              close();
            }}
          >
            {["new", "reviewing", "interview", "declined", "hired"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button
          className="uc-danger"
          onClick={async () => {
            if (
              await remove(
                "/api/admin/publishing",
                { action: "application-delete", id: d.id },
                "Delete this application and its private CV?",
              )
            )
              close();
          }}
        >
          Delete application
        </button>
      </>
    );
  if (resource === "subscribers")
    return (
      <>
        <p>{d.email}</p>
        <Badge value={d.status} />
        <button
          onClick={() =>
            action("/api/admin/publishing", {
              action: "subscriber-suppress",
              id: d.id,
            })
          }
        >
          Suppress
        </button>
        <button
          className="uc-danger"
          onClick={() =>
            remove(
              "/api/admin/publishing",
              { action: "subscriber-delete", id: d.id },
              "Delete this subscriber?",
            )
          }
        >
          Delete subscriber
        </button>
      </>
    );
  if (resource === "outbox")
    return (
      <>
        <p>{d.subject}</p>
        <p>{d.recipient}</p>
        <Badge value={d.status} />
        <p>{d.error}</p>
        {d.status === "failed" && (
          <button
            onClick={() =>
              action("/api/admin/publishing", {
                action: "outbox-retry",
                id: d.id,
              })
            }
          >
            Retry delivery
          </button>
        )}
      </>
    );
  return <Empty title="Details unavailable" />;
}
function VacancyForm({ vacancy: v, busy, save }: any) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        save({
          ...Object.fromEntries(fd),
          verified: fd.get("verified") === "on",
          ...(v?.id ? { id: v.id } : {}),
        });
      }}
    >
      {["title", "slug", "department", "location", "employment_type"].map(
        (name) => (
          <label key={name}>
            {name.replaceAll("_", " ")}
            <input name={name} required defaultValue={v?.[name] ?? ""} />
          </label>
        ),
      )}
      <label>
        Description
        <textarea
          name="description"
          minLength={30}
          rows={8}
          required
          defaultValue={v?.description ?? ""}
        />
      </label>
      <label>
        Status
        <select name="status" defaultValue={v?.status ?? "closed"}>
          <option>closed</option>
          <option>open</option>
        </select>
      </label>
      <label className="uc-checkbox">
        <input type="checkbox" name="verified" defaultChecked={v?.verified} />
        This is an approved, actual vacancy
      </label>
      <button className="uc-primary" disabled={busy}>
        Save vacancy
      </button>
    </form>
  );
}
function Evidence({ action, busy, refreshKey }: any) {
  const { data, error } = useAdminData("evidence", "v=" + refreshKey);
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <Loading />;
  return (
    <div className="uc-two-col">
      {["sources", "facts"].map((kind) => (
        <Panel
          key={kind}
          title={kind === "facts" ? "Verified facts" : "Research sources"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              action("/api/admin", {
                action: kind === "facts" ? "fact" : "source",
                ...Object.fromEntries(fd),
                approved: false,
              });
            }}
          >
            {(kind === "facts"
              ? ["statement"]
              : ["title", "url", "excerpt"]
            ).map((name) => (
              <label key={name}>
                {name}
                <textarea name={name} required={name !== "url"} />
              </label>
            ))}
            <button disabled={busy}>
              Add {kind === "facts" ? "fact" : "source"}
            </button>
          </form>
          {data[kind].map((r: any) => (
            <div className="uc-evidence-row" key={r.id}>
              <p>{r.statement ?? r.title}</p>
              <Badge value={r.approved ? "Approved" : "Pending"} />
              <button
                onClick={() =>
                  action("/api/admin", {
                    action:
                      kind === "facts" ? "approve-fact" : "approve-source",
                    id: r.id,
                    approved: !r.approved,
                  })
                }
              >
                {r.approved ? "Revoke" : "Approve"}
              </button>
            </div>
          ))}
        </Panel>
      ))}
    </div>
  );
}
function Settings({ query, update, action, busy, refreshKey }: ScreenProps) {
  const view = new URLSearchParams(query).get("view") ?? "ai";
  const { data, error, refresh } = useAdminData("settings", "v=" + refreshKey);
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <Loading />;
  return (
    <>
      <Tabs
        names={["ai", "generation", "storage", "email", "recruitment", "website", "data"]}
        active={view}
        change={(view) => update({ view })}
      />
      <div className="uc-settings">
        {view === "ai" && (
          <AISettings
            saved={data.values.ai}
            lastTest={data.values.ai_model_test}
            configured={data.configured}
            refresh={async () => refresh()}
          />
        )}{" "}
        {view === "generation" && (
          <>
            <Panel title="Saved generation defaults">
              <GenerationDefaults data={data} busy={busy} action={action} />
            </Panel>
            <Panel title="Concurrency and output">
              <SimpleSettingsForm
                fields={["textConcurrency", "imageConcurrency", "maxTokens"]}
                defaults={
                  data.values.publishing_pipeline ?? {
                    textConcurrency: 2,
                    imageConcurrency: 1,
                    maxTokens: 8000,
                  }
                }
                submit={(input: Record<string, number>) =>
                  action("/api/admin/publishing", { action: "settings", input })
                }
              />
            </Panel>
          </>
        )}
        {view === "storage" && <StorageSettings />}
        {view === "email" && (
          <Panel title="AWS SES">
            <p>
              {data.sesConfigured
                ? "Credentials saved; account and delivery checks are separate."
                : "Not configured."}
            </p>
            <SesForm busy={busy} action={action} />
            <div className="uc-row-actions">
              <button
                onClick={() =>
                  action(
                    "/api/admin/publishing",
                    { action: "ses-check" },
                    "Account and identity check completed",
                  )
                }
              >
                Check account & identity
              </button>
              <button
                onClick={() =>
                  action(
                    "/api/admin/publishing",
                    { action: "ses-test" },
                    "Test email queued; await delivery confirmation",
                  )
                }
              >
                Send test email
              </button>
            </div>
            <dl>
              {Object.entries(data.values.ses_delivery_status ?? {}).map(
                ([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k}</dt>
                    <dd>{String(v)}</dd>
                  </React.Fragment>
                ),
              )}
            </dl>
          </Panel>
        )}
        {view === "recruitment" && (
          <Panel title="Private CVs and retention">
            <p>
              Scanner:{" "}
              {data.scannerConfigured
                ? "Configured; files still require a clean scan."
                : "Not configured. Applications fail closed."}
            </p>
            <SimpleSettingsForm
              fields={["days"]}
              defaults={{ days: data.values.career_retention_days ?? 180 }}
              submit={(v: Record<string, number>) =>
                action("/api/admin/publishing", {
                  action: "retention",
                  days: v.days,
                })
              }
            />
            <p>PDF or DOCX · maximum 5 MB · owner-only downloads.</p>
          </Panel>
        )}
        {view === "website" && (
          <Panel title="Redirects">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                action("/api/admin", {
                  action: "redirect",
                  ...Object.fromEntries(new FormData(e.currentTarget)),
                });
              }}
            >
              <label>
                Old URL
                <input name="path" placeholder="/old-page" required />
              </label>
              <label>
                Destination
                <input name="destination" placeholder="/new-page" required />
              </label>
              <button>Save redirect</button>
            </form>
          </Panel>
        )}
        {view === "data" && (
          <>
            <Panel title="Imports & exports">
              <p>
                Validate source files before applying an import. Importing
                specifications does not publish content.
              </p>
              <button
                onClick={() =>
                  action(
                    "/api/admin/publishing",
                    { action: "import" },
                    "Specifications validated",
                  )
                }
              >
                Validate revised files
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Import the revised specifications? Published content stays unchanged.",
                    )
                  )
                    action(
                      "/api/admin/publishing",
                      { action: "import", apply: true },
                      "Specifications imported",
                    );
                }}
              >
                Import revised files
              </button>
              <a className="uc-button" href="/api/admin?type=export">
                Export content SQL
              </a>
              <a className="uc-button" href="/api/admin?type=leads-csv">
                Export leads
              </a>
            </Panel>
            <Activity />
          </>
        )}
      </div>
    </>
  );
}
function GenerationDefaults({ data, action, busy }: any) {
  const [models, setModels] = useState<any[]>([]);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        action("/api/admin/console/settings", {
          action: "defaults",
          value: Object.fromEntries(new FormData(e.currentTarget)),
        });
      }}
    >
      <label>
        Text provider
        <select
          name="provider"
          defaultValue={
            data.values.generation_defaults?.provider ??
            data.values.ai?.provider ??
            "openrouter"
          }
        >
          <option>openrouter</option>
          <option>bedrock</option>
        </select>
      </label>
      <label>
        Text model
        <input
          name="model"
          required
          defaultValue={
            data.values.generation_defaults?.model ??
            data.values.ai?.model ??
            ""
          }
        />
      </label>
      <label>
        Image model
        <input
          name="imageModel"
          list="default-image-models"
          required
          defaultValue={data.values.generation_defaults?.imageModel ?? "openai/gpt-image-2.5-flare"}
        />
        <datalist id="default-image-models">
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </datalist>
      </label>
      <button
        type="button"
        onClick={async () => {
          try {
            setModels(
              (await adminFetch("/api/admin/publishing?models=images")).models,
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Discovery failed");
          }
        }}
      >
        Discover image models
      </button>
      <label>Image quality<select name="imageQuality" defaultValue={data.values.generation_defaults?.imageQuality ?? "medium"}>{["auto","low","medium","high","xhigh","max"].map(q=><option key={q}>{q}</option>)}</select></label>
      {error && <p role="alert">{error}</p>}
      <button className="uc-primary" disabled={busy}>
        Save defaults
      </button>
    </form>
  );
}
function SimpleSettingsForm({ fields, defaults, submit }: any) {
  return (
    <form
      className="uc-form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        submit(
          Object.fromEntries(
            [...new FormData(e.currentTarget)].map(([k, v]) => [k, Number(v)]),
          ),
        );
      }}
    >
      {fields.map((name: string) => (
        <label key={name}>
          {name.replace(/([A-Z])/g, " $1")}
          <input
            name={name}
            type="number"
            required
            defaultValue={defaults[name]}
          />
        </label>
      ))}
      <button>Save settings</button>
    </form>
  );
}
function SesForm({ action, busy }: any) {
  return (
    <form
      className="uc-form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        action("/api/admin/publishing", {
          action: "ses-save",
          input: {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            retentionDays: 180,
          },
        });
      }}
    >
      {[
        "region",
        "identity",
        "configurationSet",
        "sender",
        "replyTo",
        "notificationRecipient",
        "careersRecipient",
        "snsTopicArn",
        "accessKeyId",
        "secretAccessKey",
      ].map((name) => (
        <label key={name}>
          {name.replace(/([A-Z])/g, " $1")}
          <input
            name={name}
            required
            autoComplete="off"
            type={
              /Key/.test(name)
                ? "password"
                : /sender|replyTo|Recipient/.test(name)
                  ? "email"
                  : "text"
            }
          />
        </label>
      ))}
      <button className="uc-primary" disabled={busy}>
        Save encrypted configuration
      </button>
    </form>
  );
}
function Activity() {
  const { data } = useAdminData("activity", "");
  return (
    <Panel title="Recent admin activity">
      {data?.rows.map((r: any) => (
        <div className="uc-health" key={r.id}>
          <span>{r.action}</span>
          <small>{date(r.created_at)}</small>
        </div>
      ))}
    </Panel>
  );
}
