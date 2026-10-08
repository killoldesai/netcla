-- The legacy single-call "jobs" engine is retired; all generation runs through
-- pipeline_runs / pipeline_tasks. Job history stays readable.
UPDATE jobs
SET status = 'cancelled',
    stage = 'cancelled',
    error = 'Legacy generation engine retired',
    updated_at = now()
WHERE status IN ('queued', 'running');
