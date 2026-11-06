import {
  CoursePublicationStatus,
  OrderStatus,
  SpotPlayerLicenseStatus,
  TicketStatus,
} from "@zharfa/database";
import { eachUtcDay, type DateRange, utcDayKey } from "./date-range";

export type SeriesPoint = { date: string; value: number };

export type StatusCount = { status: string; count: number };

export type AnalyticsDashboard = {
  range: { from: string; to: string };
  summary: {
    revenueToman: number;
    paidOrders: number;
    newUsers: number;
    publishedCourses: number;
    openTickets: number;
    pendingProvisioning: number;
  };
  series: {
    revenueByDay: SeriesPoint[];
    ordersByDay: SeriesPoint[];
    usersByDay: SeriesPoint[];
  };
  breakdowns: {
    ordersByStatus: StatusCount[];
    coursesByPublication: StatusCount[];
    ticketsByStatus: StatusCount[];
    provisioningByStatus: StatusCount[];
  };
};

type PaidOrderRow = { paidAt: Date | null; amountToman: { toNumber(): number } | number | string };
type CountRow = { createdAt: Date };

function amountNumber(
  value: { toNumber(): number } | number | string,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

function fillSeries(
  days: string[],
  events: Array<{ day: string; value: number }>,
): SeriesPoint[] {
  const map = new Map<string, number>();
  for (const d of days) map.set(d, 0);
  for (const e of events) {
    if (!map.has(e.day)) continue;
    map.set(e.day, (map.get(e.day) ?? 0) + e.value);
  }
  return days.map((date) => ({ date, value: map.get(date) ?? 0 }));
}

function countByKey(
  keys: string[],
  rows: Array<{ key: string }>,
): StatusCount[] {
  const map = new Map(keys.map((k) => [k, 0]));
  for (const row of rows) {
    if (!map.has(row.key)) map.set(row.key, 0);
    map.set(row.key, (map.get(row.key) ?? 0) + 1);
  }
  return [...map.entries()].map(([status, count]) => ({ status, count }));
}

/**
 * Pure aggregation over already-fetched DB rows.
 * Keeps SQL in the service; this function is unit-tested without Prisma.
 */
export function buildAnalyticsDashboard(input: {
  range: DateRange;
  paidOrders: PaidOrderRow[];
  allOrdersInRange: Array<{ status: OrderStatus }>;
  newUsers: CountRow[];
  courses: Array<{ publicationStatus: CoursePublicationStatus }>;
  tickets: Array<{ status: TicketStatus }>;
  licenses: Array<{ status: SpotPlayerLicenseStatus }>;
  /** Open-ish tickets currently (not limited to range) for summary KPI. */
  openTicketCount: number;
  pendingProvisioningCount: number;
  publishedCourseCount: number;
}): AnalyticsDashboard {
  const days = eachUtcDay(input.range.from, input.range.to);

  const paidWithDay = input.paidOrders
    .filter((o) => o.paidAt)
    .map((o) => ({
      day: utcDayKey(o.paidAt!),
      amount: amountNumber(o.amountToman),
    }));

  const revenueToman = paidWithDay.reduce((sum, r) => sum + r.amount, 0);
  const paidOrders = paidWithDay.length;

  const revenueByDay = fillSeries(
    days,
    paidWithDay.map((r) => ({ day: r.day, value: r.amount })),
  );
  const ordersByDay = fillSeries(
    days,
    paidWithDay.map((r) => ({ day: r.day, value: 1 })),
  );
  const usersByDay = fillSeries(
    days,
    input.newUsers.map((u) => ({ day: utcDayKey(u.createdAt), value: 1 })),
  );

  return {
    range: {
      from: utcDayKey(input.range.from),
      to: utcDayKey(input.range.to),
    },
    summary: {
      revenueToman,
      paidOrders,
      newUsers: input.newUsers.length,
      publishedCourses: input.publishedCourseCount,
      openTickets: input.openTicketCount,
      pendingProvisioning: input.pendingProvisioningCount,
    },
    series: { revenueByDay, ordersByDay, usersByDay },
    breakdowns: {
      ordersByStatus: countByKey(
        Object.values(OrderStatus),
        input.allOrdersInRange.map((o) => ({ key: o.status })),
      ),
      coursesByPublication: countByKey(
        Object.values(CoursePublicationStatus),
        input.courses.map((c) => ({ key: c.publicationStatus })),
      ),
      ticketsByStatus: countByKey(
        Object.values(TicketStatus),
        input.tickets.map((t) => ({ key: t.status })),
      ),
      provisioningByStatus: countByKey(
        Object.values(SpotPlayerLicenseStatus),
        input.licenses.map((l) => ({ key: l.status })),
      ),
    },
  };
}
