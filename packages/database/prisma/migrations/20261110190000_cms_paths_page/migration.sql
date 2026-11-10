-- Singleton CMS copy for the public /paths roadmap index.
CREATE TABLE IF NOT EXISTS "CmsPathsContent" (
  "id" TEXT NOT NULL DEFAULT 'paths',
  "title" TEXT NOT NULL DEFAULT 'نقشهٔ راه یادگیری',
  "lead" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsPathsContent_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CmsPathsContent" ("id", "title", "lead", "seoTitle", "seoDescription", "updatedAt", "createdAt")
VALUES (
  'paths',
  'نقشهٔ راه یادگیری',
  'مسیرهای پیشنهادی برای یادگیری عمیق. دوره‌ها را به ترتیب ببینید، عجله نکنید و هر دوره را جدا بخرید — مسیر اشتراک اجباری نمی‌سازد.',
  'نقشهٔ راه',
  'ترتیب پیشنهادی دوره‌های ژرفا — هر مسیر را به ترتیب بخوانید؛ هر دوره جدا فروخته می‌شود.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
