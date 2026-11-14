import { OrderStatus } from "@zharfa/database";
import { describe, expect, it } from "vitest";
import { resolveDateRange } from "./date-range";
import { buildRevenueAnalyticsReport } from "./revenue-analytics";

describe("buildRevenueAnalyticsReport", () => {
  it("reports paid, marked-refund, net, daily, and course values from order states", () => {
    const report = buildRevenueAnalyticsReport({
      range: resolveDateRange({
        from: "2026-11-01",
        to: "2026-11-02",
      }),
      orders: [
        {
          courseId: "course-a",
          status: OrderStatus.PAID,
          paidAt: new Date("2026-11-01T10:00:00Z"),
          amountToman: 120_000,
          course: { slug: "course-a", title: "Course A" },
        },
        {
          courseId: "course-a",
          status: OrderStatus.REFUNDED,
          paidAt: new Date("2026-11-02T10:00:00Z"),
          amountToman: { toNumber: () => 80_000 },
          course: { slug: "course-a", title: "Course A" },
        },
        {
          courseId: "course-b",
          status: OrderStatus.PAID,
          paidAt: new Date("2026-11-02T12:00:00Z"),
          amountToman: "50",
          course: { slug: "course-b", title: "Course B" },
        },
      ],
    });

    expect(report.summary).toEqual({
      orderValueToman: 200_050,
      paidOrderValueToman: 120_050,
      markedRefundOrderValueToman: 80_000,
      netOrderValueToman: 120_050,
      paidOrders: 2,
      ordersMarkedRefunded: 1,
      averageOrderValueToman: 200_050 / 3,
    });
    expect(report.daily).toEqual([
      {
        date: "2026-11-01",
        orderValueToman: 120_000,
        paidOrderValueToman: 120_000,
        markedRefundOrderValueToman: 0,
        paidOrders: 1,
        ordersMarkedRefunded: 0,
      },
      {
        date: "2026-11-02",
        orderValueToman: 80_050,
        paidOrderValueToman: 50,
        markedRefundOrderValueToman: 80_000,
        paidOrders: 1,
        ordersMarkedRefunded: 1,
      },
    ]);
    expect(report.courses.map((course) => course.title)).toEqual([
      "Course A",
      "Course B",
    ]);
    expect(report.courses[0]).toMatchObject({
      orderValueToman: 200_000,
      paidOrderValueToman: 120_000,
      markedRefundOrderValueToman: 80_000,
      paidOrders: 1,
      ordersMarkedRefunded: 1,
    });
  });

  it("excludes orders without a paid date and orders outside the requested range", () => {
    const report = buildRevenueAnalyticsReport({
      range: resolveDateRange({ from: "2026-11-01", to: "2026-11-01" }),
      orders: [
        {
          courseId: "course-a",
          status: OrderStatus.PAID,
          paidAt: null,
          amountToman: 10,
          course: { slug: "course-a", title: "Course A" },
        },
        {
          courseId: "course-a",
          status: OrderStatus.PAID,
          paidAt: new Date("2026-11-02T10:00:00Z"),
          amountToman: 20,
          course: { slug: "course-a", title: "Course A" },
        },
      ],
    });

    expect(report.summary.orderValueToman).toBe(0);
    expect(report.summary.averageOrderValueToman).toBe(0);
    expect(report.courses).toEqual([]);
    expect(report.daily).toHaveLength(1);
  });
});
