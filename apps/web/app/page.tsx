import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@zharfa/ui";
import { AtlasPanel } from "../components/atlas-panel";
import { CourseCardLink } from "../components/course-card-link";
import {
  fetchCategories,
  fetchFeaturedCourses,
  fetchPaths,
} from "../lib/catalog";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: siteMetadataBase.title,
  description: siteMetadataBase.description,
  path: "/",
});

export default async function HomePage() {
  const [featured, categories, paths] = await Promise.all([
    fetchFeaturedCourses(),
    fetchCategories(),
    fetchPaths(),
  ]);

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__grid">
          <AtlasPanel />

          <div className="hero__promise">
            <p className="hero__eyebrow">فصل ۰۱ / از دانستن تا ساختن</p>
            <h1 id="hero-heading" className="hero__title">
              <span>سطح را رد کن.</span>
              <span>به عمق برس.</span>
            </h1>
            <p className="hero__lead">
              اطلس یادگیریِ آرمان راد؛ از اولین مسئله تا تصمیم‌های معماری. مسیرت
              را با پیش‌نیاز روشن و تمرین واقعی بساز.
            </p>
            <div className="hero__actions">
              <Button variant="secondary" href="/paths">
                از کجا شروع کنم؟
              </Button>
              <Button variant="primary" href="/courses">
                کاوش در دوره‌ها ←
              </Button>
            </div>
            <p className="hero__fineprint">
              فروش تک‌دوره · بدون اشتراک · دسترسی ویدئو با پلیر رسمی
            </p>
          </div>
        </div>

        <hr className="hero__rule" />
        <p className="hero__domains">
          ۰۱ مبانی برنامه‌نویسی &nbsp;/&nbsp; ۰۲ معماری نرم‌افزار &nbsp;/&nbsp; ۰۳
          سیستم و امنیت
        </p>
      </section>

      <section className="featured" aria-labelledby="featured-heading">
        <header className="featured__intro">
          <p className="featured__eyebrow">۰۲ / اطلس یادگیری ژرفا</p>
          <h2 id="featured-heading" className="featured__title">
            برای قدم بعدی تو
          </h2>
          <p className="featured__lead">
            سه نقطه شروع متفاوت؛ یک رویکرد عمیق به یادگیری — از دادهٔ واقعی
            کاتالوگ.
          </p>
        </header>

        {featured.length === 0 ? (
          <p className="featured__empty">
            هنوز دورهٔ ویژه‌ای از API در دسترس نیست. پس از اجرای migrate و seed،
            این بخش از کاتالوگ پر می‌شود.
          </p>
        ) : (
          <ul className="featured__grid">
            {featured.map((course) => (
              <li key={course.id}>
                <CourseCardLink course={course} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-band" aria-labelledby="domains-heading">
        <header className="home-band__intro">
          <p className="home-band__eyebrow">موضوع‌ها</p>
          <h2 id="domains-heading">از روی مسئله انتخاب کنید</h2>
          <p>
            دسته‌ها موضوع دوره‌اند، نه فروشنده. هر دسته به همان فیلتر کاتالوگ
            وصل است.
          </p>
        </header>
        {categories.length === 0 ? (
          <p className="featured__empty">دسته‌ای از کاتالوگ در دسترس نیست.</p>
        ) : (
          <ul className="home-band__grid">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/courses?category=${category.slug}`}>
                  <strong>{category.title}</strong>
                  <span>
                    {category.courseCount.toLocaleString("fa-IR")} دوره
                  </span>
                  {category.summary ? <p>{category.summary}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-band" aria-labelledby="paths-heading">
        <header className="home-band__intro">
          <p className="home-band__eyebrow">مسیر</p>
          <h2 id="paths-heading">ترتیب پیشنهادی، بدون اشتراک</h2>
        </header>
        {paths.length === 0 ? (
          <p className="featured__empty">مسیر منتشرشده‌ای در دسترس نیست.</p>
        ) : (
          <ul className="home-band__paths">
            {paths.map((path) => (
              <li key={path.id}>
                <Link href={path.href}>
                  <strong>{path.title}</strong>
                  <span>{path.summary}</span>
                  <em>{path.stepCount.toLocaleString("fa-IR")} گام</em>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
