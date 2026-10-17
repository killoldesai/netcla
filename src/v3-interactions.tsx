"use client";
import { useState } from "react";
import { V2Icon as Icon } from "./site/v2/ui";
export function TrackedLink({
  href,
  event,
  service,
  className,
  children,
}: {
  href: string;
  event: string;
  service: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        const analytics = window as unknown as {
          gtag?: (...args: unknown[]) => void;
        };
        analytics.gtag?.("event", event, {
          service,
          destination: href.split("?")[0],
        });
      }}
    >
      {children}
    </a>
  );
}
export function NewsletterForm({ enabled, note }: { enabled: boolean; note?: string }) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="news__form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!enabled || busy) return;
        setBusy(true);
        try {
          const email = new FormData(e.currentTarget).get("email");
          const r = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const result = await r.json();
          setStatus(result.message || result.error);
        } catch {
          setStatus("Please try again later.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!enabled || busy}
          />
        </label>
      </div>
      <button type="submit" className="btn btn--violet" disabled={!enabled || busy}>
        {busy ? "Sending…" : "Subscribe"}
      </button>
      {note && <p className="news__note">{note}</p>}
      <p role="status" className="news__note">
        {status ||
          (enabled
            ? "Confirm your subscription by email. Unsubscribe at any time."
            : "Newsletter signup is not available yet.")}
      </p>
    </form>
  );
}
export function VacancyDirectory({
  vacancies,
  preview,
}: {
  vacancies: {
    id: string;
    slug: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
  }[];
  preview: boolean;
}) {
  if (!vacancies.length)
    return (
      <div className="cat cat--fill careers-empty" style={{ background: "var(--p-sky)" }}>
        <h3>There are no open positions listed at the moment.</h3>
      </div>
    );
  return (
    <div className="catgrid catgrid--2 careers-roles">
      {vacancies.map((v) => {
        const href = preview ? "#open-roles" : "/careers/" + v.slug;
        return (
          <a key={v.id} className="cat rv" href={href}>
            {v.department && (
              <span className="cat__tag">
                <i aria-hidden="true" />
                {v.department}
              </span>
            )}
            <h3>{v.title}</h3>
            {(v.location || v.employment_type) && <p>{[v.location, v.employment_type].filter(Boolean).join(" · ")}</p>}
            <span className="more">
              View role <Icon name="arrow" />
            </span>
          </a>
        );
      })}
    </div>
  );
}
