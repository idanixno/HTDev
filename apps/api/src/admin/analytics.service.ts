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

/**
 * Admin analytics loader.
 * Parallel bounded queries only — no per-row N+1.
 * Status breakdowns use Prisma groupBy; day series loads paid/user rows
 * for the selected date range (not the full table).
 */
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
      ordersByStatus,
      newUsers,
      coursesByPublication,
      ticketsByStatus,
      licensesByStatus,
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
      this.prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: range.from, lte: range.to } },
        _count: { _all: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: range.from, lte: range.to } },
        select: { createdAt: true },
      }),
      this.prisma.course.groupBy({
        by: ["publicationStatus"],
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ["status"],
        where: { createdAt: { gte: range.from, lte: range.to } },
        _count: { _all: true },
      }),
      this.prisma.spotPlayerLicense.groupBy({
        by: ["status"],
        where: { createdAt: { gte: range.from, lte: range.to } },
        _count: { _all: true },
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
      ordersByStatus: ordersByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      newUsers,
      coursesByPublication: coursesByPublication.map((row) => ({
        status: row.publicationStatus,
        count: row._count._all,
      })),
      ticketsByStatus: ticketsByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      provisioningByStatus: licensesByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      openTicketCount,
      pendingProvisioningCount,
      publishedCourseCount,
    });
  }

  /**
   * Lightweight attention counts for the admin sidebar.
   * Only surfaces items that still need an owner to look at them.
   */
  async navBadges(): Promise<{
    badges: Record<string, number>;
  }> {
    const [tickets, orders, spotplayer] = await Promise.all([
      this.prisma.ticket.count({
        where: {
          status: {
            in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          status: {
            in: [OrderStatus.FAILED, OrderStatus.AWAITING_GATEWAY],
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
              SpotPlayerLicenseStatus.FAILED,
            ],
          },
        },
      }),
    ]);

    const badges: Record<string, number> = {};
    if (tickets > 0) badges["/admin/tickets"] = tickets;
    if (orders > 0) badges["/admin/orders"] = orders;
    if (spotplayer > 0) badges["/admin/spotplayer"] = spotplayer;
    return { badges };
  }
}
