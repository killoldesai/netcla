"use client";
import Link from "next/link";
import { pillars, sitePage } from "../site-structure";
import { Empty, Panel, useAdminData } from "../admin-console";
import { pageStage } from "./site-map";

type Icon = "inbox" | "clock" | "doc" | "image" | "alert" | "globe";
const icons: Record<Icon, string> = {
  inbox: "M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v6H4z",
  clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  alert: "M12 4l9 16H3zM12 10v4M12 17h.01",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
};
function Glyph({ name }: { name: Icon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function Dashboard({ days, setDays }: { days: string; setDays: (d: string) => void }) {
  const overview = useAdminData("overview", `days=${days}`, 60000);
  const sitemap = useAdminData("sitemap", "", 30000);
  if (overview.error) return <p role="alert">{overview.error}</p>;
  if (!overview.data) return <p className="uc-loading">Loading dashboard…</p>;
  const c = overview.data.counts;
  const values = overview.data.settings.values;
  const online = values.worker_heartbeat && Date.now() - new Date(values.worker_heartbeat).getTime() < 45000;
  const rows: any[] = sitemap.data?.pages ?? [];
  const stage = (r: any) => pageStage(r);
  const live = rows.filter((r) => r.published).length;
  const ready = rows.filter((r) => r.version === "3" && stage(r) === "Needs review").length;
  const generating = rows.filter((r) => stage(r) === "Generating").length;
  const trend = c.previous_enquiries ? Math.round(((c.enquiries - c.previous_enquiries) / c.previous_enquiries) * 100) : null;

  const kpis: { label: string; value: number; note: string; href: string; icon: Icon; tone: string }[] = [
    { label: "New enquiries", value: c.enquiries, note: trend === null ? `Last ${days} days` : `${trend >= 0 ? "+" : ""}${trend}% vs previous ${days} days`, href: "/admin/leads", icon: "inbox", tone: "indigo" },
    { label: "Awaiting your reply", value: c.unprocessed, note: "New, not yet contacted", href: "/admin/leads?status=New", icon: "clock", tone: "amber" },
    { label: "Drafts to review", value: sitemap.data ? ready : c.page_reviews, note: "Generated pages ready to check", href: "/admin/sitemap", icon: "doc", tone: "blue" },
    { label: "Images to accept", value: c.asset_reviews, note: "Needed before publishing", href: "/admin/media?status=pending", icon: "image", tone: "violet" },
    { label: "Live pages", value: live, note: `${rows.length} pages in the site map`, href: "/", icon: "globe", tone: "green" },
    { label: "Generation failures", value: c.failed_tasks, note: c.failed_tasks ? "Open Generation to retry" : "All clear", href: "/admin/generation", icon: "alert", tone: c.failed_tasks ? "red" : "neutral" },
  ];

  const pillarRows = [...pillars.map((p) => ({ id: p.id as string, label: p.label })), { id: "guides", label: "Guides" }, { id: "other", label: "Company & locations" }]
    .map((g) => {
      const items = rows.filter((r) => (sitePage(r.path)?.pillar ?? (r.path.startsWith("/blog") ? "guides" : "other")) === g.id);
      const count = (f: (r: any) => boolean) => items.filter(f).length;
      return {
        ...g,
        total: items.length,
        live: count((r) => r.published && r.version === "3" && stage(r) === "Published"),
        review: count((r) => stage(r) === "Needs review" || stage(r) === "Ready"),
        generating: count((r) => stage(r) === "Generating"),
        old: count((r) => r.version !== "3" && stage(r) !== "Generating"),
      };
    })
    .filter((g) => g.total);

  return (
    <div className="uc-dash">
      <section className="uc-dash-hero">
        <div>
          <h2>{greeting()}</h2>
          <p>
            {generating ? `${generating} pages are being written right now. ` : ""}
            {ready ? `${ready} drafts are ready for review` : "No drafts waiting"}
            {c.unprocessed ? ` · ${c.unprocessed} enquiries need a reply.` : "."}
          </p>
        </div>
        <div className="uc-row-actions">
          <Link className="uc-button" href="/admin/generation">
            <span className={"uc-dot " + (online ? "on" : "off")} /> Worker {online ? "online" : "offline"}
          </Link>
          <Link className="uc-button uc-primary" href="/admin/sitemap">
            Review drafts
          </Link>
        </div>
      </section>

      <div className="uc-toolbar uc-dash-period">
        <span className="uc-muted">Enquiry figures for the last</span>
        <div className="uc-segmented">
          {["7", "30", "90"].map((d) => (
            <button key={d} aria-pressed={days === d} onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="uc-kpi-grid">
        {kpis.map((k) => (
          <Link href={k.href} className={"uc-kpi-card tone-" + k.tone} key={k.label}>
            <span className="uc-kpi-icon">
              <Glyph name={k.icon} />
            </span>
            <span className="uc-kpi-label">{k.label}</span>
            <strong>{k.value}</strong>
            <small>{k.note}</small>
          </Link>
        ))}
      </div>

      <div className="uc-dash-grid">
        <Panel title="Website progress by pillar" action={<Link href="/admin/sitemap">Open site map →</Link>}>
          <div className="uc-legend">
            <span className="k-live">Live (new)</span>
            <span className="k-review">Ready for review</span>
            <span className="k-gen">Generating</span>
            <span className="k-old">Old version</span>
          </div>
          <ul className="uc-pillar-bars">
            {pillarRows.map((g) => (
              <li key={g.id}>
                <span className="uc-pillar-name">{g.label}</span>
                <span className="uc-stack" aria-label={`${g.live} live, ${g.review} for review, ${g.generating} generating, ${g.old} old of ${g.total}`}>
                  {(["live", "review", "generating", "old"] as const).map((k) =>
                    g[k] ? <span key={k} className={"s-" + k} style={{ width: `${(g[k] / g.total) * 100}%` }} /> : null,
                  )}
                </span>
                <span className="uc-pillar-count">{g.total}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Needs attention">
          <ul className="uc-attention-list">
            {[
              [c.unprocessed, "Reply to new enquiries", "/admin/leads?status=New", "clock"],
              [sitemap.data ? ready : c.page_reviews, "Review generated drafts", "/admin/sitemap", "doc"],
              [c.asset_reviews, "Accept generated images", "/admin/media?status=pending", "image"],
              [c.failed_tasks, "Retry failed generation", "/admin/generation", "alert"],
            ].map(([count, label, href, icon]) => (
              <li key={String(label)}>
                <Link href={String(href)}>
                  <span className="uc-att-icon">
                    <Glyph name={icon as Icon} />
                  </span>
                  <span>{label}</span>
                  <span className={"uc-count" + (Number(count) ? " has" : "")}>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="uc-health-chips">
            {[
              ["Worker", online],
              ["OpenRouter", overview.data.settings.configured.openrouter],
              ["Bedrock", overview.data.settings.configured.bedrock],
              ["Email (SES)", overview.data.settings.sesConfigured],
            ].map(([name, ok]) => (
              <span key={String(name)} className={"uc-chip " + (ok ? "ok" : "off")}>
                <span className={"uc-dot " + (ok ? "on" : "off")} />
                {name}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="uc-dash-grid">
        <Panel title="Enquiries over time">
          <EnquiryBars rows={overview.data.daily} days={Number(days)} />
        </Panel>
        <Panel title="Enquiries by service">
          {overview.data.services.length ? (
            <ul className="uc-service-bars">
              {overview.data.services.map((s: any) => (
                <li key={s.service}>
                  <span>{s.service}</span>
                  <span className="uc-bar">
                    <span style={{ width: `${(s.count / Math.max(...overview.data.services.map((x: any) => x.count), 1)) * 100}%` }} />
                  </span>
                  <strong>{s.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No enquiries yet in this period" body="Published service pages with clear calls to action will start bringing them in." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function EnquiryBars({ rows, days }: { rows: { day: string; count: number }[]; days: number }) {
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10);
    return { day: d, count: rows.find((r) => r.day === d)?.count ?? 0 };
  });
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((n, s) => n + s.count, 0);
  return (
    <div className="uc-enquiry-chart">
      <p className="uc-muted">{total} enquiries in {days} days</p>
      <div className="uc-columns" role="img" aria-label={`${total} enquiries over ${days} days`}>
        {series.map((s) => (
          <span key={s.day} title={`${s.day}: ${s.count}`} style={{ height: `${Math.max(2, (s.count / max) * 100)}%` }} className={s.count ? "has" : ""} />
        ))}
      </div>
      <div className="uc-axis">
        <span>{series[0]?.day.slice(5)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
