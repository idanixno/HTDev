import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@zharfa/ui";
import { fetchCourse } from "../../../lib/catalog";

type Params = Promise<{ slug: string }>;

export default async function CourseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();

  return (
    <article className="course-detail">
      <header className="course-detail__hero">
        <div
          className="course-detail__artwork"
          style={
            course.coverAsset
              ? { backgroundImage: `url(${course.coverAsset})` }
              : undefined
          }
          role="img"
          aria-label={course.title}
        />
        <div className="course-detail__intro">
          <p className="course-detail__status">{course.statusLabel}</p>
          {course.category ? (
            <p className="course-detail__category">{course.category.title}</p>
          ) : null}
          <h1 className="course-detail__title">{course.title}</h1>
          <p className="course-detail__summary">{course.summary}</p>
          {course.meta ? (
            <p className="course-detail__meta">{course.meta}</p>
          ) : null}
          <p className="course-detail__price">{course.priceLabel}</p>
          <div className="course-detail__actions">
            <Button href="/courses" variant="secondary">
              بازگشت به کاتالوگ
            </Button>
            {course.offerKind === "FREE" ? (
              <Button href="/register" variant="primary">
                ثبت‌نام برای دسترسی رایگان
              </Button>
            ) : course.offerKind === "PAID" || course.offerKind === "PRE_SALE" ? (
              <Button href="/login" variant="primary">
                ورود برای ادامه خرید
              </Button>
            ) : (
              <Button href="/paths" variant="primary">
                مشاهده مسیرهای مرتبط
              </Button>
            )}
          </div>
          <p className="course-detail__note">
            پرداخت و دسترسی ویدئو هنوز به درگاه واقعی و SpotPlayer وصل نشده‌اند —
            بدون شبیه‌سازی موفقیت.
          </p>
        </div>
      </header>

      {course.description ? (
        <section className="course-detail__section">
          <h2>درباره دوره</h2>
          <p>{course.description}</p>
        </section>
      ) : null}

      <section className="course-detail__section" aria-labelledby="curriculum">
        <h2 id="curriculum">محتوای دوره</h2>
        {course.modules.length === 0 ? (
          <p>سرفصل هنوز منتشر نشده است.</p>
        ) : (
          <ol className="course-detail__modules">
            {course.modules.map((mod) => (
              <li key={mod.id} className="course-detail__module">
                <h3>{mod.title}</h3>
                {mod.summary ? <p>{mod.summary}</p> : null}
                <ul className="course-detail__lessons">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <span>{lesson.title}</span>
                      <span className="course-detail__lesson-meta">
                        {lesson.isPreview ? "پیش‌نمایش · " : ""}
                        {lesson.durationMinutes != null
                          ? `${lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="course-detail__back">
        <Link href="/courses">← همه دوره‌ها</Link>
      </p>
    </article>
  );
}
