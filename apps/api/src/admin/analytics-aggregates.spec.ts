import {
  CoursePublicationStatus,
  OrderStatus,
  SpotPlayerLicenseStatus,
  TicketStatus,
} from "@zharfa/database";
import { describe, expect, it } from "vitest";
import { buildAnalyticsDashboard } from "./analytics-aggregates";
import { resolveDateRange } from "./date-range";

describe("buildAnalyticsDashboard", () => {
  it("aggregates revenue, series, and breakdowns from real rows", () => {
    const range = resolveDateRange({ from: "2026-11-01", to: "2026-11-03" });
    const dashboard = buildAnalyticsDashboard({
      range,
      paidOrders: [
        { paidAt: new Date("2026-11-01T10:00:00Z"), amountToman: 100_000 },
        { paidAt: new Date("2026-11-01T18:00:00Z"), amountToman: 50_000 },
        { paidAt: new Date("2026-11-03T08:00:00Z"), amountToman: 200_000 },
      ],
      ordersByStatus: [
        { status: OrderStatus.PAID, count: 3 },
        { status: OrderStatus.FAILED, count: 1 },
        { status: OrderStatus.PENDING, count: 1 },
      ],
      newUsers: [
        { createdAt: new Date("2026-11-02T12:00:00Z") },
        { createdAt: new Date("2026-11-02T13:00:00Z") },
      ],
      coursesByPublication: [
        { status: CoursePublicationStatus.PUBLISHED, count: 2 },
        { status: CoursePublicationStatus.DRAFT, count: 1 },
      ],
      ticketsByStatus: [
        { status: TicketStatus.OPEN, count: 1 },
        { status: TicketStatus.RESOLVED, count: 1 },
      ],
      provisioningByStatus: [
        { status: SpotPlayerLicenseStatus.PENDING, count: 1 },
        { status: SpotPlayerLicenseStatus.FAILED, count: 1 },
      ],
      openTicketCount: 1,
      pendingProvisioningCount: 1,
      publishedCourseCount: 2,
    });

    expect(dashboard.summary).toEqual({
      revenueToman: 350_000,
      paidOrders: 3,
      newUsers: 2,
      publishedCourses: 2,
      openTickets: 1,
      pendingProvisioning: 1,
    });

    expect(dashboard.series.revenueByDay).toEqual([
      { date: "2026-11-01", value: 150_000 },
      { date: "2026-11-02", value: 0 },
      { date: "2026-11-03", value: 200_000 },
    ]);
    expect(dashboard.series.ordersByDay).toEqual([
      { date: "2026-11-01", value: 2 },
      { date: "2026-11-02", value: 0 },
      { date: "2026-11-03", value: 1 },
    ]);
    expect(dashboard.series.usersByDay).toEqual([
      { date: "2026-11-01", value: 0 },
      { date: "2026-11-02", value: 2 },
      { date: "2026-11-03", value: 0 },
    ]);

    const paid = dashboard.breakdowns.ordersByStatus.find(
      (s) => s.status === OrderStatus.PAID,
    );
    expect(paid?.count).toBe(3);
    expect(
      dashboard.breakdowns.coursesByPublication.find(
        (s) => s.status === CoursePublicationStatus.PUBLISHED,
      )?.count,
    ).toBe(2);
  });
});
