"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SiteIcon, iconFor } from "./icon-set";
import { TechIcon } from "./brand-icon";
import {
  pillar,
  pillarGroups,
  pillars,
  sitePage,
  sitePages,
  type PillarId,
  type SitePage,
} from "./site-structure";

export type MegaNavigationProps = {
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  homeHref?: string;
  contactHref?: string;
};

type MenuKey = "services" | "hire" | "industries" | "resources" | "company";
const menus: { key: MenuKey; label: string }[] = [
  { key: "services", label: "Services" },
  { key: "hire", label: "Hire Developers" },
  { key: "industries", label: "Industries" },
  { key: "resources", label: "Resources" },
  { key: "company", label: "Company" },
];
const servicePillars = pillars.filter((p) => p.inServicesMenu);
// Fixed icons where the label alone is ambiguous; everything else resolves
// through the shared icon rules so the menu matches the rest of the site.
const pageIcons: Record<string, string> = {
  "/healthcare-software-development": "health",
  "/fintech-software-development": "bank",
  "/insurtech-software-development": "umbrella",
  "/edtech-software-development": "book",
  "/real-estate-software-development": "building",
  "/logistics-software-development": "truck",
  "/retail-software-development": "bag",
  "/travel-software-development": "map",
  "/legaltech-software-development": "scale",
  "/hrtech-software-development": "users",
  "/manufacturing-software-development": "factory",
  "/blog": "book",
  "/case-studies": "chart",
  "/portfolio": "layers",
  "/faq": "chat",
  "/about": "building",
  "/how-we-work": "workflow",
  "/engagement-models": "puzzle",
  "/why-choose-netofficials": "check",
  "/careers": "users",
  "/contact": "inbox",
  "/saas-development-services": "layers",
  "/enterprise-software-development": "building",
  "/erp-development-services": "database",
  "/crm-development-services": "users",
  "/digital-transformation-services": "sync",
  "/blockchain-development-services": "link",
  "/ar-vr-development-services": "eye",
  "/mvp-development-services": "rocket",
  "/startup-software-development": "spark",
  "/product-development-services": "target",
  "/white-label-software-development": "puzzle",
  "/software-development-outsourcing": "workflow",
  "/software-outsourcing-services": "settings",
  "/offshore-software-development": "globe",
  "/dedicated-development-team": "users",
  "/it-staff-augmentation": "puzzle",
};
const pillarIcons: Partial<Record<PillarId, string>> = {
  software: "code",
  mobile: "mobile",
  ai: "spark",
  cloud: "cloud",
  web: "web",
  marketing: "megaphone",
};
// The label decides the icon; the blurb only breaks ties, so "delivery" in a
// description can't turn a service into a truck.
const lineIcon = (page: SitePage) => (
  <SiteIcon name={pageIcons[page.path] ?? (page.type === "location" ? "pin" : iconFor(page.label, page.blurb))} />
);
// "React developers" → "React", so role links reuse the technology's brand mark.
const roleTech = (label: string) => label.replace(/\s+(developers?|engineers?|designers?|scientists?)$/i, "");
const acronyms = /\b(seo|sem|ppc|b2b|b2c|cms|ai|ml|ui|ux|api|saas|mvp|crm|erp|iot|aws|gcp|qa)\b/gi;
const guideTitle = (path: string) => {
  const text = path.replace(/^\/blog\//, "").replaceAll("-", " ");
  return (text[0].toUpperCase() + text.slice(1))
    .replace(acronyms, (m) => m.toUpperCase())
    .replace(/\bindia\b/g, "India")
    .replace(/\bwordpress\b/g, "WordPress");
};
const footers: Record<MenuKey, { label: string; path: string }> = {
  services: { label: "View all services", path: "/services" },
  hire: { label: "All developer roles", path: "/hire-developers" },
  industries: { label: "All industries", path: "/industries" },
  resources: { label: "All guides", path: "/blog" },
  company: { label: "About Netofficials", path: "/about" },
};
const pages = (...paths: string[]) =>
  paths.map((path) => sitePage(path)).filter((x): x is SitePage => !!x);
const resources = pages("/blog", "/case-studies", "/portfolio", "/faq");
const company = pages("/about", "/how-we-work", "/engagement-models", "/why-choose-netofficials", "/careers", "/contact");
const locations = sitePages.filter((p) => p.type === "location");
const HOVER_DELAY = 150;

// Which top-level menu holds a path, for the "you are here" marker.
function menuOf(path: string): MenuKey | null {
  if (!path) return null;
  if (path.startsWith("/blog") || ["/case-studies", "/portfolio", "/faq"].includes(path)) return "resources";
  const page = sitePage(path);
  if (!page) return null;
  if (page.type === "industry" || path === "/industries") return "industries";
  if (page.pillar === "hire") return "hire";
  if (page.type === "location" || page.type === "company") return "company";
  return page.pillar ? "services" : null;
}

type Gtag = { gtag?: (...args: unknown[]) => void };

export function MegaNavigation(props: MegaNavigationProps) {
  const [active, setActive] = useState<MenuKey | null>(null);
  const [rail, setRail] = useState<PillarId>(servicePillars[0].id);
  const [hireGroup, setHireGroup] = useState(0);
  const [mobile, setMobile] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId().replaceAll(":", "");
  // The page being viewed, so its link (and the menu holding it) is marked.
  const [current, setCurrent] = useState("");
  useEffect(() => setCurrent(window.location.pathname.replace(/\/$/, "") || "/"), []);

  // Planned pages stay out of navigation until they are published.
  const href = (path: string): string | undefined =>
    props.preview
      ? props.linkMap?.[path]
      : props.paths.includes(path)
        ? path
        : undefined;
  const live = (list: SitePage[]) => list.filter((page) => href(page.path));
  const contact = props.contactHref ?? href("/contact") ?? "/contact";
  // On-page anchors (the homepage form) can't carry a query string.
  const contactFor = (service: string) =>
    contact.startsWith("#") ? contact : `${contact}?service=${encodeURIComponent(service)}`;

  const close = () => {
    clearTimeout(timer.current);
    setActive(null);
    setMobile(false);
  };
  const hoverOpen = (key: MenuKey, button: HTMLButtonElement) => {
    if (mobile || window.matchMedia("(hover: none)").matches) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastTrigger.current = button;
      setActive(key);
    }, HOVER_DELAY);
  };
  const hoverClose = () => {
    if (mobile) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), HOVER_DELAY * 2);
  };

  useEffect(() => {
    const pointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (mobile || root.current?.querySelector('[aria-expanded="true"]'))) {
        setActive(null);
        if (mobile) {
          setMobile(false);
          toggle.current?.focus();
        } else lastTrigger.current?.focus();
      }
      if (event.key === "Tab" && mobile && root.current) {
        const items = Array.from(
          root.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"),
        ).filter((el) => el.getClientRects().length);
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", key);
      if (mobile) document.body.style.overflow = old;
    };
  }, [mobile]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width:1081px)");
    const reset = () => close();
    desktop.addEventListener("change", reset);
    return () => {
      desktop.removeEventListener("change", reset);
      clearTimeout(timer.current);
    };
  }, []);

  const trackQuote = (hub: string) => {
    close();
    if (!props.preview)
      (window as unknown as Gtag).gtag?.("event", "consultation_click", { hub, destination: "/contact" });
  };

  // Vertical tabs: arrow keys move between rail items, as in a tablist.
  const railKeys = (count: number, index: number, select: (i: number) => void) =>
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = (index + step + count) % count;
      select(next);
      const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]");
      buttons?.[next]?.focus();
    };

  // Panels are called as plain functions, not mounted as components, so the
  // rail buttons keep their DOM nodes (and keyboard focus) across re-renders.
  function item(page: SitePage, opts: { icon?: ReactNode; blurb?: boolean } = {}) {
    const link = href(page.path);
    if (!link) return null;
    const here = current === page.path;
    return (
      <a
        className={"nm-item-link" + (opts.blurb === false ? " nm-item-compact" : "") + (here ? " is-current" : "")}
        href={link}
        onClick={close}
        key={page.path}
        aria-current={here ? "page" : undefined}
      >
        <span className="nm-item-icon" aria-hidden="true">
          {opts.icon ?? lineIcon(page)}
        </span>
        <span>
          <strong>{page.label}</strong>
          {opts.blurb !== false && <small>{page.blurb}</small>}
        </span>
      </a>
    );
  }

  // The same call-to-action card closes every panel.
  function aside(kicker: string, title: string, text: string, cta: string, service: string, hub: string) {
    return (
      <aside className="nm-aside">
        <p className="nm-kicker">{kicker}</p>
        <h3>{title}</h3>
        <p>{text}</p>
        <a className="nm-aside-cta" href={contactFor(service)} data-track="consultation_click" onClick={() => trackQuote(hub)}>
          {cta} <span aria-hidden="true">→</span>
        </a>
      </aside>
    );
  }

  function servicesPanel() {
    const selectedPillar = pillar(rail);
    const index = servicePillars.findIndex((p) => p.id === rail);
    return (
      <>
        <div className="nm-rail" role="tablist" aria-orientation="vertical" aria-label="Service areas">
          {servicePillars.map((p) => (
            <button
              key={p.id}
              role="tab"
              id={`${id}-tab-${p.id}`}
              aria-selected={p.id === rail}
              aria-controls={`${id}-pane-${p.id}`}
              tabIndex={p.id === rail ? 0 : -1}
              className={p.id === rail ? "is-selected" : ""}
              onClick={() => setRail(p.id)}
              onPointerEnter={() => setRail(p.id)}
              onKeyDown={railKeys(servicePillars.length, index, (n) => setRail(servicePillars[n].id))}
            >
              <span className="nm-rail-icon" aria-hidden="true">
                <SiteIcon name={pillarIcons[p.id] ?? "code"} />
              </span>
              <span>
                <strong>{p.label}</strong>
                <small>{p.blurb}</small>
              </span>
            </button>
          ))}
        </div>
        {/* Every pane is rendered (inactive ones hidden) so all links are crawlable. */}
        {servicePillars.map((p) => {
          const hub = href(p.hub);
          const groups = pillarGroups(p.id)
            .map((g) => ({ ...g, pages: live(g.pages) }))
            .filter((g) => g.pages.length);
          return (
            <div
              key={p.id}
              className="nm-main"
              role="tabpanel"
              id={`${id}-pane-${p.id}`}
              aria-labelledby={`${id}-tab-${p.id}`}
              hidden={p.id !== rail}
            >
              <div className="nm-main-head">
                <p className="nm-kicker">{p.label}</p>
                {hub && (
                  <a href={hub} onClick={close}>
                    {p.label} overview <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
              {groups.length ? (
                <div className="nm-groups">
                  {groups.map((g) => (
                    <section key={g.group}>
                      <h3>{g.group}</h3>
                      {g.group === "Technologies" ? (
                        <div className="nm-compact">
                          {g.pages.map((page) => (
                            <a key={page.path} href={href(page.path)} onClick={close} aria-current={current === page.path ? "page" : undefined}>
                              <TechIcon name={page.label} className="nm-chip-icon" eager />
                              {page.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        g.pages.map((page) => item(page, { icon: <TechIcon name={page.label} context={g.group} className="nm-brand" eager /> }))
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <p className="nm-empty">Pages for this area are being prepared. Tell us what you need and we&apos;ll scope it with you.</p>
              )}
            </div>
          );
        })}
        {aside(
          "Start a project",
          "Get a scoped estimate",
          "Share a short brief. We reply with questions, an initial scope and the team your project needs.",
          `Discuss ${selectedPillar.label.toLowerCase()}`,
          selectedPillar.service,
          `navigation-${selectedPillar.id}`,
        )}
      </>
    );
  }

  // One scannable panel: engagement options on the left, every role grouped
  // by stack with its technology's mark, so nothing hides behind a tab.
  function hirePanel() {
    const groups = pillarGroups("hire")
      .map((g) => ({ ...g, pages: live(g.pages) }))
      .filter((g) => g.pages.length);
    const engagement = groups.find((g) => g.group === "Engagement");
    const roles = groups.filter((g) => g !== engagement);
    const hub = href("/hire-developers");
    if (!groups.length) return <div className="nm-main nm-span"><p className="nm-empty">Developer role pages are being prepared.</p></div>;
    return (
      <>
        <div className="nm-rail nm-feature">
          <p className="nm-kicker">Ways to engage</p>
          {(engagement?.pages ?? []).map((page) => item(page))}
          {hub && (
            <a className="nm-feature-link" href={hub} onClick={close}>
              How hiring works <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
        <div className="nm-main">
          <div className="nm-main-head">
            <p className="nm-kicker">Hire by role</p>
            {hub && (
              <a href={hub} onClick={close}>
                All developer roles <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
          <div className="nm-groups nm-roles">
            {roles.map((g) => (
              <section key={g.group}>
                <h3>{g.group}</h3>
                {g.pages.map((page) =>
                  item(page, { blurb: false, icon: <TechIcon name={roleTech(page.label)} context={g.group} className="nm-brand" eager /> }),
                )}
              </section>
            ))}
          </div>
        </div>
        {aside(
          "Hiring",
          "Tell us the role",
          "Describe your stack, team and timeline. We confirm availability and engagement terms during the enquiry.",
          "Discuss your hiring needs",
          pillar("hire").service,
          "navigation-hire",
        )}
      </>
    );
  }

  type Column = { title: string; pages: SitePage[]; cols?: number; compact?: boolean };
  function listPanel(columns: Column[], side: ReactNode, extra?: ReactNode) {
    const visible = columns.map((c) => ({ ...c, pages: live(c.pages) })).filter((c) => c.pages.length);
    return (
      <>
        <div className="nm-main nm-span">
          {visible.length ? (
            <div className="nm-columns">
              {visible.map((column) => (
                <section key={column.title} style={{ gridColumn: `span ${column.cols ?? 1}` }}>
                  <h3>{column.title}</h3>
                  <div className="nm-grid" style={{ gridTemplateColumns: `repeat(${column.cols ?? 1}, minmax(0, 1fr))` }}>
                    {column.pages.map((page) => item(page, { blurb: !column.compact }))}
                  </div>
                </section>
              ))}
              {extra}
            </div>
          ) : (
            <p className="nm-empty">These pages are being prepared.</p>
          )}
        </div>
        {side}
      </>
    );
  }

  function guidesColumn() {
    const guides = props.paths.filter((p) => p.startsWith("/blog/")).slice(0, 4);
    if (!guides.length || props.preview) return null;
    return (
      <section className="nm-guides" style={{ gridColumn: "span 3" }}>
        <h3>Latest guides</h3>
        <div className="nm-guide-list">
          {guides.map((path) => (
            <a key={path} className="nm-guide" href={path} onClick={close} aria-current={current === path ? "page" : undefined}>
              <span className="nm-guide-kicker">Guide</span>
              <strong>{guideTitle(path)}</strong>
            </a>
          ))}
        </div>
      </section>
    );
  }

  function panel(menu: MenuKey) {
    const industries = sitePages.filter((p) => p.type === "industry");
    return (
      <div
        className={`nm-panel nm-panel-${menu}`}
        id={`${id}-${menu}`}
        hidden={active !== menu}
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={hoverClose}
      >
        <div className="nm-panel-inner">
          {menu === "services" && servicesPanel()}
          {menu === "hire" && hirePanel()}
          {menu === "industries" &&
            listPanel(
              [{ title: "Industries we build for", pages: industries, cols: 4 }],
              aside(
                "Industry projects",
                "Built around your workflows",
                "Tell us your sector, systems and compliance needs. We scope integrations and data handling up front.",
                "Discuss your industry project",
                pillar("software").service,
                "navigation-industries",
              ),
            )}
          {menu === "resources" &&
            listPanel(
              [{ title: "Learn", pages: resources, cols: 1 }],
              aside(
                "Planning a project?",
                "Get a scoped estimate",
                "Use our guides to frame the brief, then share it with us for an initial scope and team plan.",
                "Request an estimate",
                pillar("software").service,
                "navigation-resources",
              ),
              guidesColumn(),
            )}
          {menu === "company" &&
            listPanel(
              [
                { title: "Company", pages: company, cols: 2 },
                { title: "Where we work", pages: locations, cols: 2, compact: true },
              ],
              aside(
                "Talk to us",
                "Book a 30-minute call",
                "Meet an engineer, walk through your goals and leave with clear next steps.",
                "Book a call",
                pillar("software").service,
                "navigation-company",
              ),
            )}
        </div>
        <div className="nm-footer">
          <span>Not sure where to start?</span>
          <a href={contact} onClick={() => trackQuote("navigation-footer")}>
            Talk to an engineer <span aria-hidden="true">→</span>
          </a>
          {href(footers[menu].path) && (
            <a className="nm-footer-all" href={href(footers[menu].path)} onClick={close}>
              {footers[menu].label} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <a className="nm-skip" href="#main">
        Skip to content
      </a>
      <header
        className={"nm-header" + (mobile ? " nm-mobile-open" : "") + (active ? " nm-has-open" : "")}
        ref={root}
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile ? true : undefined}
        aria-label={mobile ? "Website navigation" : undefined}
        onBlur={(event) => {
          if (!mobile && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
            setActive(null);
        }}
      >
        <link rel="stylesheet" href="/assets/mega-navigation.css" />
        <div className="nm-bar">
          <a className="nm-logo" href={props.homeHref ?? href("/") ?? "/"} aria-label="Netofficials home">
            <img src="/assets/logo.png" alt="Netofficials" width={168} height={28} />
          </a>
          <button
            className="nm-toggle"
            ref={toggle}
            aria-expanded={mobile}
            aria-controls={`${id}-navigation`}
            onClick={() => {
              setMobile(!mobile);
              setActive(null);
            }}
          >
            {mobile ? "Close" : "Menu"}
          </button>
          <div className="nm-drawer">
            <nav id={`${id}-navigation`} aria-label="Main navigation">
              <ul className="nm-items">
                {menus.map((menu) => (
                  <li className="nm-item" key={menu.key} onPointerLeave={hoverClose}>
                    <button
                      className={"nm-trigger" + (active === menu.key ? " is-open" : "") + (menuOf(current) === menu.key ? " is-current" : "")}
                      aria-expanded={active === menu.key}
                      aria-controls={`${id}-${menu.key}`}
                      onPointerEnter={(event) => hoverOpen(menu.key, event.currentTarget)}
                      onClick={(event) => {
                        clearTimeout(timer.current);
                        lastTrigger.current = event.currentTarget;
                        setActive(active === menu.key ? null : menu.key);
                      }}
                    >
                      {menu.label}
                      <svg viewBox="0 0 12 12" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="m3 4.5 3 3 3-3" />
                      </svg>
                    </button>
                    {panel(menu.key)}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="nm-actions">
              <a className="nm-link" href={contact} onClick={close}>
                Contact
              </a>
              <a className="nm-cta" href={contact} data-track="consultation_click" onClick={() => trackQuote("navigation")}>
                Get a quote
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
