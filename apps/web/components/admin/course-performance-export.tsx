"use client";

import type { CoursePerformanceReport } from "../../lib/admin";

function csvCell(value: string | number): string {
  const text = String(value);
  const safe =
    typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)
      ? `'${text}`
      : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function CoursePerformanceExport({
  report,
}: {
  report: CoursePerformanceReport;
}) {
  function download() {
    const header = [
      "course_id",
      "course_slug",
      "course_title",
      "publication_status",
      "paid_orders",
      "unique_buyers",
      "revenue_toman",
      "enrollments",
    ];
    const rows = report.items.map((item) => [
      item.courseId,
      item.slug,
      item.title,
      item.publicationStatus,
      item.paidOrders,
      item.uniqueBuyers,
      item.revenueToman,
      item.enrollments,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dxcode-course-performance-${report.range.from}-${report.range.to}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      className="admin-range__submit admin-course-performance__export"
      onClick={download}
    >
      دریافت CSV
    </button>
  );
}
