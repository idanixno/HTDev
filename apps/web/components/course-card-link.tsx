import { CourseCard } from "@zharfa/ui";
import {
  courseCardStatusLabel,
  courseDiscount,
  formatCourseDurationClock,
  formatTomanLabel,
  type PublicCourseCard,
} from "../lib/catalog";
import { relativePublished } from "../lib/relative-time";

export function CourseCardLink({
  course,
  enrolled = false,
}: {
  course: PublicCourseCard;
  enrolled?: boolean;
}) {
  const discount = courseDiscount(course);
  const status = courseCardStatusLabel(course);
  const byline =
    course.category?.title ??
    relativePublished(course.publishedAt ?? null) ??
    undefined;
  // Free always fills the price slot; skip repeating status labels like «به‌زودی».
  const isFreePrice =
    course.offerKind === "FREE" ||
    (course.offerKind === "COMING_SOON" && course.priceToman <= 0);
  const priceLabel = isFreePrice
    ? "رایگان!"
    : course.priceToman > 0
      ? formatTomanLabel(course.priceToman)
      : course.priceLabel && course.priceLabel !== status
        ? course.priceLabel
        : undefined;

  return (
    <CourseCard
      availability={course.availability}
      className={isFreePrice ? "z-course-card--freePrice" : undefined}
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
        enrolled ? (
          <p className="course-access-note">شما دانشجوی این دوره هستید</p>
        ) : (
          <a className="z-btn z-btn--primary" href={course.href}>
            مشاهده دوره
          </a>
        )
      }
    />
  );
}
