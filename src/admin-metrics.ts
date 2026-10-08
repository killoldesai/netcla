export type StatusTotal = { status: string; count: number };
export type DailyTotal = {
  day: string;
  leads: number;
  completed: number;
  failed: number;
};
export type AdminMetrics = {
  leadStatuses: StatusTotal[];
  jobStatuses: StatusTotal[];
  services: { service: string; count: number }[];
  daily: DailyTotal[];
  generatedAt: string;
};
export const metricSQL = {
  leads: "SELECT status,count(*)::int AS count FROM leads GROUP BY status",
  jobs: "SELECT status,count(*)::int AS count FROM jobs GROUP BY status",
  services:
    "SELECT COALESCE(NULLIF(data->>'service',''),'Unspecified') AS service,count(*)::int AS count FROM leads GROUP BY 1 ORDER BY count DESC,service LIMIT 8",
  daily: `SELECT day::text, SUM(leads)::int AS leads,SUM(completed)::int AS completed,SUM(failed)::int AS failed FROM (
    SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date AS day,count(*) AS leads,0 AS completed,0 AS failed FROM leads
    WHERE created_at >= ((now() AT TIME ZONE 'Asia/Kolkata')::date - 59) AT TIME ZONE 'Asia/Kolkata' GROUP BY 1
    UNION ALL
    SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date AS day,0 AS leads,count(*) FILTER (WHERE status='completed') AS completed,count(*) FILTER (WHERE status='failed') AS failed FROM jobs
    WHERE created_at >= ((now() AT TIME ZONE 'Asia/Kolkata')::date - 59) AT TIME ZONE 'Asia/Kolkata' GROUP BY 1
  ) activity GROUP BY day ORDER BY day`,
};
export const statusCount = (rows: StatusTotal[], status: string) =>
  rows.find((r) => r.status === status)?.count ?? 0;
export function dailySeries(
  rows: DailyTotal[],
  days: number,
  now = new Date(),
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const end = new Date(today + "T00:00:00Z");
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days * 2 }, (_, i) => {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - days * 2 + i + 1);
    const day = d.toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, leads: 0, completed: 0, failed: 0 };
  });
}
