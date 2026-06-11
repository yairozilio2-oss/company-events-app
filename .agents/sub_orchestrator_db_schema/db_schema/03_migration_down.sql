-- 03_migration_down.sql
-- Migration script to revert registration schema (down)

BEGIN;

DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;
