import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CourseOfferKind,
  CoursePublicationStatus,
  Prisma,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  toPublicCourseCard,
  toPublicCourseDetail,
  toPublicPathDetail,
  toPublicPathSummary,
} from "./catalog.mapper";
import type { ListCoursesQueryDto } from "./dto/list-courses.dto";

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
    };

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.offer) {
      where.offerKind = query.offer;
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
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
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

  offerKinds(): CourseOfferKind[] {
    return Object.values(CourseOfferKind);
  }
}
