-- One shared visual system per case study so every generated screen looks like the same product.
ALTER TABLE case_studies ADD COLUMN design jsonb NOT NULL DEFAULT '{}';
