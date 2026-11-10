import Link from "next/link";
import { fetchSiteChrome } from "../lib/catalog";
import { ZharfaLogo } from "./zharfa-logo";

export async function SiteFooter() {
  const chrome = await fetchSiteChrome();
  const hasEnamad = Boolean(chrome.enamadHtml?.trim());
  const hasGateway = Boolean(chrome.paymentGatewayHtml?.trim());
  const showTrusts = hasEnamad || hasGateway;

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
              <ZharfaLogo className="disinab-footer__logo" decorative />
            </span>
            <div className="disinab-footer__brand-copy">
              {chrome.brandKicker ? (
                <p className="disinab__brand">{chrome.brandKicker}</p>
              ) : null}
              <p className="site-footer__name">{chrome.brandName}</p>
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
              <p className="disinab__brand site-footer__label">{group.label}</p>
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
    </footer>
  );
}
