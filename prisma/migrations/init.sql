-- DeckForge V2 Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/getucjflokixtpcbpvmi/sql

-- Create enums
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'EDITING', 'EXPORTED');
CREATE TYPE "ComponentCategory" AS ENUM ('TITLE', 'NARRATIVE', 'DATA', 'COMPARISON', 'PROCESS', 'FRAMEWORK', 'VISUAL', 'TABLE', 'CLOSING');
CREATE TYPE "ComponentSource" AS ENUM ('CORE', 'USER_UPLOAD', 'AI_GENERATED', 'COMMUNITY');
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Users table
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "plan" "Plan" DEFAULT 'FREE' NOT NULL,
    "stripeCustomerId" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Brand kits table
CREATE TABLE "brand_kits" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "logoUrl" TEXT,
    "tone" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "brand_kits_userId_idx" ON "brand_kits"("userId");

-- Projects table
CREATE TABLE "projects" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ProjectStatus" DEFAULT 'DRAFT' NOT NULL,
    "parameters" JSONB,
    "inputContent" TEXT,
    "parsedContent" JSONB,
    "slideBlueprint" JSONB,
    "pptxUrl" TEXT,
    "thumbnails" JSONB,
    "chatHistory" JSONB,
    "editHistory" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("brandKitId") REFERENCES "brand_kits"("id") ON DELETE SET NULL
);

CREATE INDEX "projects_userId_status_idx" ON "projects"("userId", "status");
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- Components table
CREATE TABLE "components" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "thumbnailUrl" TEXT,
    "previewData" JSONB,
    "renderCode" TEXT NOT NULL,
    "dataSchema" JSONB NOT NULL,
    "source" "ComponentSource" NOT NULL,
    "createdBy" TEXT,
    "extractedFrom" TEXT,
    "isPublic" BOOLEAN DEFAULT true NOT NULL,
    "popularity" INTEGER DEFAULT 0 NOT NULL,
    "rating" DOUBLE PRECISION,
    "useCases" TEXT[] NOT NULL DEFAULT '{}',
    "bestFor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX "components_category_isPublic_idx" ON "components"("category", "isPublic");
CREATE INDEX "components_popularity_idx" ON "components"("popularity");
CREATE INDEX "components_createdBy_idx" ON "components"("createdBy");

-- Slides table
CREATE TABLE "slides" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "componentId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "imageUrls" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    FOREIGN KEY ("componentId") REFERENCES "components"("id"),
    UNIQUE ("projectId", "position")
);

CREATE INDEX "slides_projectId_idx" ON "slides"("projectId");

-- Component extractions table
CREATE TABLE "component_extractions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "status" "ExtractionStatus" DEFAULT 'PENDING' NOT NULL,
    "sampleDeckUrl" TEXT NOT NULL,
    "extractedComponents" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" TIMESTAMP(3)
);

CREATE INDEX "component_extractions_status_idx" ON "component_extractions"("status");

-- Enable Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "brand_kits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "slides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "components" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "component_extractions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can only see/edit their own data)
CREATE POLICY "Users can view own profile" ON "users" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for brand_kits
CREATE POLICY "Users can view own brand kits" ON "brand_kits" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create own brand kits" ON "brand_kits" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own brand kits" ON "brand_kits" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own brand kits" ON "brand_kits" FOR DELETE USING (auth.uid()::text = "userId");

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON "projects" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create own projects" ON "projects" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own projects" ON "projects" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own projects" ON "projects" FOR DELETE USING (auth.uid()::text = "userId");

-- RLS Policies for slides
CREATE POLICY "Users can view own slides" ON "slides" FOR SELECT USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "slides"."projectId" AND "projects"."userId" = auth.uid()::text)
);
CREATE POLICY "Users can create own slides" ON "slides" FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "slides"."projectId" AND "projects"."userId" = auth.uid()::text)
);
CREATE POLICY "Users can update own slides" ON "slides" FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "slides"."projectId" AND "projects"."userId" = auth.uid()::text)
);
CREATE POLICY "Users can delete own slides" ON "slides" FOR DELETE USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "slides"."projectId" AND "projects"."userId" = auth.uid()::text)
);

-- RLS Policies for components (public components visible to all, private only to creator)
CREATE POLICY "Public components visible to all" ON "components" FOR SELECT USING ("isPublic" = true);
CREATE POLICY "Users can view own private components" ON "components" FOR SELECT USING (auth.uid()::text = "createdBy");
CREATE POLICY "Users can create components" ON "components" FOR INSERT WITH CHECK (auth.uid()::text = "createdBy" OR "createdBy" IS NULL);
CREATE POLICY "Users can update own components" ON "components" FOR UPDATE USING (auth.uid()::text = "createdBy");
CREATE POLICY "Users can delete own components" ON "components" FOR DELETE USING (auth.uid()::text = "createdBy");

-- RLS Policies for component_extractions
CREATE POLICY "Users can view own extractions" ON "component_extractions" FOR SELECT USING (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "component_extractions"."projectId" AND "projects"."userId" = auth.uid()::text)
);
CREATE POLICY "Users can create own extractions" ON "component_extractions" FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "projects" WHERE "projects"."id" = "component_extractions"."projectId" AND "projects"."userId" = auth.uid()::text)
);
