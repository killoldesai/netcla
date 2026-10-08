-- Image SEO properties and pluggable storage (local disk or Amazon S3).
ALTER TABLE generated_assets ADD COLUMN IF NOT EXISTS seo_name text;
ALTER TABLE generated_assets ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE generated_assets ADD COLUMN IF NOT EXISTS storage text NOT NULL DEFAULT 'local';
ALTER TABLE generated_assets ADD COLUMN IF NOT EXISTS storage_key text;
