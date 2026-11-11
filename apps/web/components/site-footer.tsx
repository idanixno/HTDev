import Link from "next/link";
import { fetchSiteChrome } from "../lib/catalog";
import { BrandText } from "./brand-text";
import { DxCodeLogo } from "./dxcode-logo";
import { DxCodeWordmark } from "./dxcode-wordmark";

const FOOTER_COPYRIGHT_NOTICE =
  "تمامی ویدیوها و محتوای آموزشی DXCode مشمول حقوق مالکیت فکری است. هرگونه نشر، کپی یا استفادهٔ غیرمجاز بدون رضایت ما، نقض صریح حقوق و مصداق بارز سرقت است و پیگرد قانونی دارد.";

export async function SiteFooter() {
  const chrome = await fetchSiteChrome();
  const hasEnamad = Boolean(chrome.enamadHtml?.trim());
  const hasGateway = Boolean(chrome.paymentGatewayHtml?.trim());
  const showTrusts = hasEnamad || hasGateway;
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(
    new Date(),
  );

  return (
    <footer className="site-footer disinab-footer">
      <div
        className={
          "site-footer__inner disinab-footer__plate" +
          (showTrusts ? " site-footer__inner--with-trusts" : "")
        }
      >
        <div className="site-footer__brand disinab-footer__brand">
          <div className="disinab-footer__brand-row">
            <span className="disinab-footer__mark" aria-hidden="true">
              <DxCodeLogo className="disinab-footer__logo" decorative bare />
            </span>
            <div className="disinab-footer__brand-copy">
              {chrome.brandName === "DXCode" ? (
                <DxCodeWordmark as="p" className="site-footer__name" />
              ) : (
                <p className="site-footer__name">{chrome.brandName}</p>
              )}
            </div>
          </div>
          {chrome.footerBlurb ? (
            <p className="disinab__line disinab-footer__line">
              {chrome.footerBlurb}
            </p>
          ) : null}
        </div>
        <div className="site-footer__menus disinab-footer__menus">
          {chrome.footerGroups.map((group) => (
            <nav
              key={group.label}
              aria-label={group.label}
              className="disinab-footer__group"
            >
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.label}-${link.href}-${link.label}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {showTrusts ? (
          <div className="site-footer__trusts disinab-footer__trusts">
            <p className="disinab__brand site-footer__label">
              {chrome.trustsLabel}
            </p>
            <div className="site-footer__badges">
              {hasEnamad ? (
                <div
                  className="site-footer__badge"
                  dangerouslySetInnerHTML={{ __html: chrome.enamadHtml! }}
                />
              ) : null}
              {hasGateway ? (
                <div
                  className="site-footer__badge"
                  dangerouslySetInnerHTML={{
                    __html: chrome.paymentGatewayHtml!,
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="disinab-footer__legal">
        <p className="disinab-footer__copy">
          © {year}{" "}
          {chrome.brandName === "DXCode" ? (
            <DxCodeWordmark className="dx-wordmark--inline" />
          ) : (
            chrome.brandName
          )}{" "}
          — همهٔ حقوق محفوظ است.
        </p>
        <p className="disinab-footer__rights">
          <BrandText>{FOOTER_COPYRIGHT_NOTICE}</BrandText>
        </p>
      </div>
    </footer>
  );
}
