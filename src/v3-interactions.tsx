"use client";
import { useState } from "react";
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
  return (
    <div className="v3-vacancies">
      {vacancies.length ? (
        vacancies.map((v) => (
          <article key={v.id}>
            <div>
              <h3>{v.title}</h3>
              <p>
                {v.department} · {v.location} · {v.employment_type}
              </p>
            </div>
            <a href={preview ? "#open-roles" : "/careers/" + v.slug}>
              View role ↗
            </a>
          </article>
        ))
      ) : (
        <p>There are no open positions listed at the moment.</p>
      )}
    </div>
  );
}
