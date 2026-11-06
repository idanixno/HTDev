import { CourseCard } from "@zharfa/ui";
import {
  courseCardProps,
  type PublicCourseCard,
} from "../lib/catalog";

export function CourseCardLink({ course }: { course: PublicCourseCard }) {
  return <CourseCard {...courseCardProps(course)} />;
}
