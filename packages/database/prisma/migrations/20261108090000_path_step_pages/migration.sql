-- Each roadmap step gets its own public page and editable markdown.

ALTER TABLE "LearningPathStep" ADD COLUMN "slug" TEXT;
ALTER TABLE "LearningPathStep" ADD COLUMN "body" TEXT NOT NULL DEFAULT '';
ALTER TABLE "LearningPathStep" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "LearningPathStep" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "LearningPathStep" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "LearningPathStep" ADD COLUMN "noIndex" BOOLEAN NOT NULL DEFAULT false;

UPDATE "LearningPathStep" AS step
SET "slug" = course."slug"
FROM "Course" AS course
WHERE step."courseId" = course."id"
  AND (step."slug" IS NULL OR step."slug" = '');

UPDATE "LearningPathStep"
SET "slug" = 'step-' || "sortOrder"::text
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "LearningPathStep" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "LearningPathStep_pathId_slug_key" ON "LearningPathStep"("pathId", "slug");

UPDATE "LearningPathStep" AS step
SET
  "body" = $body$## محیط اجرا را بشناس

قبل از معماری، باید بدانی برنامه کجا اجرا می‌شود. این صفحه شرح گام است. درس کامل دوره، بعد از خرید، در اسپات‌پلیر باز می‌شود.

### سه کار اول

- ترمینال را باز کن
- مسیر فعلی را ببین
- یک فایل را جابه‌جا کن

| کار | دستور | چرا |
| --- | --- | --- |
| مسیر | pwd | بدانی کجایی |
| فهرست | ls | فایل‌ها را ببینی |
| جابه‌جایی | mv | بدون کپی اضافه |

!video[نمونهٔ کوتاه و عمومی](/previews/lesson-preview.mp4)

![طرح دورهٔ لینوکس](/artwork/courses/linux-intro.svg)

```bash
pwd
ls
```

!course[linux-intro]
$body$,
  "seoTitle" = 'شروع با سیستم | گام اول مسیر مهندسی',
  "seoDescription" = 'گام اول نقشهٔ راه: محیط اجرا، جدول دستورها، فیلم نمونه و دورهٔ لینوکس. هر دوره جدا خریده می‌شود.'
FROM "LearningPath" AS path
WHERE step."pathId" = path."id"
  AND path."slug" = 'from-first-problem'
  AND step."slug" = 'linux-intro'
  AND step."body" = '';
