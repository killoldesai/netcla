-- Automated case studies carry their origin and live progress; images pick a rendering style.
ALTER TABLE case_studies ADD COLUMN origin text NOT NULL DEFAULT 'manual' CHECK(origin IN ('manual','auto'));
ALTER TABLE case_studies ADD COLUMN progress jsonb;
ALTER TABLE case_study_images ADD COLUMN style text NOT NULL DEFAULT 'ui' CHECK(style IN ('ui','illustration'));
