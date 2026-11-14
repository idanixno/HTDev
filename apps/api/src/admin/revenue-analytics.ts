import { OrderStatus } from "@zharfa/database";
import { eachUtcDay, type DateRange, utcDayKey } from "./date-range";

type RevenueOrder = {
  courseId: string;
  status: OrderStatus;
  paidAt: Date | null;
  amountToman: { toNumber(): number } | number | string;
  course: { slug: string; title: string };
};

type DailyRevenue = {
  date: string;
  orderValueToman: number;
  paidOrderValueToman: number;
  markedRefundOrderValueToman: number;
  paidOrders: number;
  ordersMarkedRefunded: number;
};

export type RevenueAnalyticsReport = {
  range: { from: string; to: string };
  summary: {
    orderValueToman: number;
    paidOrderValueToman: number;
    markedRefundOrderValueToman: number;
    netOrderValueToman: number;
    paidOrders: number;
    ordersMarkedRefunded: number;
    averageOrderValueToman: number;
  };
  daily: DailyRevenue[];
  courses: Array<{
    courseId: string;
    slug: string;
    title: string;
    orderValueToman: number;
    paidOrderValueToman: number;
    markedRefundOrderValueToman: number;
    paidOrders: number;
    ordersMarkedRefunded: number;
  }>;
};

function amountNumber(
  value: { toNumber(): number } | number | string,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function buildRevenueAnalyticsReport(input: {
  range: DateRange;
  orders: RevenueOrder[];
}): RevenueAnalyticsReport {
  const days = new Map<string, DailyRevenue>(
    eachUtcDay(input.range.from, input.range.to).map((date) => [
      date,
      {
        date,
        orderValueToman: 0,
        paidOrderValueToman: 0,
        markedRefundOrderValueToman: 0,
        paidOrders: 0,
        ordersMarkedRefunded: 0,
      },
    ]),
  );
  const courses = new Map<
    string,
    RevenueAnalyticsReport["courses"][number]
  >();

  let orderValueToman = 0;
  let paidOrderValueToman = 0;
  let markedRefundOrderValueToman = 0;
  let paidOrders = 0;
  let ordersMarkedRefunded = 0;

  for (const order of input.orders) {
    if (!order.paidAt) continue;

    const amount = amountNumber(order.amountToman);
    const isMarkedRefunded = order.status === OrderStatus.REFUNDED;
    const day = days.get(utcDayKey(order.paidAt));
    if (!day) continue;

    orderValueToman += amount;
    if (isMarkedRefunded) {
      markedRefundOrderValueToman += amount;
      ordersMarkedRefunded += 1;
    } else {
      paidOrderValueToman += amount;
      paidOrders += 1;
    }

    day.orderValueToman += amount;
    if (isMarkedRefunded) {
      day.markedRefundOrderValueToman += amount;
      day.ordersMarkedRefunded += 1;
    } else {
      day.paidOrderValueToman += amount;
      day.paidOrders += 1;
    }

    const course = courses.get(order.courseId) ?? {
      courseId: order.courseId,
      slug: order.course.slug,
      title: order.course.title,
      orderValueToman: 0,
      paidOrderValueToman: 0,
      markedRefundOrderValueToman: 0,
      paidOrders: 0,
      ordersMarkedRefunded: 0,
    };
    course.orderValueToman += amount;
    if (isMarkedRefunded) {
      course.markedRefundOrderValueToman += amount;
      course.ordersMarkedRefunded += 1;
    } else {
      course.paidOrderValueToman += amount;
      course.paidOrders += 1;
    }
    courses.set(order.courseId, course);
  }

  const totalOrders = paidOrders + ordersMarkedRefunded;

  return {
    range: {
      from: utcDayKey(input.range.from),
      to: utcDayKey(input.range.to),
    },
    summary: {
      orderValueToman,
      paidOrderValueToman,
      markedRefundOrderValueToman,
      netOrderValueToman: orderValueToman - markedRefundOrderValueToman,
      paidOrders,
      ordersMarkedRefunded,
      averageOrderValueToman:
        totalOrders === 0 ? 0 : orderValueToman / totalOrders,
    },
    daily: [...days.values()],
    courses: [...courses.values()].sort(
      (a, b) =>
        b.orderValueToman - a.orderValueToman ||
        a.title.localeCompare(b.title),
    ),
  };
}
