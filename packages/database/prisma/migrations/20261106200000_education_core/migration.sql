-- Phase 4 education core: categories, course publication/offer enums,
-- curriculum, lessons, learning paths, Decimal pricing.

-- CreateEnum
CREATE TYPE "CoursePublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseOfferKind" AS ENUM ('FREE', 'PAID', 'PRE_SALE', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "CourseDiagramKind" AS ENUM ('BOUNDARY', 'CHAIN');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- AlterTable Course: replace availability with publication + offer + richer fields
ALTER TABLE "Course" ADD COLUMN "description" TEXT;
ALTER TABLE "Course" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Course" ADD COLUMN "publicationStatus" "CoursePublicationStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Course" ADD COLUMN "offerKind" "CourseOfferKind" NOT NULL DEFAULT 'COMING_SOON';
ALTER TABLE "Course" ADD COLUMN "compareAtToman" DECIMAL(12,2);
ALTER TABLE "Course" ADD COLUMN "levelLabel" TEXT;
ALTER TABLE "Course" ADD COLUMN "durationHours" DECIMAL(6,2);
ALTER TABLE "Course" ADD COLUMN "lessonCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Course" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Course" ADD COLUMN "coverAsset" TEXT;
ALTER TABLE "Course" ADD COLUMN "indexLabel" TEXT;
ALTER TABLE "Course" ADD COLUMN "diagramCode" TEXT;
ALTER TABLE "Course" ADD COLUMN "diagramKind" "CourseDiagramKind" NOT NULL DEFAULT 'BOUNDARY';
ALTER TABLE "Course" ADD COLUMN "chainNodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate legacy CourseAvailability → publication + offer (best-effort)
UPDATE "Course" SET
  "publicationStatus" = CASE
    WHEN "availability"::text IN ('PUBLISHED_PAID', 'PUBLISHED_FREE', 'PREORDER', 'IN_PRODUCTION', 'COMING_SOON') THEN 'PUBLISHED'::"CoursePublicationStatus"
    WHEN "availability"::text = 'UNAVAILABLE' THEN 'UNPUBLISHED'::"CoursePublicationStatus"
    ELSE 'DRAFT'::"CoursePublicationStatus"
  END,
  "offerKind" = CASE
    WHEN "availability"::text = 'PUBLISHED_FREE' THEN 'FREE'::"CourseOfferKind"
    WHEN "availability"::text = 'PUBLISHED_PAID' THEN 'PAID'::"CourseOfferKind"
    WHEN "availability"::text = 'PREORDER' THEN 'PRE_SALE'::"CourseOfferKind"
    WHEN "availability"::text IN ('IN_PRODUCTION', 'COMING_SOON') THEN 'COMING_SOON'::"CourseOfferKind"
    ELSE 'COMING_SOON'::"CourseOfferKind"
  END;

-- Convert priceToman Int → Decimal
ALTER TABLE "Course" ALTER COLUMN "priceToman" DROP DEFAULT;
ALTER TABLE "Course" ALTER COLUMN "priceToman" TYPE DECIMAL(12,2) USING ("priceToman"::DECIMAL(12,2));
ALTER TABLE "Course" ALTER COLUMN "priceToman" SET DEFAULT 0;

ALTER TABLE "Course" DROP COLUMN "availability";

DROP TYPE "CourseAvailability";

-- CreateTable
CREATE TABLE "CurriculumModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "coverAsset" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathStep" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Course_publicationStatus_offerKind_idx" ON "Course"("publicationStatus", "offerKind");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- CreateIndex
CREATE INDEX "Course_featured_sortOrder_idx" ON "Course"("featured", "sortOrder");

-- CreateIndex
CREATE INDEX "CurriculumModule_courseId_sortOrder_idx" ON "CurriculumModule"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "Lesson_courseId_sortOrder_idx" ON "Lesson"("courseId", "sortOrder");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_sortOrder_idx" ON "Lesson"("moduleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_slug_key" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPath_published_sortOrder_idx" ON "LearningPath"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "LearningPathStep_pathId_sortOrder_idx" ON "LearningPathStep"("pathId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumModule" ADD CONSTRAINT "CurriculumModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CurriculumModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathStep" ADD CONSTRAINT "LearningPathStep_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathStep" ADD CONSTRAINT "LearningPathStep_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
