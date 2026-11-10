-- Lesson video for free courses. Paid lessons are not exposed by the public catalog.

ALTER TABLE "Lesson" ADD COLUMN "videoAsset" TEXT;

UPDATE "Lesson" AS lesson
SET "videoAsset" = '/previews/lesson-preview.mp4'
FROM "Course" AS course
WHERE lesson."courseId" = course."id"
  AND course."offerKind" = 'FREE'
  AND (lesson."videoAsset" IS NULL OR lesson."videoAsset" = '');
