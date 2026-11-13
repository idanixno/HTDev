import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CourseOfferKind,
  CoursePublicationStatus,
  Prisma,
  TopicPublicationStatus,
} from "@zharfa/database";
import { mergeSiteChrome } from "../cms/site-chrome";
import { normalizePhone } from "../identity/normalization";
import { PrismaService } from "../prisma/prisma.service";
import {
  toPublicCourseCard,
  toPublicCourseDetail,
  toPublicPathDetail,
  toPublicPathSummary,
} from "./catalog.mapper";
import type { CourseSort, ListCoursesQueryDto } from "./dto/list-courses.dto";
import type {
  ListTopicsQueryDto,
  TopicContentQueryDto,
} from "./dto/list-topics.dto";
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
    if (query.topic) {
      where.topicLinks = {
        some: {
          topic: {
            slug: query.topic,
            status: TopicPublicationStatus.PUBLISHED,
          },
        },
      };
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
        topicLinks: {
          orderBy: { sortOrder: "asc" },
          include: {
            topic: { select: { slug: true, name: true, status: true } },
          },
        },
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

    const noteRows = await this.prisma.coursePurchaseNote.findMany({
      where: {
        published: true,
        OR: [{ courseId: null }, { courseId: course.id }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const purchaseNotes = [...noteRows]
      .sort((a, b) => {
        const aScope = a.courseId ? 1 : 0;
        const bScope = b.courseId ? 1 : 0;
        if (aScope !== bScope) return aScope - bScope;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .map((n) => ({
        id: n.id,
        body: n.body,
        sortOrder: n.sortOrder,
        scope: (n.courseId ? "course" : "global") as "global" | "course",
      }));

    return toPublicCourseDetail(course, purchaseNotes);
  }

  async listPaths() {
    const rows = await this.prisma.learningPath.findMany({
      where: { published: true },
      include: { _count: { select: { steps: true } } },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    return rows.map(toPublicPathSummary);
  }

  async getPathsPageCms() {
    const row = await this.prisma.cmsPathsContent.findUnique({
      where: { id: "paths" },
    });
    return {
      title: row?.title ?? "نقشهٔ راه یادگیری",
      lead:
        row?.lead ??
        "مسیرهای پیشنهادی برای یادگیری عمیق. دوره‌ها را به ترتیب ببینید.",
      seoTitle: row?.seoTitle ?? "نقشهٔ راه",
      seoDescription:
        row?.seoDescription ??
        "ترتیب پیشنهادی دوره‌های DXCode — هر مسیر را به ترتیب بخوانید؛ هر دوره جدا فروخته می‌شود.",
    };
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

  /**
   * Published learning paths that include this course — used as a
   * domain specialization timeline (پیش‌نیاز → این دوره → ادامه مسیر).
   */
  async listTracksForCourse(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        publicationStatus: CoursePublicationStatus.PUBLISHED,
      },
      select: { id: true, slug: true, title: true },
    });
    if (!course) {
      throw new NotFoundException("دوره یافت نشد.");
    }

    const paths = await this.prisma.learningPath.findMany({
      where: {
        published: true,
        steps: { some: { courseId: course.id } },
      },
      include: {
        steps: {
          orderBy: { sortOrder: "asc" },
          include: {
            course: { include: courseCardInclude },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return paths.map((path) => {
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
      const detail = toPublicPathDetail(sanitized);
      const steps = detail.steps ?? [];
      const currentIndex = steps.findIndex(
        (step) => step.course?.slug === course.slug,
      );
      return {
        ...detail,
        credentialLabel: `تخصص DXCode · ${path.title}`,
        currentCourseSlug: course.slug,
        currentStepIndex: currentIndex >= 0 ? currentIndex : null,
      };
    });
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
    });
    return mergeSiteChrome(row);
  }

  async getHomeAnnouncement() {
    const row = await this.prisma.cmsHomeContent.findUnique({
      where: { id: "home" },
      select: {
        announcementEnabled: true,
        announcementText: true,
        announcementHref: true,
        announcementCtaLabel: true,
      },
    });
    const text = row?.announcementText?.trim() ?? "";
    if (!row?.announcementEnabled || !text) {
      return { enabled: false as const };
    }
    const rawHref = row.announcementHref?.trim() ?? "";
    const href =
      rawHref.startsWith("/") ||
      rawHref.startsWith("https://") ||
      rawHref.startsWith("http://")
        ? rawHref.slice(0, 300)
        : null;
    const ctaLabel = row.announcementCtaLabel?.trim().slice(0, 80) || null;
    return {
      enabled: true as const,
      text: text.slice(0, 500),
      href,
      ctaLabel: href ? ctaLabel || "ادامه" : null,
    };
  }

  /** Suggest journal notes that overlap the course topic, description, and syllabus. */
  async listRelatedArticlesForCourse(slug: string, limit = 4) {
    const take = Math.min(Math.max(limit, 1), 6);
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
      take,
    );

    if (ranked.length >= take) {
      return ranked.map(toPublicArticleCard);
    }

    const seen = new Set(ranked.map((row) => row.id));
    const filled = [
      ...ranked,
      ...articles.filter((row) => !seen.has(row.id)).slice(0, take - ranked.length),
    ];
    return filled.map(toPublicArticleCard);
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, published: true },
      include: {
        topicLinks: {
          orderBy: { sortOrder: "asc" },
          where: {
            topic: { status: TopicPublicationStatus.PUBLISHED },
          },
          include: {
            topic: { select: { slug: true, name: true } },
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException("مقاله یافت نشد.");
    }
    return {
      ...toPublicArticle(article),
      topics: article.topicLinks.map((link) => ({
        slug: link.topic.slug,
        name: link.topic.name,
        href: `/topics/${link.topic.slug}`,
      })),
    };
  }

  /** Published + indexable topics for sitemap / index. */
  async listPublishedTopics(query: ListTopicsQueryDto = {}) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const where: Prisma.TopicWhereInput = {
      status: TopicPublicationStatus.PUBLISHED,
      indexable: true,
    };
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.topic.count({ where }),
      this.prisma.topic.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          parent: { select: { slug: true, name: true } },
          _count: {
            select: {
              children: {
                where: {
                  status: TopicPublicationStatus.PUBLISHED,
                },
              },
              courseLinks: {
                where: {
                  course: {
                    publicationStatus: CoursePublicationStatus.PUBLISHED,
                    noIndex: false,
                  },
                },
              },
              journalLinks: {
                where: {
                  article: { published: true, noIndex: false },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        h1: row.h1 ?? row.name,
        href: `/topics/${row.slug}`,
        parent: row.parent
          ? {
              slug: row.parent.slug,
              name: row.parent.name,
              href: `/topics/${row.parent.slug}`,
            }
          : null,
        childCount: row._count.children,
        courseCount: row._count.courseLinks,
        articleCount: row._count.journalLinks,
        updatedAt: row.updatedAt.toISOString(),
        publishedAt: row.publishedAt?.toISOString() ?? null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /** Shallow published tree (roots + direct published children). */
  async listTopicTree() {
    const roots = await this.prisma.topic.findMany({
      where: {
        status: TopicPublicationStatus.PUBLISHED,
        parentTopicId: null,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: { status: TopicPublicationStatus.PUBLISHED },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            sortOrder: true,
          },
        },
      },
    });

    return roots.map((root) => ({
      id: root.id,
      slug: root.slug,
      name: root.name,
      description: root.description,
      href: `/topics/${root.slug}`,
      children: root.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        description: child.description,
        href: `/topics/${child.slug}`,
        sortOrder: child.sortOrder,
      })),
    }));
  }

  async getTopicBySlug(
    slug: string,
    contentQuery: TopicContentQueryDto = {},
  ) {
    const topicSelectParent = {
      id: true,
      slug: true,
      name: true,
      status: true,
      parentTopicId: true,
    } as const;

    const topic = await this.prisma.topic.findFirst({
      where: {
        slug,
        status: TopicPublicationStatus.PUBLISHED,
      },
      include: {
        parent: {
          select: {
            ...topicSelectParent,
            parent: {
              select: {
                ...topicSelectParent,
                parent: { select: topicSelectParent },
              },
            },
          },
        },
        children: {
          where: { status: TopicPublicationStatus.PUBLISHED },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
        },
        relationsFrom: {
          where: {
            toTopic: { status: TopicPublicationStatus.PUBLISHED },
          },
          include: {
            toTopic: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
            },
          },
        },
        relationsTo: {
          where: {
            fromTopic: { status: TopicPublicationStatus.PUBLISHED },
          },
          include: {
            fromTopic: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException("موضوع یافت نشد.");
    }

    const children = topic.children;

    const coursePage = contentQuery.page ?? 1;
    const coursePageSize = contentQuery.pageSize ?? 12;
    const articlePage = contentQuery.page ?? 1;
    const articlePageSize = contentQuery.pageSize ?? 12;
    const courseWhere: Prisma.CourseWhereInput = {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      noIndex: false,
      topicLinks: { some: { topicId: topic.id } },
    };
    const articleWhere: Prisma.ArticleWhereInput = {
      published: true,
      noIndex: false,
      topicLinks: { some: { topicId: topic.id } },
    };
    const [courseTotal, courseRows, articleTotal, articleRows] =
      await this.prisma.$transaction([
        this.prisma.course.count({ where: courseWhere }),
        this.prisma.course.findMany({
          where: courseWhere,
          include: courseCardInclude,
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          skip: (coursePage - 1) * coursePageSize,
          take: coursePageSize,
        }),
        this.prisma.article.count({ where: articleWhere }),
        this.prisma.article.findMany({
          where: articleWhere,
          orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
          skip: (articlePage - 1) * articlePageSize,
          take: articlePageSize,
        }),
      ]);

    const breadcrumbs = this.breadcrumbsFromParentChain(topic);

    const relatedMap = new Map<
      string,
      { id: string; slug: string; name: string; description: string | null; href: string }
    >();
    for (const rel of topic.relationsFrom) {
      relatedMap.set(rel.toTopic.id, {
        ...rel.toTopic,
        href: `/topics/${rel.toTopic.slug}`,
      });
    }
    for (const rel of topic.relationsTo) {
      relatedMap.set(rel.fromTopic.id, {
        ...rel.fromTopic,
        href: `/topics/${rel.fromTopic.slug}`,
      });
    }

    return {
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      h1: topic.h1 ?? topic.name,
      description: topic.description,
      introContent: topic.introContent,
      seoTitle: topic.seoTitle,
      seoDescription: topic.seoDescription,
      canonicalUrl: topic.canonicalUrl,
      indexable: topic.indexable,
      href: `/topics/${topic.slug}`,
      parent:
        topic.parent && topic.parent.status === TopicPublicationStatus.PUBLISHED
          ? {
              slug: topic.parent.slug,
              name: topic.parent.name,
              href: `/topics/${topic.parent.slug}`,
            }
          : null,
      breadcrumbs,
      children: children.map((child) => ({
        ...child,
        href: `/topics/${child.slug}`,
      })),
      relatedTopics: [...relatedMap.values()],
      courses: {
        items: courseRows.map(toPublicCourseCard),
        page: coursePage,
        pageSize: coursePageSize,
        total: courseTotal,
        totalPages: Math.max(1, Math.ceil(courseTotal / coursePageSize)),
      },
      articles: {
        items: articleRows.map(toPublicArticleCard),
        page: articlePage,
        pageSize: articlePageSize,
        total: articleTotal,
        totalPages: Math.max(1, Math.ceil(articleTotal / articlePageSize)),
      },
      publishedAt: topic.publishedAt?.toISOString() ?? null,
      updatedAt: topic.updatedAt.toISOString(),
    };
  }

  /** Build crumbs from nested parent include (max depth 3) — no per-level queries. */
  private breadcrumbsFromParentChain(topic: {
    slug: string;
    name: string;
    status?: TopicPublicationStatus;
    parent: null | {
      slug: string;
      name: string;
      status: TopicPublicationStatus;
      parent: null | {
        slug: string;
        name: string;
        status: TopicPublicationStatus;
        parent: null | {
          slug: string;
          name: string;
          status: TopicPublicationStatus;
        };
      };
    };
  }) {
    const chain: Array<{ name: string; slug: string; href: string }> = [];
    const pushIfPublished = (node: {
      slug: string;
      name: string;
      status?: TopicPublicationStatus;
    }) => {
      if (node.status && node.status !== TopicPublicationStatus.PUBLISHED) {
        return;
      }
      chain.push({
        name: node.name,
        slug: node.slug,
        href: `/topics/${node.slug}`,
      });
    };

    const p0 = topic.parent;
    const p1 = p0?.parent ?? null;
    const p2 = p1?.parent ?? null;
    if (p2) pushIfPublished(p2);
    if (p1) pushIfPublished(p1);
    if (p0) pushIfPublished(p0);
    pushIfPublished(topic);
    return chain;
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
  updatedAt: Date;
  readingMinutes: number | null;
}) {
  return {
    ...toPublicArticleCard(article),
    body: article.body,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    ogImage: article.ogImage,
    noIndex: article.noIndex,
    updatedAt: article.updatedAt.toISOString(),
  };
}
