ALTER TABLE pipeline_runs ADD COLUMN scope text NOT NULL DEFAULT 'page' CHECK(scope IN ('page','sections','image'));
ALTER TABLE pipeline_runs ADD COLUMN selected_sections jsonb NOT NULL DEFAULT '[]';
ALTER TABLE pipeline_runs ADD COLUMN cancelled_at timestamptz;
CREATE INDEX IF NOT EXISTS pages_admin_updated ON pages(updated_at DESC,id);
CREATE INDEX IF NOT EXISTS leads_admin_created ON leads(created_at DESC,id);
CREATE INDEX IF NOT EXISTS applications_admin_created ON career_applications(created_at DESC,id);
CREATE INDEX IF NOT EXISTS runs_admin_page_status ON pipeline_runs(page_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_admin_created ON newsletter_subscribers(created_at DESC,id);
