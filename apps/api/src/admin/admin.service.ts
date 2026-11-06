import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CouponDiscountType,
  CourseOfferKind,
  CoursePublicationStatus,
  OrderStatus,
  Prisma,
  UserRole,
} from "@zharfa/database";
import { decimalToNumber, formatTomanLabel } from "../catalog/pricing";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import type {
  UpsertCategoryDto,
  UpsertCouponDto,
  UpsertCourseDto,
  UpsertFaqDto,
  UpdateHomeCmsDto,
} from "./dto/admin.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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
      lessonCount: dto.lessonCount ?? 0,
      featured: dto.featured ?? false,
      sortOrder: dto.sortOrder ?? 0,
      coverAsset: dto.coverAsset ?? null,
      indexLabel: dto.indexLabel ?? null,
      diagramKind: dto.diagramKind,
      publishedAt:
        dto.publicationStatus === CoursePublicationStatus.PUBLISHED
          ? new Date()
          : null,
    };

    const course = id
      ? await this.prisma.course.update({ where: { id }, data })
      : await this.prisma.course.create({ data });

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

    return { id: course.id, slug: course.slug, title: course.title };
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
    const category = id
      ? await this.prisma.category.update({ where: { id }, data })
      : await this.prisma.category.create({ data });

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

  // ── Orders ───────────────────────────────────────────────────────────

  async listOrders(query: {
    q?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.OrderWhereInput = {};
    if (query.status && Object.values(OrderStatus).includes(query.status as OrderStatus)) {
      where.status = query.status as OrderStatus;
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
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((o) => ({
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
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
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

  // ── CMS ──────────────────────────────────────────────────────────────

  async getHomeCms() {
    const row = await this.prisma.cmsHomeContent.findUnique({
      where: { id: "home" },
    });
    if (!row) {
      return {
        id: "home",
        heroEyebrow: null,
        heroTitle: "ژرفا",
        heroSubtitle: null,
        primaryCtaLabel: null,
        primaryCtaHref: null,
        secondaryCtaLabel: null,
        secondaryCtaHref: null,
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
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateHomeCms(actorId: string, dto: UpdateHomeCmsDto) {
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
      },
      update: {
        heroEyebrow: dto.heroEyebrow ?? null,
        heroTitle: dto.heroTitle,
        heroSubtitle: dto.heroSubtitle ?? null,
        primaryCtaLabel: dto.primaryCtaLabel ?? null,
        primaryCtaHref: dto.primaryCtaHref ?? null,
        secondaryCtaLabel: dto.secondaryCtaLabel ?? null,
        secondaryCtaHref: dto.secondaryCtaHref ?? null,
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
