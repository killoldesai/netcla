"use client";
import { MegaNavigation } from "./mega-navigation";
import { pillarFor } from "./site-structure";
import React, { useState, useRef } from "react";
import type { Content, Design, DesignNode } from "./content";
import { RichContent } from "./rich-content";
const stepData = {
  discover: [
    "Start with the people and the goal.",
    "Clarify the audience, their tasks and the business need before defining the scope.",
    "Focus: audience, needs and priorities",
  ],
  define: [
    "Turn the brief into a shared plan.",
    "Agree deliverables, responsibilities, dependencies and review milestones.",
    "Focus: scope and delivery expectations",
  ],
  develop: [
    "Make progress you can review.",
    "Work through the agreed priorities and review changes against the brief.",
    "Focus: implementation and feedback",
  ],
  launch: [
    "Prepare for the next stage.",
    "Review acceptance, handover and ongoing needs.",
    "Focus: review and improvement",
  ],
};
const homepageStepData = {
  discover: [
    "A better brief starts with better questions.",
    "Who will use it? What gets in their way? What needs to connect? We start there, then turn the answers into a practical direction.",
    "Focus: users, workflows and business goals",
  ],
  define: [
    "Turn the brief into a shared plan.",
    "Agree what belongs in the project, what comes first and which dependencies need attention. Define responsibilities and milestones before development.",
    "Focus: scope, priorities and delivery expectations",
  ],
  develop: [
    "Make progress you can review.",
    "Develop against the agreed scope and review the work at the milestones defined for your project. Use feedback to keep decisions grounded in the brief.",
    "Focus: development priorities and review points",
  ],
  launch: [
    "Prepare the work for its next chapter.",
    "Review acceptance criteria, plan the handover and discuss the support or improvements your project may need after launch.",
    "Focus: acceptance, handover and ongoing needs",
  ],
};
export function LeadForm({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview: boolean;
}) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string[]>>({});
  const requestId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (!formRef.current) return;
    const service = new URLSearchParams(location.search).get("service");
    const field = formRef.current.querySelector<HTMLInputElement>(
      '[data-service-context="true"]',
    );
    if (service && field && !field.dataset.contextSet) {
      field.value = service.slice(0, 120);
      field.dataset.contextSet = "true";
    }
    for (const element of Array.from(formRef.current.elements)) {
      if (!(
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ))
        continue;
      if (errors[element.name]) {
        element.setAttribute("aria-invalid", "true");
        element.setAttribute("aria-describedby", "lead-error-" + element.name);
      } else {
        element.removeAttribute("aria-invalid");
        element.removeAttribute("aria-describedby");
      }
    }
  }, [errors]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (preview) {
      setStatus("Preview only: no enquiry was sent or saved.");
      return;
    }
    setBusy(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    requestId.current ??= crypto.randomUUID();
    const body: Record<string, unknown> = {
      requestId: requestId.current,
      landingPage: location.pathname,
      referrer: document.referrer,
      utm: Object.fromEntries(
        [...new URLSearchParams(location.search)].filter(([k]) =>
          k.startsWith("utm_"),
        ),
      ),
    };
    fd.forEach((v, k) => {
      body[k] = v;
    });
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) {
        setErrors(data.fields ?? {});
        throw new Error(data.error ?? "Unable to send enquiry");
      }
      setStatus("Your enquiry has been received.");
      if (!data.duplicate) {
        const win = window as unknown as {
          gtag?: (...args: unknown[]) => void;
        };
        win.gtag?.("event", "generate_lead", {
          service: body.service,
          page: location.pathname,
          pillar: pillarFor(location.pathname)?.id ?? "other",
        });
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form ref={formRef} className="form" onSubmit={submit} aria-busy={busy}>
      <fieldset
        disabled={busy}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        {children}
        <label className="honeypot" aria-hidden="true">
          Company URL
          <input name="company_url" tabIndex={-1} autoComplete="off" />
        </label>
      </fieldset>
      {Object.entries(errors).map(([field, msg]) => (
        <p
          className="error"
          role="alert"
          id={"lead-error-" + field}
          key={field}
        >
          {field}: {msg.join(", ")}
        </p>
      ))}
      <p role="status" aria-live="polite" className="form-status">
        {busy ? "Sending your enquiry…" : status}
      </p>
    </form>
  );
}
export function DesignPage({
  design,
  content,
  preview = false,
  allowedPaths = [],
  listing = [],
  linkMap = {},
}: {
  design: Design;
  content: Content;
  preview?: boolean;
  allowedPaths?: string[];
  linkMap?: Record<string, string>;
  listing?: {
    path: string;
    kind: string;
    title: string;
    description: string;
  }[];
}) {
  const [filter, setFilter] = useState("all"),
    [step, setStep] = useState("discover"),
    [projectGoal, setProjectGoal] = useState("product"),
    [motionPaused, setMotionPaused] = useState(false);
  function render(n: DesignNode, key: string): React.ReactNode {
    if (n.slot)
      return (
        <RichContent
          key={key}
          content={content}
          field={`texts.${n.slot}`}
          text={content.texts[n.slot] ?? design.texts[n.slot] ?? ""}
        />
      );
    if (n.text !== undefined) return n.text;
    if (!n.tag) return null;
    if (content.hiddenSections?.includes(n.attrs?.["data-section"] ?? ""))
      return null;
    const a = { ...n.attrs } as Record<string, any>;
    if (a.class) {
      a.className = a.class;
      delete a.class;
    }
    if (
      design.id === "software-led" &&
      a.className?.split(" ").includes("stripe-home")
    )
      a["data-motion-paused"] = String(motionPaused);
    if (a["data-motion-pause"]) {
      a.checked = motionPaused;
      a.onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setMotionPaused(event.target.checked);
    }
    if (a.style) {
      a.style = Object.fromEntries(
        a.style
          .split(";")
          .filter(Boolean)
          .map((s: string) => {
            const [k, ...v] = s.split(":");
            return [
              k
                .trim()
                .replace(/-([a-z])/g, (_: string, l: string) =>
                  l.toUpperCase(),
                ),
              v.join(":").trim(),
            ];
          }),
      );
    }
    delete a.selected;
    delete a.loading;
    if (a.src?.endsWith(".png"))
      a.loading = a.fetchpriority === "high" ? "eager" : "lazy";
    if (a.fetchpriority) {
      a.fetchPriority = a.fetchpriority;
      delete a.fetchpriority;
    }
    if (a["data-category"] && filter !== "all" && a["data-category"] !== filter)
      a.hidden = true;
    if (a["data-filter"]) {
      a["aria-pressed"] = filter === a["data-filter"];
      a.onClick = () => setFilter(a["data-filter"]);
    }
    if (a["data-project-goal"]) {
      a["aria-selected"] = projectGoal === a["data-project-goal"];
      a.tabIndex = projectGoal === a["data-project-goal"] ? 0 : -1;
      a.onClick = () => setProjectGoal(a["data-project-goal"]);
      a.onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const tabs = Array.from(
          event.currentTarget
            .closest('[role="tablist"]')
            ?.querySelectorAll<HTMLButtonElement>("[data-project-goal]") ?? [],
        );
        const index = tabs.indexOf(event.currentTarget);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                tabs.length;
        const target = tabs[next];
        if (target) {
          setProjectGoal(target.dataset.projectGoal!);
          target.focus();
        }
      };
    }
    if (a["data-project-panel"])
      a.hidden = projectGoal !== a["data-project-panel"];
    if (a["data-process-panel"]) a.hidden = step !== a["data-process-panel"];
    if (a["data-step"]) {
      a["aria-pressed"] = step === a["data-step"];
      a.className = "approach-tab" + (step === a["data-step"] ? " active" : "");
      a.onClick = () => setStep(a["data-step"]);
    }
    if (
      n.tag === "a" &&
      a["data-enquiry-fallback"] &&
      !(preview
        ? linkMap[a.href?.split("#")[0]]
        : allowedPaths.includes(a.href?.split("#")[0]))
    ) {
      a.href =
        (preview
          ? linkMap["/hire-developers"]
          : allowedPaths.includes("/hire-developers")
            ? "/hire-developers"
            : undefined) ?? "#contact";
      delete a["data-published-link"];
      a.title = "Discuss this developer role and project requirements";
    }
    if (a["data-service"])
      a.onClick = () => {
        const select = document.querySelector<HTMLSelectElement>("#service");
        if (select) {
          select.value = a["data-service"];
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      };
    if (a["data-track"]) {
      const selectService = a.onClick;
      a.onClick = () => {
        selectService?.();
        if (!preview) {
          const win = window as unknown as {
            gtag?: (...args: unknown[]) => void;
          };
          win.gtag?.("event", a["data-track"], {
            hub: a["data-hub"] ?? "general",
            destination: a.href?.split("?")[0] ?? "form",
          });
        }
      };
    }
    if (
      n.tag === "a" &&
      a["data-published-link"] &&
      !(preview
        ? !!linkMap[a.href?.split("#")[0]]
        : allowedPaths.includes(a.href?.split("#")[0]))
    ) {
      if (a["data-unpublished-text"] === "true")
        return (
          <span key={key} className="planned-topic">
            {n.children?.map((x, i) => render(x, key + "." + i))}
          </span>
        );
      return null;
    }
    if (a["aria-controls"]) a["aria-controls"] = String(a["aria-controls"]);
    if (preview && a.href?.startsWith("/")) {
      const [path, fragment] = a.href.split("#");
      if (linkMap[path])
        a.href = linkMap[path] + (fragment ? "#" + fragment : "");
    }
    if (a.for) {
      a.htmlFor = a.for;
      delete a.for;
    }
    if (a.tabindex) {
      a.tabIndex = Number(a.tabindex);
      delete a.tabindex;
    }
    if (a.autocomplete) {
      a.autoComplete = a.autocomplete;
      delete a.autocomplete;
    }
    if (a.maxlength) {
      a.maxLength = Number(a.maxlength);
      delete a.maxlength;
    }
    if (a.viewbox) {
      a.viewBox = a.viewbox;
      delete a.viewbox;
    }
    for (const [attribute, property] of [
      ["stroke-opacity", "strokeOpacity"],
      ["stroke-dasharray", "strokeDasharray"],
      ["stop-color", "stopColor"],
      ["stop-opacity", "stopOpacity"],
      ["gradientunits", "gradientUnits"],
      ["preserveaspectratio", "preserveAspectRatio"],
    ]) {
      if (a[attribute]) {
        a[property] = a[attribute];
        delete a[attribute];
      }
    }
    if (a["stroke-width"]) {
      a.strokeWidth = a["stroke-width"];
      delete a["stroke-width"];
    }
    for (const attr of ["stroke-linecap", "stroke-linejoin"]) {
      if (a[attr]) {
        a[
          attr.replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())
        ] = a[attr];
        delete a[attr];
      }
    }
    if (a.minlength) {
      a.minLength = Number(a.minlength);
      delete a.minlength;
    }
    for (const flag of ["required", "disabled", "open", "multiple"])
      if (flag in a) a[flag] = true;
    if (!preview && a.className?.split(" ").includes("draft-banner"))
      return null;
    if (
      ["article-grid", "proof-grid"].includes(a.className) &&
      (!preview || listing.length)
    ) {
      const entries = listing.filter(
        (p) =>
          (preview ? !!linkMap[p.path] : allowedPaths.includes(p.path)) &&
          (a.className === "article-grid"
            ? p.kind === "article"
            : p.path.startsWith("/case-studies/")),
      );
      return (
        <div className={a.className} key={key}>
          {entries.map((p) => (
            <a
              className={
                a.className === "article-grid" ? "article-card" : "proof-card"
              }
              href={preview ? (linkMap[p.path] ?? p.path) : p.path}
              key={p.path}
            >
              <div
                className={
                  a.className === "article-grid" ? "article-art" : "proof-art"
                }
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 5h17l9 9v29H12zM29 5v10h9M19 24h12M19 31h12" />
                </svg>
              </div>
              <span>
                {a.className === "article-grid" ? "BUYER GUIDE" : "CASE STUDY"}
              </span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <b>Read more ↗</b>
            </a>
          ))}
        </div>
      );
    }
    if (a.className === "demo-note")
      return (
        <p key={key} className="demo-note">
          {preview
            ? n.children?.map((x, i) => render(x, key + "." + i))
            : "Your information is used to respond to your enquiry."}
        </p>
      );
    if (a.className === "form-status") return null;
    if (
      n.tag === "a" &&
      a.href?.startsWith("/") &&
      !a.href.startsWith("/assets") &&
      !preview &&
      !allowedPaths.includes(a.href.split("#")[0])
    )
      return ["directory-card", "article-card", "proof-card"].includes(
        a.className,
      ) ? null : (
        <span key={key} className={a.className}>
          {n.children?.map((x, i) => render(x, key + "." + i))}
        </span>
      );
    let children = n.children?.map((x, i) => render(x, key + "." + i));
    const blockSlot =
      ["p", "div"].includes(n.tag) && n.children?.length === 1
        ? n.children[0].slot
        : undefined;
    if (blockSlot && content.richText?.[`texts.${blockSlot}`])
      return (
        <div {...a} key={key}>
          <RichContent
            content={content}
            field={`texts.${blockSlot}`}
            text={content.texts[blockSlot] ?? design.texts[blockSlot] ?? ""}
            block
          />
        </div>
      );
    if (["option", "textarea", "title"].includes(n.tag))
      children = n.children?.map((c) =>
        c.slot
          ? (content.texts[c.slot] ?? design.texts[c.slot])
          : (c.text ?? ""),
      );
    if (
      step !== "discover" &&
      ["step-title", "step-description", "step-output"].includes(a.id)
    ) {
      children = [
        (design.id === "software-led" ? homepageStepData : stepData)[
          step as keyof typeof stepData
        ][["step-title", "step-description", "step-output"].indexOf(a.id)],
      ];
    }
    if (n.tag === "form")
      return (
        <LeadForm key={key} preview={preview}>
          {children}
        </LeadForm>
      );
    if (n.tag === "select") {
      a.defaultValue = n.children
        ?.find((c) => c.tag === "option" && c.attrs?.selected !== undefined)
        ?.children?.map((c) =>
          c.slot ? content.texts[c.slot] : (c.text ?? ""),
        )
        .join("");
    }
    if (n.tag === "input" && a.value) {
      a.defaultValue = a.value;
      delete a.value;
    }
    return React.createElement(
      n.tag,
      { ...a, key },
      ...(["img", "input", "br", "hr", "wbr"].includes(n.tag)
        ? []
        : (children ?? [])),
    );
  }
  return <>{design.nodes.map((n, i) => render(n, String(i)))}</>;
}
export function Navigation({
  paths,
  preview = false,
  linkMap = {},
}: {
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  pages?: { path: string; title: string }[];
}) {
  return <MegaNavigation paths={paths} preview={preview} linkMap={linkMap} />;
}
export function Footer({
  paths,
  preview = false,
  linkMap = {},
}: {
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
}) {
  const groups = [
    [
      "Build with us",
      [
        ["/custom-software-development", "Custom software"],
        ["/mobile-app-development", "Mobile applications"],
        ["/ai-development-services", "AI & automation"],
        ["/cloud-services", "Cloud & DevOps"],
        ["/web-application-development", "Web applications"],
        ["/web-development", "Websites"],
      ],
    ],
    [
      "Grow with us",
      [
        ["/seo-services", "SEO services"],
        ["/ppc-services", "PPC & SEM"],
        ["/blog", "Insights"],
      ],
    ],
    [
      "Let’s connect",
      [
        ["/about", "About"],
        ["/contact", "Contact"],
        ["/privacy-policy", "Privacy"],
        ["/design-library", "Design review library"],
      ],
    ],
  ] as const;
  return (
    <footer className="connected-footer">
      <link rel="stylesheet" href="/assets/connected-chrome.css" />
      <div className="wrap">
        <div className="footer-main">
          <div className="footer-brand">
            <a href={linkMap["/"] ?? "/"}>
              <img
                className="footer-logo"
                src="/assets/logo.png"
                alt="Netofficials"
                width="3032"
                height="497"
              />
            </a>
            <p>
              Thoughtful development.
              <br />
              Connected possibilities.
            </p>
            <span>India-based. Working globally.</span>
          </div>
          {groups.map(([title, links]) => (
            <div className="footer-column" key={title}>
              <h3>{title}</h3>
              {links
                .filter(([p]) =>
                  preview
                    ? !Object.keys(linkMap).length || !!linkMap[p]
                    : paths.includes(p),
                )
                .map(([p, t]) => (
                  <a href={linkMap[p] ?? p} key={p}>
                    {t}
                  </a>
                ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Netofficials.</span>
          <span>
            {preview
              ? "Design prototype · Forms do not send enquiries"
              : "Software · Mobile · Web · Search"}
          </span>
        </div>
      </div>
    </footer>
  );
}
