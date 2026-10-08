-- Stage 2 pipeline: a page-strategy "brief" task runs before sections,
-- failed tasks retry automatically with backoff, and tasks record notes.
ALTER TABLE pipeline_tasks DROP CONSTRAINT IF EXISTS pipeline_tasks_kind_check;
ALTER TABLE pipeline_tasks ADD CONSTRAINT pipeline_tasks_kind_check CHECK (kind IN ('blueprint','brief','section','asset'));
ALTER TABLE pipeline_tasks ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE pipeline_tasks ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS prompt_version text;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS instruction text;
CREATE INDEX IF NOT EXISTS pipeline_tasks_ready ON pipeline_tasks(status, next_attempt_at);
