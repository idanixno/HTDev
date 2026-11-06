import { BadRequestException, Injectable } from "@nestjs/common";
import {
  CoursePublicationStatus,
  OrderStatus,
  SpotPlayerLicenseStatus,
  TicketStatus,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  buildAnalyticsDashboard,
  type AnalyticsDashboard,
} from "./analytics-aggregates";
import { resolveDateRange } from "./date-range";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(query: {
    from?: string;
    to?: string;
  }): Promise<AnalyticsDashboard> {
    let range;
    try {
      range = resolveDateRange(query);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : "بازه تاریخ نامعتبر است.",
      );
    }

    const [
      paidOrders,
      allOrdersInRange,
      newUsers,
      courses,
      tickets,
      licenses,
      openTicketCount,
      pendingProvisioningCount,
      publishedCourseCount,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: OrderStatus.PAID,
          paidAt: { gte: range.from, lte: range.to },
        },
        select: { paidAt: true, amountToman: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: range.from, lte: range.to } },
        select: { status: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: range.from, lte: range.to } },
        select: { createdAt: true },
      }),
      this.prisma.course.findMany({
        select: { publicationStatus: true },
      }),
      this.prisma.ticket.findMany({
        where: { createdAt: { gte: range.from, lte: range.to } },
        select: { status: true },
      }),
      this.prisma.spotPlayerLicense.findMany({
        where: { createdAt: { gte: range.from, lte: range.to } },
        select: { status: true },
      }),
      this.prisma.ticket.count({
        where: {
          status: {
            in: [
              TicketStatus.OPEN,
              TicketStatus.IN_PROGRESS,
              TicketStatus.WAITING_FOR_USER,
            ],
          },
        },
      }),
      this.prisma.spotPlayerLicense.count({
        where: {
          status: {
            in: [
              SpotPlayerLicenseStatus.PENDING,
              SpotPlayerLicenseStatus.QUEUED,
              SpotPlayerLicenseStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.course.count({
        where: { publicationStatus: CoursePublicationStatus.PUBLISHED },
      }),
    ]);

    return buildAnalyticsDashboard({
      range,
      paidOrders,
      allOrdersInRange,
      newUsers,
      courses,
      tickets,
      licenses,
      openTicketCount,
      pendingProvisioningCount,
      publishedCourseCount,
    });
  }
}
