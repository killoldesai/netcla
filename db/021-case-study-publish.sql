-- Case studies can be published to /case-studies/<slug>. Publishing is an explicit owner action.
ALTER TABLE case_studies DROP CONSTRAINT case_studies_status_check;
ALTER TABLE case_studies ADD CONSTRAINT case_studies_status_check CHECK(status IN ('draft','ready','published','archived'));
ALTER TABLE case_studies ADD COLUMN published_at timestamptz;
