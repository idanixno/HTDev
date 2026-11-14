import type {
  Category,
  Course,
  CourseDiagramKind,
  CurriculumModule,
  LearningPath,
  LearningPathStep,
  Lesson,
} from "@zharfa/database";
import { CourseOfferKind } from "@zharfa/database";
import {
  defaultStatusLabel,
  toCardAvailability,
  type CourseCardAvailability,
} from "./course-state";
import { decimalToNumber, priceLabelForOffer } from "./pricing";

type CourseWithCategory = Course & { category: Category | null };

export type PublicCourseCardDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: { slug: string; title: string } | null;
  publicationStatus: Course["publicationStatus"];
  offerKind: Course["offerKind"];
  availability: CourseCardAvailability;
  statusLabel: string;
  priceToman: number;
  compareAtToman: number | null;
  priceLabel: string;
  levelLabel: string | null;
  durationHours: number | null;
  lessonCount: number;
  meta: string | null;
  featured: boolean;
  coverAsset: string | null;
  indexLabel: string | null;
  diagramCode: string | null;
  diagramKind: "boundary" | "chain";
  chainNodes: string[];
  href: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type PublicLessonDto = {
  id: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  durationMinutes: number | null;
  isPreview: boolean;
  previewAsset: string | null;
  videoAsset: string | null;
};

export type PublicModuleDto = {
  id: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  lessons: PublicLessonDto[];
};

export type PublicCoursePurchaseNoteDto = {
  id: string;
  body: string;
  sortOrder: number;
  /** `global` for all courses; `course` for exclusive notes. */
  scope: "global" | "course";
};

export type PublicTopicRefDto = {
  slug: string;
  name: string;
  href: string;
};

export type PublicCourseDetailDto = PublicCourseCardDto & {
  description: string | null;
  instructorName: string | null;
  /** Public intro/preview video for the course hero (optional). */
  previewAsset: string | null;
  /**
   * When true, full lessons play in SpotPlayer after purchase.
   * Site-hosted videoAsset is only exposed for isPreview lessons.
   */
  spotPlayerProtected: boolean;
  publishedAt: string | null;
  modules: PublicModuleDto[];
  /** Merged global + exclusive «قبل از خرید» notes. */
  purchaseNotes: PublicCoursePurchaseNoteDto[];
  /** Published topic hubs linked via CourseTopic. */
  topics: PublicTopicRefDto[];
};

export type PublicPathStepDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  href: string;
  noIndex: boolean;
  course: PublicCourseCardDto | null;
};

export type PublicPathDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  coverAsset: string | null;
  href: string;
  stepCount: number;
  steps?: PublicPathStepDto[];
};

function diagramKindToUi(
  kind: CourseDiagramKind,
): "boundary" | "chain" {
  return kind === "BOUNDARY" ? "boundary" : "chain";
}

function buildMeta(course: Course): string | null {
  const parts: string[] = [];
  if (course.levelLabel) parts.push(course.levelLabel);
  if (course.durationHours != null) {
    const hours = decimalToNumber(course.durationHours);
    const faHours = hours.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
    parts.push(`${faHours} ساعت`);
  }
  if (course.lessonCount > 0) {
    parts.push(`${course.lessonCount.toLocaleString("fa-IR")} درس`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export function toPublicCourseCard(course: CourseWithCategory): PublicCourseCardDto {
  const state = {
    publicationStatus: course.publicationStatus,
    offerKind: course.offerKind,
  };
  const chainNodes =
    course.chainNodes.length >= 3
      ? (course.chainNodes.slice(0, 3) as [string, string, string])
      : course.chainNodes;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    category: course.category
      ? { slug: course.category.slug, title: course.category.title }
      : null,
    publicationStatus: course.publicationStatus,
    offerKind: course.offerKind,
    availability: toCardAvailability(state),
    statusLabel: defaultStatusLabel(state),
    priceToman: decimalToNumber(course.priceToman),
    compareAtToman:
      course.compareAtToman != null
        ? decimalToNumber(course.compareAtToman)
        : null,
    priceLabel: priceLabelForOffer({
      offerKind: course.offerKind,
      priceToman: course.priceToman,
    }),
    levelLabel: course.levelLabel,
    durationHours:
      course.durationHours != null
        ? decimalToNumber(course.durationHours)
        : null,
    lessonCount: course.lessonCount,
    meta: buildMeta(course),
    featured: course.featured,
    coverAsset: course.coverAsset,
    indexLabel: course.indexLabel,
    diagramCode: course.diagramCode,
    diagramKind: diagramKindToUi(course.diagramKind),
    chainNodes: [...chainNodes],
    href: `/courses/${course.slug}`,
    seoTitle: course.seoTitle,
    seoDescription: course.seoDescription,
    ogImage: course.ogImage,
    noIndex: course.noIndex,
    publishedAt: course.publishedAt?.toISOString() ?? null,
    updatedAt: course.updatedAt.toISOString(),
  };
}

export function toPublicCourseDetail(
  course: CourseWithCategory & {
    modules: (CurriculumModule & { lessons: Lesson[] })[];
    spotPlayerMapping?: { enabled: boolean } | null;
    topicLinks?: Array<{
      topic: { slug: string; name: string; status: string };
    }>;
  },
  purchaseNotes: PublicCoursePurchaseNoteDto[] = [],
): PublicCourseDetailDto {
  // Free courses are watched/downloaded on-site after login — never hide
  // their videos behind SpotPlayer chrome on the public course page.
  const spotPlayerProtected =
    course.offerKind !== CourseOfferKind.FREE &&
    Boolean(course.spotPlayerMapping?.enabled);
  const topics = (course.topicLinks ?? [])
    .filter((link) => link.topic.status === "PUBLISHED")
    .map((link) => ({
      slug: link.topic.slug,
      name: link.topic.name,
      href: `/topics/${link.topic.slug}`,
    }));
  return {
    ...toPublicCourseCard(course),
    description: course.description,
    instructorName:
      course.showInstructor && course.instructorName?.trim()
        ? course.instructorName.trim()
        : null,
    previewAsset: course.previewAsset,
    spotPlayerProtected,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      summary: mod.summary,
      sortOrder: mod.sortOrder,
      lessons: mod.lessons.map((lesson) => {
        const allowSiteVideo =
          !spotPlayerProtected || lesson.isPreview;
        return {
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          sortOrder: lesson.sortOrder,
          durationMinutes: lesson.durationMinutes,
          isPreview: lesson.isPreview,
          previewAsset: lesson.isPreview ? lesson.previewAsset : null,
          videoAsset: allowSiteVideo ? lesson.videoAsset : null,
        };
      }),
    })),
    purchaseNotes,
    topics,
  };
}

export function toPublicPathSummary(
  path: LearningPath & { _count: { steps: number } },
): PublicPathDto {
  return {
    id: path.id,
    slug: path.slug,
    title: path.title,
    summary: path.summary,
    description: path.description,
    coverAsset: path.coverAsset,
    href: `/paths/${path.slug}`,
    stepCount: path._count.steps,
  };
}

export function toPublicPathDetail(
  path: LearningPath & {
    steps: (LearningPathStep & {
      course: CourseWithCategory | null;
    })[];
  },
): PublicPathDto {
  return {
    id: path.id,
    slug: path.slug,
    title: path.title,
    summary: path.summary,
    description: path.description,
    coverAsset: path.coverAsset,
    href: `/paths/${path.slug}`,
    stepCount: path.steps.length,
    steps: path.steps.map((step) => ({
      id: step.id,
      slug: step.slug,
      title: step.title,
      summary: step.summary,
      sortOrder: step.sortOrder,
      href: `/paths/${path.slug}/${step.slug}`,
      noIndex: step.noIndex,
      course: step.course ? toPublicCourseCard(step.course) : null,
    })),
  };
}
