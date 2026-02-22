-- DeckForge Database Cleanup
-- Run this FIRST to drop all existing tables and types
-- Then run supabase_schema.sql

-- Drop all tables (with CASCADE to handle foreign keys)
DROP TABLE IF EXISTS "component_extractions" CASCADE;
DROP TABLE IF EXISTS "slides" CASCADE;
DROP TABLE IF EXISTS "components" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "brand_kits" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS "ExtractionStatus" CASCADE;
DROP TYPE IF EXISTS "ComponentSource" CASCADE;
DROP TYPE IF EXISTS "ComponentCategory" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "Plan" CASCADE;

-- Drop triggers and functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
