ALTER TABLE generated_assets ADD COLUMN source_filename text;
ALTER TABLE generated_assets ADD COLUMN source_hash text;
ALTER TABLE generated_assets ADD COLUMN source_mime text;
ALTER TABLE pipeline_tasks ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX pipeline_tasks_poll ON pipeline_tasks(status,next_attempt_at,lease_until);
CREATE INDEX applications_retention ON career_applications(created_at);
CREATE INDEX outbox_delivery ON email_outbox(status,next_attempt_at);
