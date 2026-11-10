-- Optional search fields for a note. The visible title stays the page h1.

ALTER TABLE "Article" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Article" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Article" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "Article" ADD COLUMN "noIndex" BOOLEAN NOT NULL DEFAULT false;
