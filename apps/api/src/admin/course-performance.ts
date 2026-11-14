import { utcDayKey, type DateRange } from "./date-range";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  publicationStatus: string;
};

type PaidOrderRow = {
  courseId: string;
  userId: string;
  amountToman: { toNumber(): number } | number | string;
};

type EnrollmentRow = {
  courseId: string;
  userId: string;
};

export type CoursePerformanceReport = {
  range: { from: string; to: string };
  items: Array<{
    courseId: string;
    slug: string;
    title: string;
    publicationStatus: string;
    paidOrders: number;
    uniqueBuyers: number;
    revenueToman: number;
    enrollments: number;
  }>;
};

function amountNumber(
  value: { toNumber(): number } | number | string,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function buildCoursePerformanceReport(input: {
  range: DateRange;
  courses: CourseRow[];
  paidOrders: PaidOrderRow[];
  enrollments: EnrollmentRow[];
}): CoursePerformanceReport {
  const rows = new Map(
    input.courses.map((course) => [
      course.id,
      {
        courseId: course.id,
        slug: course.slug,
        title: course.title,
        publicationStatus: course.publicationStatus,
        paidOrders: 0,
        buyers: new Set<string>(),
        revenueToman: 0,
        enrollments: new Set<string>(),
      },
    ]),
  );

  for (const order of input.paidOrders) {
    const row = rows.get(order.courseId);
    if (!row) continue;
    row.paidOrders += 1;
    row.buyers.add(order.userId);
    row.revenueToman += amountNumber(order.amountToman);
  }

  for (const enrollment of input.enrollments) {
    rows.get(enrollment.courseId)?.enrollments.add(enrollment.userId);
  }

  return {
    range: {
      from: utcDayKey(input.range.from),
      to: utcDayKey(input.range.to),
    },
    items: [...rows.values()]
      .map(({ buyers, enrollments, ...course }) => ({
        ...course,
        uniqueBuyers: buyers.size,
        enrollments: enrollments.size,
      }))
      .sort(
        (a, b) =>
          b.revenueToman - a.revenueToman ||
          b.paidOrders - a.paidOrders ||
          a.title.localeCompare(b.title),
      ),
  };
}
