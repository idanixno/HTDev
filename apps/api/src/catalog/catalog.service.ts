import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CourseOfferKind,
  CoursePublicationStatus,
  Prisma,
} from "@zharfa/database";
import { normalizePhone } from "../identity/normalization";
import { PrismaService } from "../prisma/prisma.service";
import {
  toPublicCourseCard,
  toPublicCourseDetail,
  toPublicPathDetail,
  toPublicPathSummary,
} from "./catalog.mapper";
import type { CourseSort, ListCoursesQueryDto } from "./dto/list-courses.dto";
import { rankRelatedArticles } from "./related-articles";

const courseCardInclude = {
  category: true,
} satisfies Prisma.CourseInclude;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories() {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        _count: {
          select: {
            courses: {
              where: { publicationStatus: CoursePublicationStatus.PUBLISHED },
            },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      sortOrder: row.sortOrder,
      courseCount: row._count.courses,
    }));
  }

  async listCourses(query: ListCoursesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where: Prisma.CourseWhereInput = {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      noIndex: false,
    };

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.offer) {
      where.offerKind = query.offer;
    }
    if (query.level) {
      where.levelLabel = query.level;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { summary: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: courseCardInclude,
        orderBy: courseOrder(query.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map(toPublicCourseCard),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async featuredCourses(limit = 3) {
    const rows = await this.prisma.course.findMany({
      where: {
        noIndex: false,
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        featured: true,
      },
      include: courseCardInclude,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      take: limit,
    });
    return rows.map(toPublicCourseCard);
  }

  async getCourseBySlug(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        publicationStatus: CoursePublicationStatus.PUBLISHED,
      },
      include: {
        category: true,
        spotPlayerMapping: { select: { enabled: true } },
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException("دوره یافت نشد.");
    }

    return toPublicCourseDetail(course);
  }

  async listPaths() {
    const rows = await this.prisma.learningPath.findMany({
      where: { published: true },
      include: { _count: { select: { steps: true } } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    return rows.map(toPublicPathSummary);
  }

  async getPathBySlug(slug: string) {
    const path = await this.prisma.learningPath.findFirst({
      where: { slug, published: true },
      include: {
        steps: {
          orderBy: { sortOrder: "asc" },
          include: {
            course: {
              include: courseCardInclude,
            },
          },
        },
      },
    });

    if (!path) {
      throw new NotFoundException("مسیر یادگیری یافت نشد.");
    }

    // Hide unpublished courses nested under a path step from public DTO.
    const sanitized = {
      ...path,
      steps: path.steps.map((step) => {
        if (
          step.course &&
          step.course.publicationStatus !== CoursePublicationStatus.PUBLISHED
        ) {
          return { ...step, course: null };
        }
        return step;
      }),
    };

    return toPublicPathDetail(sanitized);
  }

  async getPathStep(pathSlug: string, stepSlug: string) {
    const path = await this.getPathBySlug(pathSlug);
    const steps = path.steps ?? [];
    const index = steps.findIndex((step) => step.slug === stepSlug);
    if (index < 0) {
      throw new NotFoundException("این گام در مسیر پیدا نشد.");
    }
    const step = steps[index];
    if (!step) throw new NotFoundException("این گام در مسیر پیدا نشد.");
    const full = await this.prisma.learningPathStep.findUnique({
      where: { id: step.id },
    });
    if (!full) throw new NotFoundException("این گام در مسیر پیدا نشد.");
    const neighbor = (offset: number) => {
      const item = steps[index + offset];
      return item ? { title: item.title, href: item.href } : null;
    };
    return {
      path: {
        title: path.title,
        slug: path.slug,
        href: path.href,
        coverAsset: path.coverAsset,
      },
      step: {
        ...step,
        body: full.body,
        seoTitle: full.seoTitle,
        seoDescription: full.seoDescription,
        ogImage: full.ogImage,
        noIndex: full.noIndex,
      },
      previous: neighbor(-1),
      next: neighbor(1),
    };
  }

  offerKinds(): CourseOfferKind[] {
    return Object.values(CourseOfferKind);
  }

  async listLevels(): Promise<string[]> {
    const rows = await this.prisma.course.findMany({
      where: {
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        levelLabel: { not: null },
      },
      select: { levelLabel: true },
      distinct: ["levelLabel"],
      orderBy: { levelLabel: "asc" },
    });
    return rows
      .map((row) => row.levelLabel)
      .filter((label): label is string => Boolean(label));
  }

  async listPublishedFaq() {
    const rows = await this.prisma.cmsFaqItem.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true },
    });
    return rows;
  }

  async listArticles() {
    const rows = await this.prisma.article.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return rows.map(toPublicArticleCard);
  }

  async getFooterTrusts() {
    const row = await this.prisma.cmsFooterContent.findUnique({
      where: { id: "footer" },
      select: { enamadHtml: true, paymentGatewayHtml: true },
    });
    return {
      enamadHtml: row?.enamadHtml ?? null,
      paymentGatewayHtml: row?.paymentGatewayHtml ?? null,
    };
  }

  /** Suggest journal notes that overlap the course topic, description, and syllabus. */
  async listRelatedArticlesForCourse(slug: string, limit = 3) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        publicationStatus: CoursePublicationStatus.PUBLISHED,
      },
      select: {
        title: true,
        summary: true,
        description: true,
        levelLabel: true,
        category: { select: { title: true } },
        modules: {
          orderBy: { sortOrder: "asc" },
          select: {
            title: true,
            summary: true,
            lessons: {
              orderBy: { sortOrder: "asc" },
              select: { title: true, summary: true },
            },
          },
        },
      },
    });
    if (!course) {
      throw new NotFoundException("دوره یافت نشد.");
    }

    const articles = await this.prisma.article.findMany({
      where: { published: true, noIndex: false },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });

    const ranked = rankRelatedArticles(
      {
        title: course.title,
        summary: course.summary,
        description: course.description,
        categoryTitle: course.category?.title ?? null,
        levelLabel: course.levelLabel,
        modules: course.modules,
      },
      articles,
      Math.min(Math.max(limit, 1), 6),
    );

    return ranked.map(toPublicArticleCard);
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, published: true },
    });
    if (!article) {
      throw new NotFoundException("مقاله یافت نشد.");
    }
    return toPublicArticle(article);
  }

  /** Collect phone for a COMING_SOON course. SMS goes out when offer leaves به‌زودی. */
  async joinCourseWaitlist(slug: string, phoneRaw: string) {
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      throw new BadRequestException("شماره موبایل معتبر نیست.");
    }
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        publicationStatus: CoursePublicationStatus.PUBLISHED,
      },
      select: { id: true, title: true, offerKind: true },
    });
    if (!course) {
      throw new NotFoundException("دوره یافت نشد.");
    }
    if (course.offerKind !== CourseOfferKind.COMING_SOON) {
      throw new BadRequestException(
        "این دوره دیگر به‌زودی نیست؛ از صفحهٔ دوره ثبت‌نام کنید.",
      );
    }

    await this.prisma.courseWaitlistEntry.upsert({
      where: {
        courseId_phone: { courseId: course.id, phone },
      },
      create: { courseId: course.id, phone },
      update: {},
    });

    return {
      ok: true,
      message:
        "پیش‌ثبت‌نام ثبت شد. بعد از انتشار، پیامک اطلاع‌رسانی می‌فرستیم.",
    };
  }
}

function courseOrder(sort?: CourseSort): Prisma.CourseOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }, { title: "asc" }];
    case "price_asc":
      return [{ priceToman: "asc" }, { title: "asc" }];
    case "price_desc":
      return [{ priceToman: "desc" }, { title: "asc" }];
    case "title":
      return [{ title: "asc" }];
    default:
      return [{ sortOrder: "asc" }, { title: "asc" }];
  }
}

function readingMinutes(body: string, explicit: number | null): number {
  if (explicit && explicit > 0) return explicit;
  return Math.max(1, Math.round(body.trim().length / 700));
}

function toPublicArticleCard(article: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  coverAsset: string | null;
  publishedAt: Date | null;
  readingMinutes: number | null;
  noIndex?: boolean;
}) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    coverAsset: article.coverAsset,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    readingMinutes: readingMinutes(article.body, article.readingMinutes),
    href: `/journal/${article.slug}`,
    noIndex: Boolean(article.noIndex),
  };
}

function toPublicArticle(article: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  coverAsset: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  publishedAt: Date | null;
  readingMinutes: number | null;
}) {
  return {
    ...toPublicArticleCard(article),
    body: article.body,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    ogImage: article.ogImage,
    noIndex: article.noIndex,
  };
}
