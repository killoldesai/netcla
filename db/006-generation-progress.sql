ALTER TABLE jobs ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'queued';
UPDATE jobs SET progress=100,stage='completed' WHERE status='completed';
