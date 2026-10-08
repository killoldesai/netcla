"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteIcon } from "../icon-set";
import { useAdminData } from "../admin-console";
import { pageStage } from "./site-map";

type Item = { key: string; label: string; href: string; icon: string };
const groups: { label: string; items: Item[] }[] = [
  { label: "Overview", items: [{ key: "dashboard", label: "Dashboard", href: "/admin", icon: "home" }] },
  {
    label: "Content",
    items: [
      { key: "sitemap", label: "Site map", href: "/admin/sitemap", icon: "workflow" },
      { key: "generation", label: "Generation", href: "/admin/generation", icon: "spark" },
      { key: "production", label: "Review queue", href: "/admin/production", icon: "check" },
      { key: "pages", label: "All pages", href: "/admin/pages", icon: "document" },
      { key: "media", label: "Media", href: "/admin/media", icon: "image" },
    ],
  },
  {
    label: "Growth",
    items: [
      { key: "leads", label: "Leads", href: "/admin/leads", icon: "inbox" },
      { key: "newsletter", label: "Newsletter", href: "/admin/newsletter", icon: "megaphone" },
      { key: "careers", label: "Careers", href: "/admin/careers", icon: "users" },
    ],
  },
  { label: "System", items: [{ key: "settings", label: "Settings", href: "/admin/settings", icon: "settings" }] },
];

/** Admin navigation with live counts and a remembered collapsed (icons-only) mode. */
export function AdminSidebar({
  section,
  open,
  close,
  collapsed,
  setCollapsed,
}: {
  section: string;
  open: boolean;
  close: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const overview = useAdminData("overview", "days=30", 60000);
  const sitemap = useAdminData("sitemap", "", 60000);
  const c = overview.data?.counts;
  const drafts = (sitemap.data?.pages ?? []).filter((r: any) => r.version === "3" && pageStage(r) === "Needs review").length;
  const generating = (sitemap.data?.pages ?? []).filter((r: any) => pageStage(r) === "Generating").length;
  const badges: Record<string, { n: number; tone?: "alert" | "info" }> = {
    sitemap: { n: drafts },
    generation: c?.failed_tasks ? { n: c.failed_tasks, tone: "alert" } : { n: generating, tone: "info" },
    media: { n: c?.asset_reviews ?? 0 },
    leads: { n: c?.unprocessed ?? 0, tone: "alert" },
  };

  return (
    <aside className={"uc-sidebar" + (open ? " uc-open" : "")} aria-label="Admin navigation">
      <div className="uc-side-head">
        <Link className="uc-brand" href="/admin" onClick={close}>
          <img src="/assets/logo.png" alt="Netofficials" />
          <span>Admin</span>
        </Link>
        <button
          className="uc-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SiteIcon name="collapse" />
        </button>
      </div>
      <div className="uc-side-scroll">
        {groups.map((group) => (
          <div key={group.label} className="uc-side-group">
            <p className="uc-nav-label">{group.label}</p>
            <nav aria-label={group.label}>
              {group.items.map((item) => {
                const badge = badges[item.key];
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={section === item.key ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    onClick={close}
                  >
                    <SiteIcon name={item.icon} />
                    <span className="uc-nav-text">{item.label}</span>
                    {badge && badge.n > 0 && (
                      <span className={"uc-nav-badge" + (badge.tone ? " " + badge.tone : "")}>{badge.n > 999 ? "999+" : badge.n}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="uc-side-foot">
        <a className="uc-side-link" href="/" target="_blank" rel="noreferrer" title="View website">
          <SiteIcon name="globe" />
          <span className="uc-nav-text">View website</span>
        </a>
        <div className="uc-profile">
          <span className="uc-avatar">N</span>
          <span className="uc-nav-text">
            <strong>Owner</strong>
            <small>Netofficials admin</small>
          </span>
          <button
            className="uc-signout"
            title="Sign out"
            aria-label="Sign out"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              location.assign("/admin/login");
            }}
          >
            <SiteIcon name="logout" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Remembers the collapsed preference per browser. */
export function useSidebarCollapsed(): [boolean, (v: boolean) => void] {
  const [collapsed, set] = useState(false);
  useEffect(() => {
    try {
      set(localStorage.getItem("uc-sidebar-collapsed") === "1");
    } catch {}
  }, []);
  return [
    collapsed,
    (v) => {
      set(v);
      try {
        localStorage.setItem("uc-sidebar-collapsed", v ? "1" : "0");
      } catch {}
    },
  ];
}
