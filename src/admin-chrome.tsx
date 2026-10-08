export function AdminIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    Pages: 'M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h6',
    Production: 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
    "Review queue": 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
    "Site map": "M12 3v6 M4 14v-5h16v5 M2 15h5v6H2z M9 15h6v6H9z M17 15h5v6h-5z",
    Media: 'M3 4h18v16H3z M3 16l5-5 5 5 4-4 4 4 M16 8h.01',
    Newsletter: 'M3 5h18v14H3z M3 5l9 7 9-7',
    Careers: 'M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3',
    Dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    Content: "M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h6",
    "Site Plan":
      "M12 3v6 M4 14v-5h16v5 M2 15h5v6H2z M9 15h6v6H9z M17 15h5v6h-5z",
    Generation: "M13 2L4 14h7l-1 8 10-13h-7z",
    Publishing: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5",
    Research: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6",
    Leads:
      "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 4a4 4 0 0 1 0 8 M22 21v-3a4 4 0 0 0-3-4",
    Settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? "M3 12h18"} />
    </svg>
  );
}
export const adminDescriptions: Record<string, string> = {
  Content: "Manage drafts, published pages and every revision in one place.",
  "Site Plan":
    "Track content production by category, source file and publication status.",
  Generation:
    "Follow AI writing jobs, inspect results and resolve failed attempts.",
  Publishing:
    "Generate revised page content and illustrations, review assets, and manage newsletter and careers.",
  Research: "Keep optional sources and company notes for content writing.",
  Leads: "Review enquiries, qualify opportunities and keep follow-up notes.",
  Settings:
    "Choose your AI provider and manage the website’s operational settings.",
};
export function AdminEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="admin-empty-card">
      <div className="admin-empty-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
