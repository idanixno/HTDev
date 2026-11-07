import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@zharfa/ui";
import { CourseCardLink } from "../../../components/course-card-link";
import { FreeAccessButton } from "../../../components/free-access-button";
import { fetchCourse, fetchCourses } from "../../../lib/catalog";
import { absoluteUrl } from "../../../lib/site-url";
import { fetchCheckoutOptions } from "../../../lib/commerce";
import { buildPageMetadata } from "../../../lib/seo";
import { fetchCurrentUser } from "../../../lib/session";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) {
    return buildPageMetadata({
      title: "دوره یافت نشد",
      description: "این دوره در کاتالوگ ژرفا موجود نیست.",
      path: `/courses/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: course.title,
    description: course.summary ?? course.description ?? course.title,
    path: course.href,
    imagePath: course.coverAsset,
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();

  const user = await fetchCurrentUser();
  const related = course.category
    ? (await fetchCourses({
        category: course.category.slug,
        pageSize: 4,
      })).items.filter((item) => item.slug !== course.slug).slice(0, 3)
    : [];
  const previews = course.modules.flatMap((mod) =>
    mod.lessons
      .filter((lesson) => lesson.isPreview)
      .map((lesson) => ({ ...lesson, moduleTitle: mod.title })),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary ?? course.description ?? course.title,
    inLanguage: "fa",
    url: absoluteUrl(course.href),
    provider: {
      "@type": "Organization",
      name: "ژرفا",
      url: absoluteUrl("/"),
    },
  };
  const isPaidOffer =
    course.offerKind === "PAID" || course.offerKind === "PRE_SALE";
  const checkout = isPaidOffer ? await fetchCheckoutOptions(slug) : null;
  const purchaseEnabled = Boolean(checkout?.purchaseEnabled);
  const purchaseHref = user
    ? `/courses/${slug}/purchase`
    : `/login?next=/courses/${encodeURIComponent(slug)}/purchase`;

  return (
    <article className="course-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="مسیر">
        <Link href="/">خانه</Link>
        <span aria-hidden="true">/</span>
        <Link href="/courses">دوره‌ها</Link>
        {course.category ? (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/courses?category=${course.category.slug}`}>
              {course.category.title}
            </Link>
          </>
        ) : null}
      </nav>
      <header className="course-detail__hero">
        <div className="course-detail__artwork">
          {course.coverAsset ? (
            // Local SVG artwork — native img avoids next/image SVG optimizer gaps.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverAsset}
              alt=""
              className="course-detail__artwork-img"
              decoding="async"
              fetchPriority="high"
            />
          ) : null}
          <span className="visually-hidden">{course.title}</span>
        </div>
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
              user ? (
                <FreeAccessButton courseSlug={slug} />
              ) : (
                <Button
                  href={`/login?next=/courses/${encodeURIComponent(slug)}`}
                  variant="primary"
                >
                  ورود برای دسترسی رایگان
                </Button>
              )
            ) : isPaidOffer ? (
              purchaseEnabled ? (
                <Button href={purchaseHref} variant="primary">
                  {user ? "ادامه خرید" : "ورود برای خرید"}
                </Button>
              ) : (
                <Button href={purchaseHref} variant="secondary">
                  وضعیت درگاه خرید
                </Button>
              )
            ) : (
              <Button href="/paths" variant="primary">
                مشاهده مسیرهای مرتبط
              </Button>
            )}
          </div>
          <p className="course-detail__note">
            {course.offerKind === "FREE"
              ? "این دوره رایگان است و از درگاه پرداخت عبور نمی‌کند. لایسنس ویدیو فقط بعد از پاسخ اسپات‌پلیر صادر می‌شود."
              : isPaidOffer && !purchaseEnabled
                ? "خرید این دوره تا وقتی درگاه پرداخت پیکربندی نشده باشد شروع نمی‌شود. وضعیت دقیق در صفحه خرید نوشته شده است."
                : "پرداخت فقط بعد از تأیید سرور با درگاه ثبت می‌شود. ساخت لایسنس اسپات‌پلیر مرحله جداگانه‌ای است."}
          </p>
        </div>
      </header>

      {course.description ? (
        <section className="course-detail__section">
          <h2>درباره دوره</h2>
          <p>{course.description}</p>
        </section>
      ) : null}

      {previews.length > 0 ? (
        <section className="course-detail__section" aria-labelledby="previews">
          <h2 id="previews">پیش‌نمایش رایگان</h2>
          <ul className="course-detail__lessons">
            {previews.map((lesson) => (
              <li key={lesson.id}>
                <span>{lesson.title}</span>
                <span className="course-detail__lesson-meta">
                  {lesson.moduleTitle}
                  {lesson.durationMinutes != null
                    ? ` · ${lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p>تماشای ویدیو داخل همین سایت انجام نمی‌شود و از اسپات‌پلیر است.</p>
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

      {related.length > 0 ? (
        <section className="course-detail__section" aria-labelledby="related">
          <h2 id="related">دوره‌های همین موضوع</h2>
          <ul className="related-list">
            {related.map((item) => (
              <li key={item.id}>
                <CourseCardLink course={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="course-detail__section">
        <h2>قبل از خرید</h2>
        <ul>
          <li>قیمت به تومان است و تخفیف فقط روی سرور حساب می‌شود.</li>
          <li>
            شرایط بازپرداخت در <Link href="/refunds">صفحه بازپرداخت</Link> است.
          </li>
          <li>
            پرسش‌های عمومی در <Link href="/faq">پرسش‌های رایج</Link> جمع شده‌اند.
          </li>
        </ul>
      </section>

      <p className="course-detail__back">
        <Link href="/courses">همه دوره‌ها</Link>
      </p>
    </article>
  );
}
