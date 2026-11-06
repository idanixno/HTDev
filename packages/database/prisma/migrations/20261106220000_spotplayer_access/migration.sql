-- Phase 6: SpotPlayer access provisioning (separate from payment status).

CREATE TYPE "SpotPlayerLicenseStatus" AS ENUM ('PENDING', 'QUEUED', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED');
CREATE TYPE "SpotPlayerAccessSource" AS ENUM ('PAID_ORDER', 'FREE_COURSE');

CREATE TABLE "SpotPlayerSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "technicalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "testMode" BOOLEAN NOT NULL DEFAULT true,
    "apiKeyEncrypted" TEXT,
    "apiKeyLast4" TEXT,
    "credentialsStatus" "GatewayCredentialsStatus" NOT NULL DEFAULT 'MISSING',
    "licenseEndpoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotPlayerSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpotPlayerCourseMapping" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "spotPlayerCourseId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotPlayerCourseMapping_pkey" PRIMARY KEY ("id")
);

-- Rebuild SpotPlayerLicense with proper enums + relations (scaffold was status string).
DROP TABLE IF EXISTS "SpotPlayerLicense";

CREATE TABLE "SpotPlayerLicense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "orderId" TEXT,
    "accessSource" "SpotPlayerAccessSource" NOT NULL,
    "spotPlayerLicenseId" TEXT,
    "licenseKey" TEXT,
    "licenseUrl" TEXT,
    "status" "SpotPlayerLicenseStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "provisionedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT NOT NULL,
    "providerPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotPlayerLicense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpotPlayerCourseMapping_courseId_key" ON "SpotPlayerCourseMapping"("courseId");
CREATE INDEX "SpotPlayerCourseMapping_spotPlayerCourseId_idx" ON "SpotPlayerCourseMapping"("spotPlayerCourseId");

CREATE UNIQUE INDEX "SpotPlayerLicense_idempotencyKey_key" ON "SpotPlayerLicense"("idempotencyKey");
CREATE UNIQUE INDEX "SpotPlayerLicense_userId_courseId_key" ON "SpotPlayerLicense"("userId", "courseId");
CREATE INDEX "SpotPlayerLicense_status_updatedAt_idx" ON "SpotPlayerLicense"("status", "updatedAt");
CREATE INDEX "SpotPlayerLicense_orderId_idx" ON "SpotPlayerLicense"("orderId");

ALTER TABLE "SpotPlayerCourseMapping" ADD CONSTRAINT "SpotPlayerCourseMapping_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotPlayerLicense" ADD CONSTRAINT "SpotPlayerLicense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotPlayerLicense" ADD CONSTRAINT "SpotPlayerLicense_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotPlayerLicense" ADD CONSTRAINT "SpotPlayerLicense_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
