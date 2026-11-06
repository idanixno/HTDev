import { ThemeToggle } from "./theme-toggle";

export default function HomePage() {
  return (
    <div className="shell">
      <header className="shell__header">
        <div className="brand">
          ژرفا <span>Zharfa</span>
        </div>
        <ThemeToggle />
      </header>
      <main className="shell__main">
        <section className="hero">
          <h1>پلتفرم آموزش شخصی ژرفا</h1>
          <p>
            اسکلت اولیهٔ محیط توسعه — وب، API و worker آمادهٔ اتصال به Postgres،
            Redis و MinIO هستند.
          </p>
          <a className="cta" href="/api/health">
            وضعیت سلامت وب
          </a>
          <div className="health">
            پرداخت و SpotPlayer فقط پس از تأیید درگاه/مجوز واقعی فعال می‌شوند —
            موفقیت ساختگی وجود ندارد.
          </div>
        </section>
      </main>
    </div>
  );
}
