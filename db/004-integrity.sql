CREATE UNIQUE INDEX IF NOT EXISTS owners_one_account ON owners((true));
CREATE OR REPLACE FUNCTION immutable_revision() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Revisions are immutable; create a new revision'; END $$;
DROP TRIGGER IF EXISTS revisions_immutable ON revisions;
CREATE TRIGGER revisions_immutable BEFORE UPDATE OR DELETE ON revisions FOR EACH ROW EXECUTE FUNCTION immutable_revision();
