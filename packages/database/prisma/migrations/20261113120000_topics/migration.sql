-- Topic hubs (SEO/AEO) — independent of flat Category.
-- Additive only: no changes to Course/Category/Article URLs or data.

CREATE TYPE "TopicPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TYPE "TopicRelationType" AS ENUM ('RELATED', 'PREREQUISITE', 'NEXT', 'ALTERNATIVE');

CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "introContent" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "h1" TEXT,
    "parentTopicId" TEXT,
    "canonicalUrl" TEXT,
    "indexable" BOOLEAN NOT NULL DEFAULT true,
    "status" "TopicPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseTopic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalTopic" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TopicRelation" (
    "id" TEXT NOT NULL,
    "fromTopicId" TEXT NOT NULL,
    "toTopicId" TEXT NOT NULL,
    "relationType" "TopicRelationType" NOT NULL DEFAULT 'RELATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicRelation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

CREATE INDEX "Topic_status_indexable_sortOrder_idx" ON "Topic"("status", "indexable", "sortOrder");

CREATE INDEX "Topic_parentTopicId_sortOrder_idx" ON "Topic"("parentTopicId", "sortOrder");

CREATE UNIQUE INDEX "CourseTopic_courseId_topicId_key" ON "CourseTopic"("courseId", "topicId");

CREATE INDEX "CourseTopic_topicId_sortOrder_idx" ON "CourseTopic"("topicId", "sortOrder");

CREATE INDEX "CourseTopic_courseId_idx" ON "CourseTopic"("courseId");

CREATE UNIQUE INDEX "JournalTopic_articleId_topicId_key" ON "JournalTopic"("articleId", "topicId");

CREATE INDEX "JournalTopic_topicId_sortOrder_idx" ON "JournalTopic"("topicId", "sortOrder");

CREATE INDEX "JournalTopic_articleId_idx" ON "JournalTopic"("articleId");

CREATE UNIQUE INDEX "TopicRelation_fromTopicId_toTopicId_relationType_key" ON "TopicRelation"("fromTopicId", "toTopicId", "relationType");

CREATE INDEX "TopicRelation_toTopicId_relationType_idx" ON "TopicRelation"("toTopicId", "relationType");

CREATE INDEX "TopicRelation_fromTopicId_relationType_idx" ON "TopicRelation"("fromTopicId", "relationType");

ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JournalTopic" ADD CONSTRAINT "JournalTopic_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JournalTopic" ADD CONSTRAINT "JournalTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TopicRelation" ADD CONSTRAINT "TopicRelation_fromTopicId_fkey" FOREIGN KEY ("fromTopicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TopicRelation" ADD CONSTRAINT "TopicRelation_toTopicId_fkey" FOREIGN KEY ("toTopicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
