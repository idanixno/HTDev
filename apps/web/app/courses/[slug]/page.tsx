import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@zharfa/ui";
import { FreeAccessButton } from "../../../components/free-access-button";
import { fetchCourse } from "../../../lib/catalog";
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
  const isPaidOffer =
    course.offerKind === "PAID" || course.offerKind === "PRE_SALE";
  const checkout = isPaidOffer ? await fetchCheckoutOptions(slug) : null;
  const purchaseEnabled = Boolean(checkout?.purchaseEnabled);
  const purchaseHref = user
    ? `/courses/${slug}/purchase`
    : `/login?next=/courses/${encodeURIComponent(slug)}/purchase`;

  return (
    <article className="course-detail">
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
              ? "دسترسی رایگان بدون درگاه پرداخت؛ لایسنس اسپات‌پلیر فقط پس از پاسخ واقعی ارائه‌دهنده صادر می‌شود."
              : isPaidOffer && !purchaseEnabled
                ? "خرید پولی تا تنظیم اعتبارنامهٔ درگاه غیرفعال است (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED)."
                : "پرداخت فقط پس از verify درگاه ثبت می‌شود. صدور لایسنس اسپات‌پلیر محور جداگانه‌ای است."}
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
