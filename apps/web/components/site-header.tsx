import Link from "next/link";
import { fetchSiteChrome } from "../lib/catalog";
import { CartLink } from "./cart-link";
import { HeaderAccount } from "./header-account";
import { MobileNav } from "./mobile-nav";
import { SiteHeaderNav } from "./site-header-nav";
import { ThemeToggle } from "./theme-toggle";
import { DxCodeLogo } from "./dxcode-logo";
import { DxCodeWordmark } from "./dxcode-wordmark";

export async function SiteHeader() {
  const chrome = await fetchSiteChrome();

  return (
    <header className="site-header disinab-header">
      <div className="site-header__inner disinab-header__bar">
        <HeaderAccount
          guestHref={chrome.guestCtaHref}
          guestLabel={chrome.guestCtaLabel}
          authedHref={chrome.authedCtaHref}
          authedLabel={chrome.authedCtaLabel}
        />

        <Link href="/" className="site-brand disinab-header__brand">
          <span className="disinab-header__mark" aria-hidden="true">
            <DxCodeLogo className="disinab-header__logo" decorative />
          </span>
          <span className="disinab-header__copy">
            {chrome.brandName === "DXCode" ? (
              <DxCodeWordmark className="site-brand__name" />
            ) : (
              <span className="site-brand__name">{chrome.brandName}</span>
            )}
            {chrome.brandTagline ? (
              <span className="site-brand__tag">{chrome.brandTagline}</span>
            ) : null}
          </span>
        </Link>

        <SiteHeaderNav links={chrome.headerLinks} />

        <div className="site-header__actions disinab-header__actions">
          {chrome.showCart ? <CartLink /> : null}
          {chrome.showThemeToggle ? <ThemeToggle /> : null}
          <MobileNav
            groups={chrome.mobileGroups}
            brandName={chrome.brandName}
            menuTitle={chrome.mobileMenuTitle}
            menuLine={chrome.mobileMenuLine}
            guestCtaLabel={chrome.guestCtaLabel}
            guestCtaHref={chrome.guestCtaHref}
            authedCtaLabel={chrome.authedCtaLabel}
            authedCtaHref={chrome.authedCtaHref}
            showThemeToggle={chrome.showThemeToggle}
          />
        </div>
      </div>
    </header>
  );
}
