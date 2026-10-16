-- Case study workspace: brainstormed ideas, AI-assisted drafts and their images.
CREATE TABLE case_study_ideas(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  title text NOT NULL,
  angle text NOT NULL,
  why text NOT NULL DEFAULT '',
  evidence_needed jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','chosen','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE case_studies(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES case_study_ideas(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  facts text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','ready','archived')),
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE case_study_images(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  slot text NOT NULL,
  purpose text NOT NULL DEFAULT '',
  prompt text NOT NULL,
  alt text NOT NULL DEFAULT '',
  ratio text NOT NULL DEFAULT '16:9' CHECK(ratio IN ('16:9','4:3','1:1','3:2')),
  asset_id uuid REFERENCES generated_assets(id) ON DELETE SET NULL,
  error text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX case_study_images_study ON case_study_images(study_id,sort);
CREATE INDEX case_studies_status ON case_studies(status,updated_at DESC);
