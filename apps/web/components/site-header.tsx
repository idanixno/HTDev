import Link from "next/link";
import { fetchSiteChrome } from "../lib/catalog";
import { CartLink } from "./cart-link";
import { HeaderAccount } from "./header-account";
import { MobileNav } from "./mobile-nav";
import { SiteHeaderNav } from "./site-header-nav";
import { ThemeToggle } from "./theme-toggle";
import { ZharfaLogo } from "./zharfa-logo";

export async function SiteHeader() {
  const chrome = await fetchSiteChrome();

  return (
    <header className="site-header disinab-header">
      <div className="site-header__inner disinab-header__bar">
        <Link href="/" className="site-brand disinab-header__brand">
          <span className="disinab-header__mark" aria-hidden="true">
            <ZharfaLogo className="disinab-header__logo" decorative />
          </span>
          <span className="disinab-header__copy">
            <span className="site-brand__name">{chrome.brandName}</span>
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
          <HeaderAccount
            guestHref={chrome.guestCtaHref}
            guestLabel={chrome.guestCtaLabel}
            authedHref={chrome.authedCtaHref}
            authedLabel={chrome.authedCtaLabel}
          />
        </div>
      </div>
    </header>
  );
}
