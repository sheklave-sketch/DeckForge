-- DeckForge Database Schema for Supabase (FIXED - snake_case columns)
-- Run this in Supabase SQL Editor after running supabase_cleanup.sql

-- Create enums
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'EDITING', 'EXPORTED');
CREATE TYPE "ComponentCategory" AS ENUM ('TITLE', 'NARRATIVE', 'DATA', 'COMPARISON', 'PROCESS', 'FRAMEWORK', 'VISUAL', 'TABLE', 'CLOSING');
CREATE TYPE "ComponentSource" AS ENUM ('CORE', 'USER_UPLOAD', 'AI_GENERATED', 'COMMUNITY');
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripe_customer_id" TEXT UNIQUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Brand Kits table
CREATE TABLE "brand_kits" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "logo_url" TEXT,
    "tone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "brand_kits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Projects table
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "brand_kit_id" TEXT,
    "title" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "parameters" JSONB,
    "input_content" TEXT,
    "parsed_content" JSONB,
    "slide_blueprint" JSONB,
    "pptx_url" TEXT,
    "thumbnails" JSONB,
    "chat_history" JSONB,
    "edit_history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "projects_brand_kit_id_fkey" FOREIGN KEY ("brand_kit_id") REFERENCES "brand_kits"("id") ON DELETE SET NULL
);

-- Components table
CREATE TABLE "components" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "tags" TEXT[] NOT NULL,
    "thumbnail_url" TEXT,
    "preview_data" JSONB,
    "render_code" TEXT NOT NULL,
    "data_schema" JSONB NOT NULL,
    "source" "ComponentSource" NOT NULL,
    "created_by" TEXT,
    "extracted_from" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "use_cases" TEXT[] NOT NULL,
    "best_for" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "components_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Slides table
CREATE TABLE "slides" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "project_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "component_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "image_urls" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "slides_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "slides_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id"),
    CONSTRAINT "slides_project_id_position_unique" UNIQUE ("project_id", "position")
);

-- Component Extractions table
CREATE TABLE "component_extractions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "project_id" TEXT NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "sample_deck_url" TEXT NOT NULL,
    "extracted_components" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3)
);

-- Create indexes
CREATE INDEX "brand_kits_user_id_idx" ON "brand_kits"("user_id");
CREATE INDEX "projects_user_id_status_idx" ON "projects"("user_id", "status");
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");
CREATE INDEX "slides_project_id_idx" ON "slides"("project_id");
CREATE INDEX "components_category_is_public_idx" ON "components"("category", "is_public");
CREATE INDEX "components_popularity_idx" ON "components"("popularity");
CREATE INDEX "components_created_by_idx" ON "components"("created_by");
CREATE INDEX "component_extractions_status_idx" ON "component_extractions"("status");

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON "brand_kits" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON "components" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON "slides" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
