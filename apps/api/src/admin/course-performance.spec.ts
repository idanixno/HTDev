import { describe, expect, it } from "vitest";
import { buildCoursePerformanceReport } from "./course-performance";
import { resolveDateRange } from "./date-range";

describe("buildCoursePerformanceReport", () => {
  it("aggregates only the supplied paid orders and enrollments per course", () => {
    const report = buildCoursePerformanceReport({
      range: resolveDateRange({
        from: "2026-11-01",
        to: "2026-11-03",
      }),
      courses: [
        {
          id: "course-a",
          slug: "course-a",
          title: "Course A",
          publicationStatus: "PUBLISHED",
        },
        {
          id: "course-b",
          slug: "course-b",
          title: "Course B",
          publicationStatus: "DRAFT",
        },
      ],
      paidOrders: [
        { courseId: "course-a", userId: "user-1", amountToman: 120_000 },
        {
          courseId: "course-a",
          userId: "user-1",
          amountToman: { toNumber: () => 80_000 },
        },
        { courseId: "course-b", userId: "user-2", amountToman: "50" },
      ],
      enrollments: [
        { courseId: "course-a", userId: "user-1" },
        { courseId: "course-a", userId: "user-2" },
      ],
    });

    expect(report.range).toEqual({
      from: "2026-11-01",
      to: "2026-11-03",
    });
    expect(report.items).toEqual([
      {
        courseId: "course-a",
        slug: "course-a",
        title: "Course A",
        publicationStatus: "PUBLISHED",
        paidOrders: 2,
        uniqueBuyers: 1,
        revenueToman: 200_000,
        enrollments: 2,
      },
      {
        courseId: "course-b",
        slug: "course-b",
        title: "Course B",
        publicationStatus: "DRAFT",
        paidOrders: 1,
        uniqueBuyers: 1,
        revenueToman: 50,
        enrollments: 0,
      },
    ]);
  });

  it("includes courses without activity and sorts ties deterministically", () => {
    const report = buildCoursePerformanceReport({
      range: resolveDateRange({ from: "2026-11-01", to: "2026-11-01" }),
      courses: [
        {
          id: "z",
          slug: "z",
          title: "Zulu",
          publicationStatus: "DRAFT",
        },
        {
          id: "a",
          slug: "a",
          title: "Alpha",
          publicationStatus: "PUBLISHED",
        },
      ],
      paidOrders: [],
      enrollments: [],
    });

    expect(report.items.map((row) => row.title)).toEqual(["Alpha", "Zulu"]);
    expect(report.items.every((row) => row.revenueToman === 0)).toBe(true);
  });
});
