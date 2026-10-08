import { query } from "./db";
import {
  metricSQL,
  type AdminMetrics,
  type StatusTotal,
  type DailyTotal,
} from "./admin-metrics";
export async function adminMetrics(): Promise<AdminMetrics> {
  const [leadStatuses, jobStatuses, services, daily] = await Promise.all([
    query<StatusTotal>(metricSQL.leads),
    query<StatusTotal>(metricSQL.jobs),
    query<{ service: string; count: number }>(metricSQL.services),
    query<DailyTotal>(metricSQL.daily),
  ]);
  return {
    leadStatuses,
    jobStatuses,
    services,
    daily,
    generatedAt: new Date().toISOString(),
  };
}
