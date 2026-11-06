import { Button, CourseCard } from "@zharfa/ui";
import { AtlasPanel } from "../components/atlas-panel";

const FEATURED = [
  {
    availability: "publishedPaid" as const,
    indexLabel: "۰۱",
    diagramCode: "BOUNDARY / ۰۱",
    diagramKind: "boundary" as const,
    title: "معماری تمیز در عمل",
    summary: "مرزهای روشن؛ کدی که با تغییر نمی‌شکند.",
    meta: "پیشرفته · ۱۸ ساعت · ۴۲ درس",
    priceLabel: "۲٬۴۰۰٬۰۰۰ تومان",
    href: "/courses/clean-architecture",
  },
  {
    availability: "publishedFree" as const,
    indexLabel: "۰۳",
    diagramCode: "SYSTEM LAYERS",
    chainNodes: ["USER / SHELL", "KERNEL", "HARDWARE"] as [
      string,
      string,
      string,
    ],
    title: "شروع کار با Linux",
    summary: "یک شروع عملی برای کار با سیستم‌عامل.",
    meta: "مقدماتی · ۳ ساعت · ۱۲ درس",
    priceLabel: "رایگان",
    href: "/courses/linux-intro",
  },
  {
    availability: "preorder" as const,
    indexLabel: "۰۴",
    diagramCode: "TRUST BOUNDARIES",
    chainNodes: ["CLIENT", "AUTH / TOKEN", "API"] as [string, string, string],
    title: "امنیت API در عمل",
    summary: "اعتماد را در مرزهای سیستم طراحی کنید.",
    meta: "متوسط · برآورد ۱۲ ساعت / ۳۰ درس",
    priceLabel: "۱٬۹۰۰٬۰۰۰ تومان",
    href: "/courses/api-security",
  },
];

export default function HomePage() {
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
            سه نقطه شروع متفاوت؛ یک رویکرد عمیق به یادگیری.
          </p>
        </header>

        <div className="featured__grid">
          {FEATURED.map((course) => (
            <CourseCard key={course.href} {...course} />
          ))}
        </div>
      </section>
    </>
  );
}
