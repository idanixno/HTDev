-- Course SEO fields
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "ogImage" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "noIndex" BOOLEAN NOT NULL DEFAULT false;

-- Integration / SEO / security enums + tables
DO $$ BEGIN
  CREATE TYPE "IntegrationProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'GOOGLE_OAUTH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SeoEntityType" AS ENUM ('COURSE', 'ARTICLE', 'PATH_STEP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SeoSuggestionDecision" AS ENUM ('ACCEPTED', 'REJECTED', 'EDITED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SecurityEventType" AS ENUM ('SUSPICIOUS_PATH', 'RATE_LIMIT', 'UNAUTHORIZED_ADMIN', 'AUTH_FAILURE', 'API_ABUSE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "IntegrationCredential" (
  "id" TEXT NOT NULL,
  "provider" "IntegrationProvider" NOT NULL,
  "secretEncrypted" TEXT,
  "configJson" JSONB,
  "credentialsStatus" "GatewayCredentialsStatus" NOT NULL DEFAULT 'MISSING',
  "secretLast4" TEXT,
  "oauthRefreshEncrypted" TEXT,
  "oauthAccessEncrypted" TEXT,
  "oauthAccessExpiresAt" TIMESTAMP(3),
  "connectedAt" TIMESTAMP(3),
  "lastTestedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntegrationCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationCredential_provider_key" ON "IntegrationCredential"("provider");

CREATE TABLE IF NOT EXISTS "SeoSuggestionLog" (
  "id" TEXT NOT NULL,
  "entityType" "SeoEntityType" NOT NULL,
  "entityId" TEXT,
  "action" TEXT NOT NULL,
  "decision" "SeoSuggestionDecision",
  "actorId" TEXT,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoSuggestionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SeoSuggestionLog_entityType_entityId_idx" ON "SeoSuggestionLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "SeoSuggestionLog_createdAt_idx" ON "SeoSuggestionLog"("createdAt");

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL,
  "type" "SecurityEventType" NOT NULL,
  "path" TEXT NOT NULL,
  "method" TEXT,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");
