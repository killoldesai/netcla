-- Case studies are no longer tied to one city; each idea targets a location.
ALTER TABLE case_study_ideas ADD COLUMN location text NOT NULL DEFAULT '';
