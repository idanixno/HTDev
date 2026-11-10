-- Global + per-course «قبل از خرید» notes (courseId NULL = all courses).
CREATE TABLE "CoursePurchaseNote" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePurchaseNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoursePurchaseNote_courseId_published_sortOrder_idx" ON "CoursePurchaseNote"("courseId", "published", "sortOrder");

CREATE INDEX "CoursePurchaseNote_published_sortOrder_idx" ON "CoursePurchaseNote"("published", "sortOrder");

ALTER TABLE "CoursePurchaseNote" ADD CONSTRAINT "CoursePurchaseNote_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
