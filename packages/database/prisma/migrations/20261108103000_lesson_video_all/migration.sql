-- Every syllabus lesson gets a playable video file.

UPDATE "Lesson"
SET "videoAsset" = '/previews/lesson-preview.mp4'
WHERE "videoAsset" IS NULL OR "videoAsset" = '';
