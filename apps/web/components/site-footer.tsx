import Link from "next/link";
import { fetchFooterTrusts } from "../lib/catalog";

const LEARN = [
  { href: "/courses", label: "دوره‌ها" },
  { href: "/paths", label: "مسیرهای یادگیری" },
  { href: "/journal", label: "مقالات" },
] as const;

const STUDIO = [
  { href: "/faq", label: "پرسش‌های رایج" },
  { href: "/terms", label: "شرایط استفاده" },
] as const;

export async function SiteFooter() {
  const trusts = await fetchFooterTrusts();
  const hasEnamad = Boolean(trusts.enamadHtml?.trim());
  const hasGateway = Boolean(trusts.paymentGatewayHtml?.trim());
  const showTrusts = hasEnamad || hasGateway;

  return (
    <footer className="site-footer">
      <div
        className={
          "site-footer__inner" +
          (showTrusts ? " site-footer__inner--with-trusts" : "")
        }
      >
        <div className="site-footer__brand">
          <p className="site-footer__name">ژرفا</p>
          <p>
            آموزش فنی یک مدرس. هر دوره جدا فروخته می‌شود و ویدیوی محافظت‌شده در
            اسپات‌پلیر پخش می‌شود.
          </p>
        </div>
        <div className="site-footer__menus">
          <nav aria-label="یادگیری">
            <p className="site-footer__label">یادگیری</p>
            <ul>
              {LEARN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="ژرفا">
            <p className="site-footer__label">ژرفا</p>
            <ul>
              {STUDIO.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {showTrusts ? (
          <div className="site-footer__trusts">
            <p className="site-footer__label">اعتماد و پرداخت</p>
            <div className="site-footer__badges">
              {hasEnamad ? (
                <div
                  className="site-footer__badge"
                  dangerouslySetInnerHTML={{ __html: trusts.enamadHtml! }}
                />
              ) : null}
              {hasGateway ? (
                <div
                  className="site-footer__badge"
                  dangerouslySetInnerHTML={{
                    __html: trusts.paymentGatewayHtml!,
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
