-- Each idea targets a combination of services for one industry.
ALTER TABLE case_study_ideas ADD COLUMN services jsonb NOT NULL DEFAULT '[]';
ALTER TABLE case_study_ideas ADD COLUMN industry text NOT NULL DEFAULT '';
