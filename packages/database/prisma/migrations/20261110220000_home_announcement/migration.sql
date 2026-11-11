-- AlterTable
ALTER TABLE "CmsHomeContent" ADD COLUMN "announcementEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CmsHomeContent" ADD COLUMN "announcementText" TEXT;
ALTER TABLE "CmsHomeContent" ADD COLUMN "announcementHref" TEXT;
ALTER TABLE "CmsHomeContent" ADD COLUMN "announcementCtaLabel" TEXT;
