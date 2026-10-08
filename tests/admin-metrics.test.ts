import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  metricSQL,
  dailySeries,
  statusCount,
  type DailyTotal,
  type StatusTotal,
} from "../src/admin-metrics";
test("Admin totals include leads beyond the recent-record cap and all job statuses", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE leads(status text,data jsonb,created_at timestamptz);CREATE TABLE jobs(status text,created_at timestamptz);
 INSERT INTO leads SELECT 'New','{"service":"Website"}'::jsonb,now() FROM generate_series(1,205);
 INSERT INTO leads VALUES ('Qualified','{"service":"Software"}',now());
 INSERT INTO jobs VALUES ('completed',now()),('failed',now()),('cancelled',now()),('running',now());`);
    const leads = (await db.query<StatusTotal>(metricSQL.leads)).rows;
    assert.equal(statusCount(leads, "New"), 205);
    assert.equal(
      leads.reduce((n, r) => n + r.count, 0),
      206,
    );
    assert.equal(
      statusCount(
        (await db.query<StatusTotal>(metricSQL.jobs)).rows,
        "cancelled",
      ),
      1,
    );
    const daily = (await db.query<DailyTotal>(metricSQL.daily)).rows;
    assert.equal(daily[0].leads, 206);
    assert.equal(daily[0].completed, 1);
    assert.equal(daily[0].failed, 1);
    const services = (
      await db.query<{ service: string; count: number }>(metricSQL.services)
    ).rows;
    assert.deepEqual(services, [
      { service: "Website", count: 205 },
      { service: "Software", count: 1 },
    ]);
  } finally {
    await db.close();
  }
});
test("Calendar reporting uses India midnight and fills missing days across previous and current periods", () => {
  const rows = [{ day: "2026-10-05", leads: 3, completed: 2, failed: 0 }];
  const series = dailySeries(rows, 7, new Date("2026-10-04T19:00:00Z"));
  assert.equal(series.length, 14);
  assert.equal(series.at(-1)?.day, "2026-10-05");
  assert.equal(series[0].day, "2026-09-22");
  assert.equal(
    series.slice(7).reduce((n, r) => n + r.leads, 0),
    3,
  );
  assert.equal(
    series.slice(0, 7).reduce((n, r) => n + r.leads, 0),
    0,
  );
  assert.equal(statusCount([], "New"), 0);
});
