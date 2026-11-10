import { CourseCard } from "@zharfa/ui";
import { AddToCartButton } from "./add-to-cart-button";
import {
  canAddCourseToCart,
  courseDiscount,
  formatCourseDuration,
  toCartItem,
  type PublicCourseCard,
} from "../lib/catalog";

export function CourseCardLink({ course }: { course: PublicCourseCard }) {
  const discount = courseDiscount(course);
  const purchasable = canAddCourseToCart(course);

  return (
    <CourseCard
      availability={course.availability}
      title={course.title}
      href={course.href}
      coverSrc={course.coverAsset ?? undefined}
      coverAlt={course.title}
      priceLabel={course.priceLabel}
      compareAtLabel={discount?.compareLabel}
      discountLabel={discount?.badge}
      statusLabel={course.statusLabel}
      meta={formatCourseDuration(course.durationHours)}
      action={
        course.offerKind === "FREE" ? (
          <p className="course-access-note">شما به این دوره دسترسی کامل دارید</p>
        ) : purchasable ? (
          <AddToCartButton item={toCartItem(course)} />
        ) : (
          <a className="z-btn z-btn--secondary" href={course.href}>
            مشاهده دوره
          </a>
        )
      }
    />
  );
}
