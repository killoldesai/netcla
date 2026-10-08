ALTER TABLE pages ADD COLUMN IF NOT EXISTS archived_at timestamptz;
CREATE TABLE IF NOT EXISTS site_plan_imports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),checksum text NOT NULL UNIQUE,inventory jsonb NOT NULL,report jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS site_plan_backups(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),import_id uuid REFERENCES site_plan_imports(id),snapshot jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS page_brief_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),page_id uuid NOT NULL REFERENCES pages(id),brief jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS brief_snapshot jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS section_id text;
CREATE INDEX IF NOT EXISTS brief_versions_page ON page_brief_versions(page_id,created_at DESC);
