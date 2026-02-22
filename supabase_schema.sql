-- DeckForge Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/getucjflokixtpcbpvmi/sql/new

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
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Brand Kits table
CREATE TABLE "brand_kits" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "logoUrl" TEXT,
    "tone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "brand_kits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Projects table
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "parameters" JSONB,
    "inputContent" TEXT,
    "parsedContent" JSONB,
    "slideBlueprint" JSONB,
    "pptxUrl" TEXT,
    "thumbnails" JSONB,
    "chatHistory" JSONB,
    "editHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "projects_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "brand_kits"("id") ON DELETE SET NULL
);

-- Components table
CREATE TABLE "components" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "tags" TEXT[] NOT NULL,
    "thumbnailUrl" TEXT,
    "previewData" JSONB,
    "renderCode" TEXT NOT NULL,
    "dataSchema" JSONB NOT NULL,
    "source" "ComponentSource" NOT NULL,
    "createdBy" TEXT,
    "extractedFrom" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "useCases" TEXT[] NOT NULL,
    "bestFor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "components_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Slides table
CREATE TABLE "slides" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "componentId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "imageUrls" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "slides_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "slides_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "components"("id"),
    CONSTRAINT "slides_projectId_position_unique" UNIQUE ("projectId", "position")
);

-- Component Extractions table
CREATE TABLE "component_extractions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "sampleDeckUrl" TEXT NOT NULL,
    "extractedComponents" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3)
);

-- Create indexes
CREATE INDEX "brand_kits_userId_idx" ON "brand_kits"("userId");
CREATE INDEX "projects_userId_status_idx" ON "projects"("userId", "status");
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");
CREATE INDEX "slides_projectId_idx" ON "slides"("projectId");
CREATE INDEX "components_category_isPublic_idx" ON "components"("category", "isPublic");
CREATE INDEX "components_popularity_idx" ON "components"("popularity");
CREATE INDEX "components_createdBy_idx" ON "components"("createdBy");
CREATE INDEX "component_extractions_status_idx" ON "component_extractions"("status");

-- Create trigger to auto-update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON "brand_kits" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON "components" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON "slides" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
