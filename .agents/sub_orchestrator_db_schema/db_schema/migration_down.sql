-- Migration Down Script for Registration Feature
-- Drops tables created by the up migration
BEGIN;

DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;
