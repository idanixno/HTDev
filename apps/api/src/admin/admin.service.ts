import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  CouponDiscountType,
  CourseOfferKind,
  CoursePublicationStatus,
  OrderStatus,
  Prisma,
  TopicPublicationStatus,
  TopicRelationType,
  UserRole,
} from "@zharfa/database";
import {
  assertValidParent,
  buildParentMaps,
} from "../catalog/topic-hierarchy";
import { decimalToNumber, formatTomanLabel } from "../catalog/pricing";
import {
  canTransitionOrder,
} from "../commerce/order-status";
import {
  MESSAGING_PROVIDER,
  type MessagingProvider,
} from "../identity/messaging/messaging.types";
import { mergeSiteChrome } from "../cms/site-chrome";
import { PrismaService } from "../prisma/prisma.service";
import { SpotPlayerService } from "../spotplayer/spotplayer.service";
import { AuditService } from "./audit.service";
import type {
  CreatePathStepDto,
  TopicRelationDto,
  UpsertArticleDto,
  UpsertCategoryDto,
  UpsertCouponDto,
  UpsertCourseDto,
  UpsertFaqDto,
  UpsertLearningPathDto,
  UpsertLessonDto,
  UpsertModuleDto,
  UpsertTopicDto,
  UpdateFooterCmsDto,
  UpdateHomeCmsDto,
  UpdatePathsCmsDto,
  UpdatePathStepDto,
} from "./dto/admin.dto";

/** Admin may also force-confirm offline payment → PAID. */
function canAdminTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (canTransitionOrder(from, to)) return true;
  if (
    to === OrderStatus.PAID &&
    (from === OrderStatus.PENDING || from === OrderStatus.FAILED)
  ) {
    return true;
  }
  return false;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly spotplayer: SpotPlayerService,
    @Inject(MESSAGING_PROVIDER)
    private readonly messaging: MessagingProvider,
  ) {}

  // ── Courses ──────────────────────────────────────────────────────────

  async listCourses(query: { q?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.CourseWhereInput = {};
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
      ];
    }
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: { category: true, _count: { select: { orders: true } } },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      items: rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        publicationStatus: c.publicationStatus,
        offerKind: c.offerKind,
        priceToman: decimalToNumber(c.priceToman),
        priceLabel: formatTomanLabel(c.priceToman),
        featured: c.featured,
        sortOrder: c.sortOrder,
        category: c.category
          ? { id: c.category.id, title: c.category.title, slug: c.category.slug }
          : null,
        orderCount: c._count.orders,
        updatedAt: c.updatedAt.toISOString(),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async upsertCourse(actorId: string, dto: UpsertCourseDto, id?: string) {
    this.assertCoursePricing(dto);
    const existing = id
      ? await this.prisma.course.findUnique({ where: { id } })
      : null;
    if (id && !existing) throw new NotFoundException("دوره یافت نشد.");
    const data = {
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      summary: dto.summary ?? null,
      description: dto.description ?? null,
      categoryId: dto.categoryId || null,
      publicationStatus: dto.publicationStatus,
      offerKind: dto.offerKind,
      priceToman: new Prisma.Decimal(dto.priceToman),
      compareAtToman:
        dto.compareAtToman == null
          ? null
          : new Prisma.Decimal(dto.compareAtToman),
      levelLabel: dto.levelLabel ?? null,
      durationHours:
        dto.durationHours == null
          ? null
          : new Prisma.Decimal(dto.durationHours),
      lessonCount: dto.lessonCount ?? existing?.lessonCount ?? 0,
      featured: dto.featured ?? false,
      sortOrder: dto.sortOrder ?? 0,
      coverAsset: dto.coverAsset ?? null,
      previewAsset: this.cleanVideoAsset(dto.previewAsset),
      indexLabel: dto.indexLabel ?? null,
      diagramKind: dto.diagramKind,
      seoTitle: dto.seoTitle?.trim() || null,
      seoDescription: dto.seoDescription?.trim() || null,
      ogImage: dto.ogImage?.trim() || null,
      noIndex: dto.noIndex ?? false,
      publishedAt:
        dto.publicationStatus === CoursePublicationStatus.PUBLISHED
          ? (existing?.publishedAt ?? new Date())
          : null,
    };

    const previousOffer = existing?.offerKind ?? null;
    const course = await this.writeUnique(async () =>
      id
        ? this.prisma.course.update({ where: { id }, data })
        : this.prisma.course.create({ data }),
    );

    await this.audit.record({
      actorId,
      action: id ? "course.update" : "course.create",
      entityType: "Course",
      entityId: course.id,
      summary: id
        ? `به‌روزرسانی دوره «${course.title}»`
        : `ایجاد دوره «${course.title}»`,
      metadata: {
        slug: course.slug,
        publicationStatus: course.publicationStatus,
        offerKind: course.offerKind,
      },
    });

    if (
      previousOffer === CourseOfferKind.COMING_SOON &&
      course.offerKind !== CourseOfferKind.COMING_SOON
    ) {
      await this.notifyCourseWaitlist(course.id, course.title, course.slug);
    }

    return { id: course.id, slug: course.slug, title: course.title };
  }

  /** SMS waitlist when a course leaves به‌زودی. Console adapter in development. */
  private async notifyCourseWaitlist(
    courseId: string,
    title: string,
    slug: string,
  ) {
    const pending = await this.prisma.courseWaitlistEntry.findMany({
      where: { courseId, notifiedAt: null },
      select: { id: true, phone: true },
    });
    if (pending.length === 0) return;

    const body = `DXCode: دوره «${title}» منتشر شد. ثبت‌نام: /courses/${slug}`;
    const now = new Date();
    for (const row of pending) {
      try {
        await this.messaging.sendSms({ to: row.phone, body });
        await this.prisma.courseWaitlistEntry.update({
          where: { id: row.id },
          data: { notifiedAt: now },
        });
      } catch (error) {
        this.logger.warn(
          `waitlist SMS failed for ${row.phone}: ${
            error instanceof Error ? error.message : "unknown"
          }`,
        );
      }
    }
  }

  async getCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (!course) throw new NotFoundException("دوره یافت نشد.");

    const mapLesson = (lesson: (typeof course.modules)[number]["lessons"][number]) => ({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      sortOrder: lesson.sortOrder,
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
      previewAsset: lesson.previewAsset,
      videoAsset: lesson.videoAsset,
      moduleId: lesson.moduleId,
    });

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      description: course.description,
      categoryId: course.categoryId,
      publicationStatus: course.publicationStatus,
      offerKind: course.offerKind,
      priceToman: decimalToNumber(course.priceToman),
      compareAtToman:
        course.compareAtToman == null
          ? null
          : decimalToNumber(course.compareAtToman),
      levelLabel: course.levelLabel,
      durationHours:
        course.durationHours == null
          ? null
          : decimalToNumber(course.durationHours),
      lessonCount: course.lessonCount,
      featured: course.featured,
      sortOrder: course.sortOrder,
      coverAsset: course.coverAsset,
      previewAsset: course.previewAsset,
      indexLabel: course.indexLabel,
      diagramKind: course.diagramKind,
      seoTitle: course.seoTitle,
      seoDescription: course.seoDescription,
      ogImage: course.ogImage,
      noIndex: course.noIndex,
      modules: course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        summary: mod.summary,
        sortOrder: mod.sortOrder,
        lessons: mod.lessons.map(mapLesson),
      })),
    };
  }

  async upsertModule(actorId: string, courseId: string, dto: UpsertModuleDto, id?: string) {
    await this.requireCourse(courseId);
    if (id) {
      const existing = await this.prisma.curriculumModule.findFirst({
        where: { id, courseId },
      });
      if (!existing) throw new NotFoundException("فصل یافت نشد.");
    }
    const data = {
      title: dto.title.trim(),
      summary: dto.summary ?? null,
      sortOrder: dto.sortOrder ?? 0,
    };
    const module = await this.writeUnique(async () =>
      id
        ? this.prisma.curriculumModule.update({ where: { id }, data })
        : this.prisma.curriculumModule.create({ data: { ...data, courseId } }),
    );
    await this.audit.record({
      actorId,
      action: id ? "course.module.update" : "course.module.create",
      entityType: "CurriculumModule",
      entityId: module.id,
      summary: `${id ? "ویرایش" : "افزودن"} فصل «${module.title}»`,
      metadata: { courseId },
    });
    return { id: module.id, title: module.title };
  }

  async patchModule(actorId: string, id: string, dto: UpsertModuleDto) {
    const existing = await this.prisma.curriculumModule.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("فصل یافت نشد.");
    return this.upsertModule(actorId, existing.courseId, dto, id);
  }

  async deleteModule(actorId: string, id: string) {
    const existing = await this.prisma.curriculumModule.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("فصل یافت نشد.");
    await this.prisma.$transaction([
      this.prisma.lesson.deleteMany({ where: { moduleId: id } }),
      this.prisma.curriculumModule.delete({ where: { id } }),
    ]);
    await this.refreshLessonCount(existing.courseId);
    await this.audit.record({
      actorId,
      action: "course.module.delete",
      entityType: "CurriculumModule",
      entityId: id,
      summary: `حذف فصل «${existing.title}»`,
      metadata: { courseId: existing.courseId },
    });
    return { ok: true };
  }

  async upsertLesson(
    actorId: string,
    courseId: string,
    dto: UpsertLessonDto,
    id?: string,
  ) {
    await this.requireCourse(courseId);
    if (dto.moduleId) {
      const module = await this.prisma.curriculumModule.findFirst({
        where: { id: dto.moduleId, courseId },
      });
      if (!module) throw new BadRequestException("فصل انتخاب‌شده به این دوره تعلق ندارد.");
    }
    if (id) {
      const existing = await this.prisma.lesson.findFirst({
        where: { id, courseId },
      });
      if (!existing) throw new NotFoundException("درس یافت نشد.");
    }
    const isPreview = dto.isPreview ?? false;
    const previewAsset = dto.previewAsset?.trim() || null;
    const data = {
      title: dto.title.trim(),
      summary: dto.summary ?? null,
      sortOrder: dto.sortOrder ?? 0,
      durationMinutes: dto.durationMinutes ?? null,
      isPreview,
      previewAsset: isPreview ? previewAsset : null,
      videoAsset: this.cleanVideoAsset(dto.videoAsset),
      moduleId: dto.moduleId || null,
    };
    const lesson = await this.writeUnique(async () =>
      id
        ? this.prisma.lesson.update({ where: { id }, data })
        : this.prisma.lesson.create({ data: { ...data, courseId } }),
    );
    await this.refreshLessonCount(courseId);
    await this.audit.record({
      actorId,
      action: id ? "course.lesson.update" : "course.lesson.create",
      entityType: "Lesson",
      entityId: lesson.id,
      summary: `${id ? "ویرایش" : "افزودن"} درس «${lesson.title}»`,
      metadata: { courseId },
    });
    return { id: lesson.id, title: lesson.title };
  }

  async patchLesson(actorId: string, id: string, dto: UpsertLessonDto) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("درس یافت نشد.");
    return this.upsertLesson(actorId, existing.courseId, dto, id);
  }

  async deleteLesson(actorId: string, id: string) {
    const existing = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("درس یافت نشد.");
    await this.prisma.lesson.delete({ where: { id } });
    await this.refreshLessonCount(existing.courseId);
    await this.audit.record({
      actorId,
      action: "course.lesson.delete",
      entityType: "Lesson",
      entityId: id,
      summary: `حذف درس «${existing.title}»`,
      metadata: { courseId: existing.courseId },
    });
    return { ok: true };
  }

  async listArticles() {
    const rows = await this.prisma.article.findMany({
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return rows.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      published: article.published,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      sortOrder: article.sortOrder,
      updatedAt: article.updatedAt.toISOString(),
    }));
  }

  async getArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException("مقاله یافت نشد.");
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      body: article.body,
      coverAsset: article.coverAsset,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      ogImage: article.ogImage,
      noIndex: article.noIndex,
      published: article.published,
      readingMinutes: article.readingMinutes,
      sortOrder: article.sortOrder,
    };
  }

  async upsertArticle(actorId: string, dto: UpsertArticleDto, id?: string) {
    const existing = id
      ? await this.prisma.article.findUnique({ where: { id } })
      : null;
    if (id && !existing) throw new NotFoundException("مقاله یافت نشد.");
    const published = dto.published ?? false;
    const blank = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };
    const data = {
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      summary: blank(dto.summary),
      body: dto.body.trim(),
      coverAsset: blank(dto.coverAsset),
      seoTitle: blank(dto.seoTitle),
      seoDescription: blank(dto.seoDescription),
      ogImage: blank(dto.ogImage),
      noIndex: dto.noIndex ?? false,
      published,
      publishedAt: published ? (existing?.publishedAt ?? new Date()) : null,
      readingMinutes: dto.readingMinutes ?? null,
      sortOrder: dto.sortOrder ?? 0,
    };
    const article = await this.writeUnique(async () =>
      id
        ? this.prisma.article.update({ where: { id }, data })
        : this.prisma.article.create({ data }),
    );
    await this.audit.record({
      actorId,
      action: id ? "article.update" : "article.create",
      entityType: "Article",
      entityId: article.id,
      summary: id
        ? `به‌روزرسانی مقاله «${article.title}»`
        : `ایجاد مقاله «${article.title}»`,
      metadata: { slug: article.slug, published: article.published },
    });
    return { id: article.id, slug: article.slug, title: article.title };
  }

  async deleteArticle(actorId: string, id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException("مقاله یافت نشد.");
    await this.prisma.article.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "article.delete",
      entityType: "Article",
      entityId: id,
      summary: `حذف مقاله «${article.title}»`,
    });
    return { ok: true };
  }

  async listLearningPaths() {
    return this.prisma.learningPath.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        steps: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            sortOrder: true,
            noIndex: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async getLearningPath(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        steps: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            sortOrder: true,
            noIndex: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!path) throw new NotFoundException("مسیر یافت نشد.");
    return path;
  }

  async upsertLearningPath(
    actorId: string,
    dto: UpsertLearningPathDto,
    id?: string,
  ) {
    const blank = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };
    const data = {
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      summary: blank(dto.summary),
      description: blank(dto.description),
      coverAsset: blank(dto.coverAsset),
      published: dto.published ?? false,
      sortOrder: dto.sortOrder ?? 0,
    };
    const path = await this.writeUnique(async () =>
      id
        ? this.prisma.learningPath.update({ where: { id }, data })
        : this.prisma.learningPath.create({ data }),
    );
    await this.audit.record({
      actorId,
      action: id ? "path.update" : "path.create",
      entityType: "LearningPath",
      entityId: path.id,
      summary: id
        ? `به‌روزرسانی مسیر «${path.title}»`
        : `ایجاد مسیر «${path.title}»`,
      metadata: { slug: path.slug, published: path.published },
    });
    return {
      id: path.id,
      slug: path.slug,
      title: path.title,
      published: path.published,
    };
  }

  async deleteLearningPath(actorId: string, id: string) {
    const path = await this.prisma.learningPath.findUnique({ where: { id } });
    if (!path) throw new NotFoundException("مسیر یافت نشد.");
    await this.prisma.learningPath.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "path.delete",
      entityType: "LearningPath",
      entityId: id,
      summary: `حذف مسیر «${path.title}»`,
    });
    return { ok: true };
  }

  async getLearningPathStep(pathId: string, stepId: string) {
    const step = await this.prisma.learningPathStep.findFirst({
      where: { id: stepId, pathId },
      include: {
        path: { select: { id: true, title: true, slug: true } },
        course: { select: { title: true, slug: true } },
      },
    });
    if (!step) throw new NotFoundException("این گام پیدا نشد.");
    return step;
  }

  async createLearningPathStep(
    actorId: string,
    pathId: string,
    dto: CreatePathStepDto,
  ) {
    await this.getLearningPath(pathId);
    const blank = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };
    let sortOrder = dto.sortOrder;
    if (sortOrder == null) {
      const agg = await this.prisma.learningPathStep.aggregate({
        where: { pathId },
        _max: { sortOrder: true },
      });
      sortOrder = (agg._max.sortOrder ?? -1) + 1;
    }
    const step = await this.writeUnique(async () =>
      this.prisma.learningPathStep.create({
        data: {
          pathId,
          title: dto.title.trim(),
          slug: dto.slug.trim().toLowerCase(),
          summary: blank(dto.summary),
          body: dto.body?.trim() ?? "",
          seoTitle: blank(dto.seoTitle),
          seoDescription: blank(dto.seoDescription),
          ogImage: blank(dto.ogImage),
          noIndex: dto.noIndex ?? false,
          sortOrder,
          courseId: blank(dto.courseId),
        },
      }),
    );
    await this.audit.record({
      actorId,
      action: "path-step.create",
      entityType: "LearningPathStep",
      entityId: step.id,
      summary: `ایجاد گام «${step.title}»`,
      metadata: { slug: step.slug, pathId },
    });
    return { id: step.id, slug: step.slug, title: step.title };
  }

  async updateLearningPathStep(
    actorId: string,
    pathId: string,
    stepId: string,
    dto: UpdatePathStepDto,
  ) {
    const existing = await this.getLearningPathStep(pathId, stepId);
    const blank = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };
    const step = await this.writeUnique(async () =>
      this.prisma.learningPathStep.update({
        where: { id: existing.id },
        data: {
          title: dto.title.trim(),
          slug: dto.slug.trim().toLowerCase(),
          summary: blank(dto.summary),
          body: dto.body?.trim() ?? "",
          seoTitle: blank(dto.seoTitle),
          seoDescription: blank(dto.seoDescription),
          ogImage: blank(dto.ogImage),
          noIndex: dto.noIndex ?? false,
          ...(dto.sortOrder != null ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.courseId !== undefined
            ? { courseId: blank(dto.courseId) }
            : {}),
        },
      }),
    );
    await this.audit.record({
      actorId,
      action: "path-step.update",
      entityType: "LearningPathStep",
      entityId: step.id,
      summary: `به‌روزرسانی گام «${step.title}»`,
      metadata: { slug: step.slug, pathId },
    });
    return { id: step.id, slug: step.slug, title: step.title };
  }

  async deleteLearningPathStep(
    actorId: string,
    pathId: string,
    stepId: string,
  ) {
    const existing = await this.getLearningPathStep(pathId, stepId);
    await this.prisma.learningPathStep.delete({ where: { id: existing.id } });
    await this.audit.record({
      actorId,
      action: "path-step.delete",
      entityType: "LearningPathStep",
      entityId: stepId,
      summary: `حذف گام «${existing.title}»`,
      metadata: { pathId },
    });
    return { ok: true };
  }

  // ── Topics (SEO hubs; independent of Category) ───────────────────────

  async listTopics(query: { q?: string; page?: number; pageSize?: number; status?: string }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.TopicWhereInput = {};
    if (
      query.status &&
      Object.values(TopicPublicationStatus).includes(
        query.status as TopicPublicationStatus,
      )
    ) {
      where.status = query.status as TopicPublicationStatus;
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
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
          parent: { select: { id: true, name: true, slug: true } },
          _count: {
            select: {
              children: true,
              courseLinks: true,
              journalLinks: true,
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        status: row.status,
        indexable: row.indexable,
        sortOrder: row.sortOrder,
        parent: row.parent,
        childCount: row._count.children,
        courseCount: row._count.courseLinks,
        articleCount: row._count.journalLinks,
        href: `/topics/${row.slug}`,
        updatedAt: row.updatedAt.toISOString(),
        publishedAt: row.publishedAt?.toISOString() ?? null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getTopic(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, status: true },
        },
        courseLinks: {
          orderBy: { sortOrder: "asc" },
          include: {
            course: { select: { id: true, title: true, slug: true } },
          },
        },
        journalLinks: {
          orderBy: { sortOrder: "asc" },
          include: {
            article: { select: { id: true, title: true, slug: true } },
          },
        },
        relationsFrom: {
          include: {
            toTopic: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!topic) throw new NotFoundException("موضوع یافت نشد.");
    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      introContent: topic.introContent,
      seoTitle: topic.seoTitle,
      seoDescription: topic.seoDescription,
      h1: topic.h1,
      parentTopicId: topic.parentTopicId,
      parent: topic.parent,
      canonicalUrl: topic.canonicalUrl,
      indexable: topic.indexable,
      status: topic.status,
      sortOrder: topic.sortOrder,
      publishedAt: topic.publishedAt?.toISOString() ?? null,
      updatedAt: topic.updatedAt.toISOString(),
      children: topic.children,
      courseIds: topic.courseLinks.map((l) => l.courseId),
      courses: topic.courseLinks.map((l) => l.course),
      articleIds: topic.journalLinks.map((l) => l.articleId),
      articles: topic.journalLinks.map((l) => l.article),
      relations: topic.relationsFrom.map((r) => ({
        id: r.id,
        relationType: r.relationType,
        toTopic: r.toTopic,
      })),
      href: `/topics/${topic.slug}`,
    };
  }

  async upsertTopic(
    actorId: string,
    dto: UpsertTopicDto,
    id?: string,
    /** Raw JSON keys from the request body (avoids Nest undefined-field wipe). */
    providedKeys?: string[],
  ) {
    const existing = id
      ? await this.prisma.topic.findUnique({ where: { id } })
      : null;
    if (id && !existing) throw new NotFoundException("موضوع یافت نشد.");

    const keys = new Set(
      providedKeys ??
        (id
          ? Object.keys(dto as object)
          : [
              "name",
              "slug",
              "description",
              "introContent",
              "seoTitle",
              "seoDescription",
              "h1",
              "parentTopicId",
              "canonicalUrl",
              "indexable",
              "status",
              "sortOrder",
              "courseIds",
              "articleIds",
            ]),
    );
    const has = (key: string) => keys.has(key);

    const parentTopicId = has("parentTopicId")
      ? dto.parentTopicId?.trim() || null
      : (existing?.parentTopicId ?? null);
    await this.assertTopicParentAllowed(id ?? null, parentTopicId);

    if (dto.courseIds) {
      await this.assertCourseIdsExist(dto.courseIds);
    }
    if (dto.articleIds) {
      await this.assertArticleIdsExist(dto.articleIds);
    }

    const becomingPublished =
      dto.status === TopicPublicationStatus.PUBLISHED &&
      existing?.status !== TopicPublicationStatus.PUBLISHED;

    const optionalText = (
      key: "description" | "introContent" | "seoTitle" | "seoDescription" | "h1" | "canonicalUrl",
      fallback: string | null,
    ) => {
      if (!has(key)) return fallback;
      const raw = dto[key];
      if (raw == null) return null;
      const trimmed = String(raw).trim();
      return trimmed.length ? trimmed : null;
    };

    const data = {
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      description: optionalText("description", existing?.description ?? null),
      introContent: optionalText("introContent", existing?.introContent ?? null),
      seoTitle: optionalText("seoTitle", existing?.seoTitle ?? null),
      seoDescription: optionalText(
        "seoDescription",
        existing?.seoDescription ?? null,
      ),
      h1: optionalText("h1", existing?.h1 ?? null),
      parentTopicId,
      canonicalUrl: optionalText(
        "canonicalUrl",
        existing?.canonicalUrl ?? null,
      ),
      indexable: has("indexable")
        ? (dto.indexable ?? true)
        : (existing?.indexable ?? true),
      status: dto.status,
      sortOrder: has("sortOrder")
        ? (dto.sortOrder ?? 0)
        : (existing?.sortOrder ?? 0),
      publishedAt: becomingPublished
        ? new Date()
        : dto.status === TopicPublicationStatus.PUBLISHED
          ? (existing?.publishedAt ?? new Date())
          : existing?.publishedAt ?? null,
    };

    const topic = await this.writeUnique(async () => {
      if (id) {
        return this.prisma.$transaction(async (tx) => {
          const updated = await tx.topic.update({ where: { id }, data });
          if (dto.courseIds) {
            await tx.courseTopic.deleteMany({ where: { topicId: id } });
            if (dto.courseIds.length) {
              await tx.courseTopic.createMany({
                data: dto.courseIds.map((courseId, index) => ({
                  topicId: id,
                  courseId,
                  sortOrder: index,
                })),
              });
            }
          }
          if (dto.articleIds) {
            await tx.journalTopic.deleteMany({ where: { topicId: id } });
            if (dto.articleIds.length) {
              await tx.journalTopic.createMany({
                data: dto.articleIds.map((articleId, index) => ({
                  topicId: id,
                  articleId,
                  sortOrder: index,
                })),
              });
            }
          }
          return updated;
        });
      }
      return this.prisma.$transaction(async (tx) => {
        const created = await tx.topic.create({ data });
        if (dto.courseIds?.length) {
          await tx.courseTopic.createMany({
            data: dto.courseIds.map((courseId, index) => ({
              topicId: created.id,
              courseId,
              sortOrder: index,
            })),
          });
        }
        if (dto.articleIds?.length) {
          await tx.journalTopic.createMany({
            data: dto.articleIds.map((articleId, index) => ({
              topicId: created.id,
              articleId,
              sortOrder: index,
            })),
          });
        }
        return created;
      });
    });

    await this.audit.record({
      actorId,
      action: id ? "topic.update" : "topic.create",
      entityType: "Topic",
      entityId: topic.id,
      summary: id
        ? `به‌روزرسانی موضوع «${topic.name}»`
        : `ایجاد موضوع «${topic.name}»`,
      metadata: { slug: topic.slug, status: topic.status },
    });

    return this.getTopic(topic.id);
  }

  async deleteTopic(actorId: string, id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } },
    });
    if (!topic) throw new NotFoundException("موضوع یافت نشد.");
    if (topic._count.children > 0) {
      throw new BadRequestException(
        "این موضوع زیرموضوع دارد. اول زیرموضوع‌ها را جابه‌جا یا حذف کنید.",
      );
    }
    await this.prisma.topic.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "topic.delete",
      entityType: "Topic",
      entityId: id,
      summary: `حذف موضوع «${topic.name}»`,
    });
    return { ok: true };
  }

  async addTopicRelation(actorId: string, fromTopicId: string, dto: TopicRelationDto) {
    if (fromTopicId === dto.toTopicId) {
      throw new BadRequestException("موضوع نمی‌تواند به خودش مرتبط شود.");
    }
    const [from, to] = await Promise.all([
      this.prisma.topic.findUnique({ where: { id: fromTopicId } }),
      this.prisma.topic.findUnique({ where: { id: dto.toTopicId } }),
    ]);
    if (!from || !to) throw new NotFoundException("موضوع یافت نشد.");

    const relationType = dto.relationType ?? TopicRelationType.RELATED;
    const relation = await this.writeUnique(() =>
      this.prisma.topicRelation.create({
        data: {
          fromTopicId,
          toTopicId: dto.toTopicId,
          relationType,
        },
      }),
    );

    await this.audit.record({
      actorId,
      action: "topic.relation.create",
      entityType: "TopicRelation",
      entityId: relation.id,
      summary: `ارتباط ${relationType} از «${from.name}» به «${to.name}»`,
    });
    return relation;
  }

  async removeTopicRelation(actorId: string, relationId: string) {
    const existing = await this.prisma.topicRelation.findUnique({
      where: { id: relationId },
    });
    if (!existing) throw new NotFoundException("ارتباط یافت نشد.");
    await this.prisma.topicRelation.delete({ where: { id: relationId } });
    await this.audit.record({
      actorId,
      action: "topic.relation.delete",
      entityType: "TopicRelation",
      entityId: relationId,
      summary: "حذف ارتباط موضوعی",
      metadata: {
        fromTopicId: existing.fromTopicId,
        toTopicId: existing.toTopicId,
        relationType: existing.relationType,
      },
    });
    return { ok: true };
  }

  private async assertTopicParentAllowed(
    topicId: string | null,
    parentTopicId: string | null,
  ) {
    const rows = await this.prisma.topic.findMany({
      select: { id: true, parentTopicId: true },
    });
    const { byId, childrenOf } = buildParentMaps(rows);
    const result = assertValidParent({
      topicId: topicId ?? undefined,
      parentTopicId,
      byId,
      childrenOf,
    });
    if (result.ok) return;
    if (result.reason === "MISSING_PARENT") {
      throw new BadRequestException("والد انتخاب‌شده وجود ندارد.");
    }
    if (result.reason === "CYCLE") {
      throw new BadRequestException(
        "والد نامعتبر است؛ حلقه در سلسله‌مراتب موضوعات مجاز نیست.",
      );
    }
    throw new BadRequestException(
      "عمق سلسله‌مراتب موضوعات بیش از حد مجاز است (حداکثر ۳ سطح).",
    );
  }

  private async assertCourseIdsExist(ids: string[]) {
    if (!ids.length) return;
    const count = await this.prisma.course.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length) {
      throw new BadRequestException("یکی از شناسه‌های دوره نامعتبر است.");
    }
  }

  private async assertArticleIdsExist(ids: string[]) {
    if (!ids.length) return;
    const count = await this.prisma.article.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length) {
      throw new BadRequestException("یکی از شناسه‌های مقاله نامعتبر است.");
    }
  }

  // ── Categories ───────────────────────────────────────────────────────

  async listCategories() {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { _count: { select: { courses: true } } },
    });
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      sortOrder: c.sortOrder,
      courseCount: c._count.courses,
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async upsertCategory(actorId: string, dto: UpsertCategoryDto, id?: string) {
    const data = {
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      summary: dto.summary ?? null,
      sortOrder: dto.sortOrder ?? 0,
    };
    const category = await this.writeUnique(async () =>
      id
        ? this.prisma.category.update({ where: { id }, data })
        : this.prisma.category.create({ data }),
    );

    await this.audit.record({
      actorId,
      action: id ? "category.update" : "category.create",
      entityType: "Category",
      entityId: category.id,
      summary: id
        ? `به‌روزرسانی دسته «${category.title}»`
        : `ایجاد دسته «${category.title}»`,
    });

    return category;
  }

  async deleteCategory(actorId: string, id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("دسته یافت نشد.");
    // Course.categoryId uses onDelete: SetNull — courses stay, lose this category.
    await this.prisma.category.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "category.delete",
      entityType: "Category",
      entityId: id,
      summary: `حذف دسته «${category.title}»`,
    });
    return { ok: true };
  }

  // ── Orders ───────────────────────────────────────────────────────────

  async listOrders(query: {
    q?: string;
    status?: string;
    licenseStatus?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.OrderWhereInput = {};
    if (query.status && Object.values(OrderStatus).includes(query.status as OrderStatus)) {
      where.status = query.status as OrderStatus;
    }
    const licenseStatuses = [
      "PENDING",
      "QUEUED",
      "IN_PROGRESS",
      "SUCCEEDED",
      "FAILED",
    ] as const;
    if (
      query.licenseStatus &&
      licenseStatuses.includes(
        query.licenseStatus as (typeof licenseStatuses)[number],
      )
    ) {
      where.spotPlayerLicenses = {
        some: {
          status: query.licenseStatus as (typeof licenseStatuses)[number],
        },
      };
    }
    if (query.q) {
      where.OR = [
        { id: { contains: query.q } },
        { couponCode: { contains: query.q, mode: "insensitive" } },
        { user: { email: { contains: query.q, mode: "insensitive" } } },
        { user: { username: { contains: query.q, mode: "insensitive" } } },
        { course: { title: { contains: query.q, mode: "insensitive" } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              email: true,
            },
          },
          course: {
            select: { id: true, slug: true, title: true },
          },
          spotPlayerLicenses: {
            select: {
              id: true,
              status: true,
              lastError: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((o) => {
        const license = o.spotPlayerLicenses[0] ?? null;
        return {
          id: o.id,
          status: o.status,
          paymentProvider: o.paymentProvider,
          amountToman: decimalToNumber(o.amountToman),
          amountLabel: formatTomanLabel(o.amountToman),
          couponCode: o.couponCode,
          paidAt: o.paidAt?.toISOString() ?? null,
          createdAt: o.createdAt.toISOString(),
          user: o.user,
          course: o.course,
          license: license
            ? {
                id: license.id,
                status: license.status,
                lastError: license.lastError,
              }
            : null,
        };
      }),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: { id: true, slug: true, title: true, offerKind: true },
        },
        spotPlayerLicenses: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            status: true,
            lastError: true,
            attemptCount: true,
            lastAttemptAt: true,
            provisionedAt: true,
            licenseKey: true,
            licenseUrl: true,
            spotPlayerLicenseId: true,
            accessSource: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            provider: true,
            status: true,
            amountToman: true,
            gatewayRefId: true,
            failureReason: true,
            createdAt: true,
            verifiedAt: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException("سفارش یافت نشد.");

    const allowedNext = Object.values(OrderStatus).filter(
      (to) => to !== order.status && canAdminTransitionOrder(order.status, to),
    );

    return {
      id: order.id,
      status: order.status,
      paymentProvider: order.paymentProvider,
      amountToman: decimalToNumber(order.amountToman),
      amountLabel: formatTomanLabel(order.amountToman),
      couponCode: order.couponCode,
      paidAt: order.paidAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user,
      course: order.course,
      allowedNextStatuses: allowedNext,
      licenses: order.spotPlayerLicenses.map((lic) => ({
        id: lic.id,
        status: lic.status,
        lastError: lic.lastError,
        attemptCount: lic.attemptCount,
        lastAttemptAt: lic.lastAttemptAt?.toISOString() ?? null,
        provisionedAt: lic.provisionedAt?.toISOString() ?? null,
        /** Full key only when SUCCEEDED — never invent. */
        licenseKey:
          lic.status === "SUCCEEDED" && lic.licenseKey ? lic.licenseKey : null,
        licenseUrl:
          lic.status === "SUCCEEDED" && lic.licenseUrl ? lic.licenseUrl : null,
        spotPlayerLicenseId:
          lic.status === "SUCCEEDED" ? lic.spotPlayerLicenseId : null,
        accessSource: lic.accessSource,
        createdAt: lic.createdAt.toISOString(),
        updatedAt: lic.updatedAt.toISOString(),
      })),
      payments: order.transactions.map((tx) => ({
        id: tx.id,
        provider: tx.provider,
        status: tx.status,
        amountLabel: formatTomanLabel(tx.amountToman),
        gatewayRefId: tx.gatewayRefId,
        failureReason: tx.failureReason,
        createdAt: tx.createdAt.toISOString(),
        verifiedAt: tx.verifiedAt?.toISOString() ?? null,
      })),
    };
  }

  async updateOrderStatus(actorId: string, id: string, nextStatusRaw: string) {
    if (!Object.values(OrderStatus).includes(nextStatusRaw as OrderStatus)) {
      throw new BadRequestException("وضعیت سفارش نامعتبر است.");
    }
    const nextStatus = nextStatusRaw as OrderStatus;

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("سفارش یافت نشد.");

    if (order.status === nextStatus) {
      return this.getOrder(id);
    }
    if (!canAdminTransitionOrder(order.status, nextStatus)) {
      throw new ConflictException(
        `انتقال وضعیت از ${order.status} به ${nextStatus} مجاز نیست.`,
      );
    }

    const becomingPaid =
      nextStatus === OrderStatus.PAID && order.status !== OrderStatus.PAID;

    await this.prisma.$transaction(async (db) => {
      await db.order.update({
        where: { id },
        data: {
          status: nextStatus,
          paidAt: becomingPaid ? new Date() : order.paidAt,
        },
      });

      if (becomingPaid) {
        await db.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId,
            },
          },
          create: {
            userId: order.userId,
            courseId: order.courseId,
          },
          update: {},
        });
      }
    });

    if (becomingPaid) {
      try {
        await this.spotplayer.queueAfterPaidOrder(id);
      } catch (err) {
        this.logger.warn(
          `queueAfterPaidOrder after admin confirm failed (${id}): ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    await this.audit.record({
      actorId,
      action: "order.status_update",
      entityType: "Order",
      entityId: id,
      summary: `تغییر وضعیت سفارش به ${nextStatus}`,
      metadata: { from: order.status, to: nextStatus },
    });

    return this.getOrder(id);
  }

  async retryOrderLicense(actorId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        spotPlayerLicenses: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });
    if (!order) throw new NotFoundException("سفارش یافت نشد.");

    if (order.status !== OrderStatus.PAID) {
      throw new ConflictException(
        "صدور لایسنس فقط برای سفارش پرداخت‌شده ممکن است. ابتدا وضعیت را تأیید کنید.",
      );
    }

    const existing = order.spotPlayerLicenses[0] ?? null;
    let note: string;

    if (!existing) {
      await this.spotplayer.queueAfterPaidOrder(id);
      note = "درخواست صدور لایسنس در صف قرار گرفت.";
    } else {
      const result = await this.spotplayer.retryLicense(existing.id);
      note = result.note;
    }

    await this.audit.record({
      actorId,
      action: "order.license_retry",
      entityType: "Order",
      entityId: id,
      summary: note,
      metadata: { licenseId: existing?.id ?? null },
    });

    return {
      note,
      order: await this.getOrder(id),
    };
  }

  // ── Customers ────────────────────────────────────────────────────────

  async listCustomers(query: {
    q?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.UserWhereInput = {};
    if (query.role && Object.values(UserRole).includes(query.role as UserRole)) {
      where.role = query.role as UserRole;
    }
    if (query.q) {
      where.OR = [
        { username: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
        { displayName: { contains: query.q, mode: "insensitive" } },
        { phone: { contains: query.q } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          displayName: true,
          role: true,
          createdAt: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          _count: {
            select: { orders: true, tickets: true, enrollments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        displayName: u.displayName,
        role: u.role,
        emailVerified: Boolean(u.emailVerifiedAt),
        phoneVerified: Boolean(u.phoneVerifiedAt),
        createdAt: u.createdAt.toISOString(),
        orderCount: u._count.orders,
        ticketCount: u._count.tickets,
        enrollmentCount: u._count.enrollments,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  // ── Coupons ──────────────────────────────────────────────────────────

  async listCoupons() {
    const rows = await this.prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      percentOff: c.percentOff ? decimalToNumber(c.percentOff) : null,
      amountOffToman: c.amountOffToman
        ? decimalToNumber(c.amountOffToman)
        : null,
      minOrderToman: c.minOrderToman
        ? decimalToNumber(c.minOrderToman)
        : null,
      maxDiscountToman: c.maxDiscountToman
        ? decimalToNumber(c.maxDiscountToman)
        : null,
      maxRedemptions: c.maxRedemptions,
      redemptionCount: c.redemptionCount,
      active: c.active,
      startsAt: c.startsAt?.toISOString() ?? null,
      endsAt: c.endsAt?.toISOString() ?? null,
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async upsertCoupon(actorId: string, dto: UpsertCouponDto, id?: string) {
    if (dto.discountType === CouponDiscountType.PERCENT) {
      if (dto.percentOff == null || dto.percentOff <= 0 || dto.percentOff > 100) {
        throw new BadRequestException("درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.");
      }
    }
    if (dto.discountType === CouponDiscountType.FIXED_TOMAN) {
      if (dto.amountOffToman == null || dto.amountOffToman <= 0) {
        throw new BadRequestException("مبلغ تخفیف باید مثبت باشد.");
      }
    }

    const code = dto.code.trim();
    const data = {
      code,
      codeNormalized: code.toUpperCase(),
      discountType: dto.discountType,
      percentOff:
        dto.percentOff == null ? null : new Prisma.Decimal(dto.percentOff),
      amountOffToman:
        dto.amountOffToman == null
          ? null
          : new Prisma.Decimal(dto.amountOffToman),
      minOrderToman:
        dto.minOrderToman == null
          ? null
          : new Prisma.Decimal(dto.minOrderToman),
      maxDiscountToman:
        dto.maxDiscountToman == null
          ? null
          : new Prisma.Decimal(dto.maxDiscountToman),
      maxRedemptions: dto.maxRedemptions ?? null,
      active: dto.active ?? true,
    };

    const coupon = id
      ? await this.prisma.coupon.update({ where: { id }, data })
      : await this.prisma.coupon.create({ data });

    await this.audit.record({
      actorId,
      action: id ? "coupon.update" : "coupon.create",
      entityType: "Coupon",
      entityId: coupon.id,
      summary: id
        ? `به‌روزرسانی کوپن ${coupon.code}`
        : `ایجاد کوپن ${coupon.code}`,
    });

    return { id: coupon.id, code: coupon.code, active: coupon.active };
  }

  async deleteCoupon(actorId: string, id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException("کوپن یافت نشد.");
    await this.prisma.coupon.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "coupon.delete",
      entityType: "Coupon",
      entityId: id,
      summary: `حذف کوپن ${coupon.code}`,
    });
    return { ok: true };
  }

  // ── CMS ──────────────────────────────────────────────────────────────

  async getHomeCms() {
    const row = await this.prisma.cmsHomeContent.findUnique({
      where: { id: "home" },
    });
    if (!row) {
      return {
        id: "home",
        heroEyebrow: null,
        heroTitle: "DXCode",
        heroSubtitle: null,
        primaryCtaLabel: null,
        primaryCtaHref: null,
        secondaryCtaLabel: null,
        secondaryCtaHref: null,
        announcementEnabled: false,
        announcementText: null,
        announcementHref: null,
        announcementCtaLabel: null,
        updatedAt: null,
      };
    }
    return {
      id: row.id,
      heroEyebrow: row.heroEyebrow,
      heroTitle: row.heroTitle,
      heroSubtitle: row.heroSubtitle,
      primaryCtaLabel: row.primaryCtaLabel,
      primaryCtaHref: row.primaryCtaHref,
      secondaryCtaLabel: row.secondaryCtaLabel,
      secondaryCtaHref: row.secondaryCtaHref,
      announcementEnabled: row.announcementEnabled,
      announcementText: row.announcementText,
      announcementHref: row.announcementHref,
      announcementCtaLabel: row.announcementCtaLabel,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateHomeCms(actorId: string, dto: UpdateHomeCmsDto) {
    const announcementEnabled = dto.announcementEnabled === true;
    const announcementText = dto.announcementText?.trim() || null;
    const announcementHref = dto.announcementHref?.trim() || null;
    const announcementCtaLabel = dto.announcementCtaLabel?.trim() || null;
    const row = await this.prisma.cmsHomeContent.upsert({
      where: { id: "home" },
      create: {
        id: "home",
        heroEyebrow: dto.heroEyebrow ?? null,
        heroTitle: dto.heroTitle,
        heroSubtitle: dto.heroSubtitle ?? null,
        primaryCtaLabel: dto.primaryCtaLabel ?? null,
        primaryCtaHref: dto.primaryCtaHref ?? null,
        secondaryCtaLabel: dto.secondaryCtaLabel ?? null,
        secondaryCtaHref: dto.secondaryCtaHref ?? null,
        announcementEnabled,
        announcementText,
        announcementHref,
        announcementCtaLabel,
      },
      update: {
        heroEyebrow: dto.heroEyebrow ?? null,
        heroTitle: dto.heroTitle,
        heroSubtitle: dto.heroSubtitle ?? null,
        primaryCtaLabel: dto.primaryCtaLabel ?? null,
        primaryCtaHref: dto.primaryCtaHref ?? null,
        secondaryCtaLabel: dto.secondaryCtaLabel ?? null,
        secondaryCtaHref: dto.secondaryCtaHref ?? null,
        announcementEnabled,
        announcementText,
        announcementHref,
        announcementCtaLabel,
      },
    });

    await this.audit.record({
      actorId,
      action: "cms.home.update",
      entityType: "CmsHomeContent",
      entityId: "home",
      summary: "به‌روزرسانی محتوای صفحهٔ خانه",
    });

    return this.getHomeCms().then(() => ({
      id: row.id,
      heroTitle: row.heroTitle,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getPathsCms() {
    const row = await this.prisma.cmsPathsContent.findUnique({
      where: { id: "paths" },
    });
    if (!row) {
      return {
        id: "paths",
        title: "نقشهٔ راه یادگیری",
        lead:
          "مسیرهای پیشنهادی برای یادگیری عمیق. دوره‌ها را به ترتیب ببینید.",
        seoTitle: "نقشهٔ راه",
        seoDescription:
          "ترتیب پیشنهادی دوره‌های DXCode — هر مسیر را به ترتیب بخوانید؛ هر دوره جدا فروخته می‌شود.",
        updatedAt: null,
      };
    }
    return {
      id: row.id,
      title: row.title,
      lead: row.lead,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updatePathsCms(actorId: string, dto: UpdatePathsCmsDto) {
    const row = await this.prisma.cmsPathsContent.upsert({
      where: { id: "paths" },
      create: {
        id: "paths",
        title: dto.title,
        lead: dto.lead ?? null,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
      },
      update: {
        title: dto.title,
        lead: dto.lead ?? null,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
      },
    });

    await this.audit.record({
      actorId,
      action: "cms.paths.update",
      entityType: "CmsPathsContent",
      entityId: "paths",
      summary: "به‌روزرسانی محتوای صفحهٔ نقشهٔ راه",
    });

    return this.getPathsCms().then(() => ({
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getFooterCms() {
    const row = await this.prisma.cmsFooterContent.findUnique({
      where: { id: "footer" },
    });
    const chrome = mergeSiteChrome(row);
    return {
      id: "footer",
      ...chrome,
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }

  async updateFooterCms(actorId: string, dto: UpdateFooterCmsDto) {
    const enamadHtml = normalizeEmbedHtml(dto.enamadHtml);
    const paymentGatewayHtml = normalizeEmbedHtml(dto.paymentGatewayHtml);
    const draft = mergeSiteChrome({
      brandName: dto.brandName,
      brandTagline: dto.brandTagline,
      brandKicker: dto.brandKicker,
      footerBlurb: dto.footerBlurb,
      headerLinks: dto.headerLinks,
      footerGroups: dto.footerGroups,
      mobileGroups: dto.mobileGroups,
      guestCtaLabel: dto.guestCtaLabel,
      guestCtaHref: dto.guestCtaHref,
      authedCtaLabel: dto.authedCtaLabel,
      authedCtaHref: dto.authedCtaHref,
      showCart: dto.showCart,
      showThemeToggle: dto.showThemeToggle,
      trustsLabel: dto.trustsLabel,
      mobileMenuTitle: dto.mobileMenuTitle,
      mobileMenuLine: dto.mobileMenuLine,
      enamadHtml,
      paymentGatewayHtml,
    });

    const row = await this.prisma.cmsFooterContent.upsert({
      where: { id: "footer" },
      create: {
        id: "footer",
        brandName: draft.brandName,
        brandTagline: draft.brandTagline,
        brandKicker: draft.brandKicker,
        footerBlurb: draft.footerBlurb,
        headerLinks: draft.headerLinks,
        footerGroups: draft.footerGroups,
        mobileGroups: draft.mobileGroups,
        guestCtaLabel: draft.guestCtaLabel,
        guestCtaHref: draft.guestCtaHref,
        authedCtaLabel: draft.authedCtaLabel,
        authedCtaHref: draft.authedCtaHref,
        showCart: draft.showCart,
        showThemeToggle: draft.showThemeToggle,
        trustsLabel: draft.trustsLabel,
        mobileMenuTitle: draft.mobileMenuTitle,
        mobileMenuLine: draft.mobileMenuLine,
        enamadHtml: draft.enamadHtml,
        paymentGatewayHtml: draft.paymentGatewayHtml,
      },
      update: {
        brandName: draft.brandName,
        brandTagline: draft.brandTagline,
        brandKicker: draft.brandKicker,
        footerBlurb: draft.footerBlurb,
        headerLinks: draft.headerLinks,
        footerGroups: draft.footerGroups,
        mobileGroups: draft.mobileGroups,
        guestCtaLabel: draft.guestCtaLabel,
        guestCtaHref: draft.guestCtaHref,
        authedCtaLabel: draft.authedCtaLabel,
        authedCtaHref: draft.authedCtaHref,
        showCart: draft.showCart,
        showThemeToggle: draft.showThemeToggle,
        trustsLabel: draft.trustsLabel,
        mobileMenuTitle: draft.mobileMenuTitle,
        mobileMenuLine: draft.mobileMenuLine,
        enamadHtml: draft.enamadHtml,
        paymentGatewayHtml: draft.paymentGatewayHtml,
      },
    });

    await this.audit.record({
      actorId,
      action: "cms.footer.update",
      entityType: "CmsFooterContent",
      entityId: "footer",
      summary: "به‌روزرسانی هدر، فوتر و نشان‌های اعتماد",
    });

    return {
      id: row.id,
      ...mergeSiteChrome(row),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listFaq(includeUnpublished = true) {
    const rows = await this.prisma.cmsFaqItem.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      published: f.published,
      updatedAt: f.updatedAt.toISOString(),
    }));
  }

  async upsertFaq(actorId: string, dto: UpsertFaqDto, id?: string) {
    const data = {
      question: dto.question.trim(),
      answer: dto.answer.trim(),
      sortOrder: dto.sortOrder ?? 0,
      published: dto.published ?? true,
    };
    const faq = id
      ? await this.prisma.cmsFaqItem.update({ where: { id }, data })
      : await this.prisma.cmsFaqItem.create({ data });

    await this.audit.record({
      actorId,
      action: id ? "cms.faq.update" : "cms.faq.create",
      entityType: "CmsFaqItem",
      entityId: faq.id,
      summary: id ? "به‌روزرسانی FAQ" : "ایجاد FAQ",
    });

    return faq;
  }

  async deleteFaq(actorId: string, id: string) {
    const existing = await this.prisma.cmsFaqItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("سؤال یافت نشد.");
    await this.prisma.cmsFaqItem.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "cms.faq.delete",
      entityType: "CmsFaqItem",
      entityId: id,
      summary: "حذف FAQ",
    });
    return { ok: true };
  }

  async listCoursePurchaseNotes(opts: {
    scope?: "global" | "course";
    courseId?: string;
    includeUnpublished?: boolean;
  }) {
    const includeUnpublished = opts.includeUnpublished !== false;
    const where =
      opts.scope === "global" || (!opts.scope && !opts.courseId)
        ? {
            courseId: null as string | null,
            ...(includeUnpublished ? {} : { published: true }),
          }
        : opts.courseId
          ? {
              courseId: opts.courseId,
              ...(includeUnpublished ? {} : { published: true }),
            }
          : includeUnpublished
            ? {}
            : { published: true };

    const rows = await this.prisma.coursePurchaseNote.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        course: { select: { id: true, slug: true, title: true } },
      },
    });

    return rows.map((n) => ({
      id: n.id,
      body: n.body,
      courseId: n.courseId,
      sortOrder: n.sortOrder,
      published: n.published,
      updatedAt: n.updatedAt.toISOString(),
      course: n.course,
      scope: n.courseId ? ("course" as const) : ("global" as const),
    }));
  }

  async upsertCoursePurchaseNote(
    actorId: string,
    dto: {
      body: string;
      courseId?: string | null;
      sortOrder?: number;
      published?: boolean;
    },
    id?: string,
  ) {
    const courseId =
      dto.courseId === undefined || dto.courseId === null || dto.courseId === ""
        ? null
        : dto.courseId;

    if (courseId) {
      await this.requireCourse(courseId);
    }

    const data = {
      body: dto.body.trim(),
      courseId,
      sortOrder: dto.sortOrder ?? 0,
      published: dto.published ?? true,
    };

    const note = id
      ? await this.prisma.coursePurchaseNote.update({ where: { id }, data })
      : await this.prisma.coursePurchaseNote.create({ data });

    await this.audit.record({
      actorId,
      action: id
        ? "cms.course_purchase_note.update"
        : "cms.course_purchase_note.create",
      entityType: "CoursePurchaseNote",
      entityId: note.id,
      summary: courseId
        ? id
          ? "به‌روزرسانی نکتهٔ اختصاصی دوره"
          : "ایجاد نکتهٔ اختصاصی دوره"
        : id
          ? "به‌روزرسانی نکتهٔ عمومی خرید"
          : "ایجاد نکتهٔ عمومی خرید",
    });

    return {
      id: note.id,
      body: note.body,
      courseId: note.courseId,
      sortOrder: note.sortOrder,
      published: note.published,
      updatedAt: note.updatedAt.toISOString(),
      scope: note.courseId ? ("course" as const) : ("global" as const),
    };
  }

  async deleteCoursePurchaseNote(actorId: string, id: string) {
    const existing = await this.prisma.coursePurchaseNote.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("نکته یافت نشد.");
    await this.prisma.coursePurchaseNote.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "cms.course_purchase_note.delete",
      entityType: "CoursePurchaseNote",
      entityId: id,
      summary: "حذف نکتهٔ قبل از خرید",
    });
    return { ok: true };
  }

  private async requireCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException("دوره یافت نشد.");
    return course;
  }

  private async refreshLessonCount(courseId: string) {
    const lessonCount = await this.prisma.lesson.count({ where: { courseId } });
    await this.prisma.course.update({
      where: { id: courseId },
      data: { lessonCount },
    });
  }

  private async writeUnique<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException("این شناسه یا اسلاگ قبلاً استفاده شده است.");
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundException("رکورد یافت نشد.");
      }
      throw err;
    }
  }

  async deleteCourse(actorId: string, id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!course) throw new NotFoundException("دوره یافت نشد.");
    if (course._count.orders > 0) {
      throw new BadRequestException(
        "این دوره سفارش دارد و حذف نمی‌شود. اول سفارش‌ها باید جدا بمانند.",
      );
    }
    await this.prisma.course.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: "course.delete",
      entityType: "Course",
      entityId: id,
      summary: `حذف دوره ${course.title}`,
    });
    return { ok: true };
  }

  private cleanVideoAsset(value?: string | null): string | null {
    const raw = value?.trim() ?? "";
    if (!raw) return null;
    if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("..")) {
      return raw.slice(0, 500);
    }
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new BadRequestException(
        "لینک ویدیو باید مسیر سایت یا نشانی http/https باشد.",
      );
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new BadRequestException(
        "لینک ویدیو باید مسیر سایت یا نشانی http/https باشد.",
      );
    }
    if (url.username || url.password) {
      throw new BadRequestException("لینک ویدیو نباید نام کاربری یا رمز داشته باشد.");
    }
    return url.toString().slice(0, 500);
  }

  private assertCoursePricing(dto: UpsertCourseDto) {
    if (dto.offerKind === CourseOfferKind.FREE && dto.priceToman !== 0) {
      throw new BadRequestException("دوره رایگان باید قیمت صفر داشته باشد.");
    }
    if (
      (dto.offerKind === CourseOfferKind.PAID ||
        dto.offerKind === CourseOfferKind.PRE_SALE) &&
      dto.priceToman <= 0
    ) {
      throw new BadRequestException("دوره پولی به قیمت مثبت نیاز دارد.");
    }
  }
}

/** Keep owner-provided badge embeds, strip scripts/frames, collapse empty to null. */
function normalizeEmbedHtml(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const cleaned = trimmed
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<(iframe|object|embed|link|meta|base|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src|action)\s*=\s*(['"]?)\s*javascript:[^'"\s>]*/gi, "")
    .trim();
  return cleaned ? cleaned.slice(0, 12000) : null;
}
