"use client";
import { useState } from "react";
import { Icon } from "./site/ui";
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
export function NewsletterForm({ enabled }: { enabled: boolean }) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
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
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!enabled || busy}
        />
      </label>
      <button type="submit" className="v3-button" disabled={!enabled || busy}>
        {busy ? "Sending…" : "Subscribe"}
      </button>
      <p role="status">
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
      <div className="v3-vacancies role-empty">
        <p className="role-empty__text">There are no open positions listed at the moment.</p>
      </div>
    );
  return (
    <ul className="v3-vacancies role-list">
      {vacancies.map((v) => {
        const href = preview ? "#open-roles" : "/careers/" + v.slug;
        return (
          <li key={v.id} className="role-row">
            <div className="role-row__main">
              <h3 className="role-row__title">{v.title}</h3>
              <p className="role-row__team">{v.department}</p>
              <div className="role-row__badges">
                {v.location && (
                  <span className="nx-badge">
                    <span className="nx-badge__dot" aria-hidden="true" />
                    {v.location}
                  </span>
                )}
                {v.employment_type && (
                  <span className="nx-badge nx-badge--lime">
                    <span className="nx-badge__dot" aria-hidden="true" />
                    {v.employment_type}
                  </span>
                )}
              </div>
            </div>
            <a className="nx-arrowlink role-row__link" href={href}>
              <span>View role</span>
              <Icon name="arrow-right" size={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
