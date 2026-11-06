import type { Metadata } from "next";
import { Button } from "@zharfa/ui";
import { AtlasPanel } from "../components/atlas-panel";
import { CourseCardLink } from "../components/course-card-link";
import { fetchFeaturedCourses } from "../lib/catalog";
import { buildPageMetadata, siteMetadataBase } from "../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: siteMetadataBase.title,
  description: siteMetadataBase.description,
  path: "/",
});

export default async function HomePage() {
  const featured = await fetchFeaturedCourses();

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
    </>
  );
}
