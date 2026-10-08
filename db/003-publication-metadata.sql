ALTER TABLE pages ADD COLUMN IF NOT EXISTS first_published_at timestamptz;
INSERT INTO assets(path,alt,attribution) VALUES
('/assets/logo.png','Netofficials logo','Company supplied'),
('/assets/hero-editorial.png','Software and mobile application illustration','Approved design asset'),
('/assets/poppins-regular.ttf',NULL,'Poppins SIL Open Font License; see /assets/poppins-license.txt'),
('/assets/poppins-semibold.ttf',NULL,'Poppins SIL Open Font License; see /assets/poppins-license.txt')
ON CONFLICT(path) DO NOTHING;
