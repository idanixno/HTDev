-- CreateTable
CREATE TABLE "CourseWaitlistEntry" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseWaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseWaitlistEntry_courseId_notifiedAt_idx" ON "CourseWaitlistEntry"("courseId", "notifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseWaitlistEntry_courseId_phone_key" ON "CourseWaitlistEntry"("courseId", "phone");

-- AddForeignKey
ALTER TABLE "CourseWaitlistEntry" ADD CONSTRAINT "CourseWaitlistEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
