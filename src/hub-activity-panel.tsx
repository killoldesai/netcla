import { useId } from "react";

export type ActivityIcon = "phone" | "check" | "code" | "cloud";
export type ActivityMetric = { value: string; label: string };
export type ActivityRow = {
  icon: ActivityIcon;
  title: string;
  subtitle: string;
  status: string;
  tone?: "ready" | "review";
};
export type ActivityPanelContent = {
  metrics: [ActivityMetric, ActivityMetric, ActivityMetric];
  rows: [ActivityRow, ActivityRow, ActivityRow, ActivityRow];
  technologies: [string, string, string];
};
function ActivityIcon({ name }: { name: ActivityIcon }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {name === "phone" ? (
        <>
          <rect x="5" y="1.5" width="10" height="17" rx="2" />
          <path d="M8 4h4m-3 12h2" />
        </>
      ) : name === "check" ? (
        <>
          <circle cx="10" cy="10" r="7" />
          <path d="m6.5 10 2.5 2.5 4.5-5" />
        </>
      ) : name === "code" ? (
        <path d="m6 5-4 5 4 5m8-10 4 5-4 5m-3-12-2 14" />
      ) : (
        <path d="M5 15a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4.5 4.5 0 0 1 15 15H5Z" />
      )}
    </svg>
  );
}
export function HubActivityPanel({
  name,
  metrics,
  rows,
  technologies,
  servicesHref,
}: ActivityPanelContent & { name: string; servicesHref: string }) {
  const patternId = `activity-dots-${useId().replaceAll(":", "")}`;
  return (
    <figure
      className="hub-activity-visual"
      aria-label={`Illustrative ${name} workflow, not live project data`}
    >
      <svg
        className="activity-dot-grid"
        aria-hidden="true"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={patternId}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#e5edf5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="activity-panel">
        <div className="activity-topbar">
          <span className="activity-hub-tag">{name}</span>
          <span className="activity-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="activity-metrics">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <span className="activity-metric-value">{metric.value}</span>
              <span className="activity-metric-label">{metric.label}</span>
            </div>
          ))}
        </div>
        <ul className="activity-feed">
          {rows.map((row) => (
            <li key={row.title}>
              <span className="activity-row-icon">
                <ActivityIcon name={row.icon} />
              </span>
              <div className="activity-row-copy">
                <span className="activity-row-title">{row.title}</span>
                <span className="activity-row-subtitle">{row.subtitle}</span>
              </div>
              <span
                className={`activity-status ${row.tone ? `activity-status-${row.tone}` : ""}`}
              >
                {row.tone && <i aria-hidden="true" />}
                {row.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="activity-bottom">
          <ul className="activity-tech-pills">
            {technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <a href={servicesHref}>
            View all services <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <figcaption>Illustrative workflow · not live project data</figcaption>
    </figure>
  );
}
