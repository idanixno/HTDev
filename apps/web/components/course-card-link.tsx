import { CourseCard } from "@zharfa/ui";
import {
  courseCardStatusLabel,
  courseDiscount,
  formatCourseDurationClock,
  type PublicCourseCard,
} from "../lib/catalog";
import { relativePublished } from "../lib/relative-time";

export function CourseCardLink({ course }: { course: PublicCourseCard }) {
  const discount = courseDiscount(course);
  const status = courseCardStatusLabel(course);
  const byline =
    course.category?.title ??
    relativePublished(course.publishedAt ?? null) ??
    undefined;
  // Avoid repeating «به‌زودی» / status in both meta and price rows.
  const priceLabel =
    course.priceLabel && course.priceLabel !== status
      ? course.priceLabel
      : course.offerKind === "FREE"
        ? course.priceLabel
        : undefined;

  return (
    <CourseCard
      availability={course.availability}
      title={course.title}
      href={course.href}
      coverSrc={course.coverAsset ?? undefined}
      coverAlt={course.title}
      priceLabel={priceLabel}
      compareAtLabel={discount?.compareLabel}
      discountLabel={discount?.badge}
      statusLabel={status}
      byline={byline}
      durationLabel={formatCourseDurationClock(course.durationHours)}
      action={
        course.offerKind === "FREE" ? (
          <p className="course-access-note">دسترسی کامل</p>
        ) : (
          <a className="z-btn z-btn--primary" href={course.href}>
            مشاهده دوره
          </a>
        )
      }
    />
  );
}
