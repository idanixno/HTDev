ALTER TABLE "Course"
ADD COLUMN "instructorName" TEXT,
ADD COLUMN "showInstructor" BOOLEAN NOT NULL DEFAULT false;
