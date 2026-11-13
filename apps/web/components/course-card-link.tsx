import { CourseCard } from "@zharfa/ui";
import {
  courseCardStatusLabel,
  courseDiscount,
  formatCourseDurationClock,
  type PublicCourseCard,
} from "../lib/catalog";

export function CourseCardLink({
  course,
  enrolled = false,
}: {
  course: PublicCourseCard;
  enrolled?: boolean;
}) {
  const discount = courseDiscount(course);
  const status = courseCardStatusLabel(course);
  const isFreePrice =
    course.offerKind === "FREE" ||
    (course.offerKind === "COMING_SOON" && course.priceToman <= 0);

  return (
    <CourseCard
      availability={course.availability}
      className={isFreePrice ? "z-course-card--freePrice" : undefined}
      title={course.title}
      href={course.href}
      coverSrc={course.coverAsset ?? undefined}
      coverAlt={course.title}
      priceLabel={
        enrolled ? (
          <span className="course-access-note">شما دانشجوی این دوره هستید</span>
        ) : (
          <a className="z-course-card__view" href={course.href}>
            مشاهده دوره
          </a>
        )
      }
      discountLabel={discount?.badge}
      statusLabel={status}
      durationLabel={formatCourseDurationClock(course.durationHours)}
    />
  );
}
