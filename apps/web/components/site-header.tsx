import Link from "next/link";
import { fetchSiteChrome } from "../lib/catalog";
import { fetchCurrentUser } from "../lib/session";
import { HeaderAccount } from "./header-account";
import { MobileNav } from "./mobile-nav";
import { SiteHeaderNav } from "./site-header-nav";
import { ThemeToggle } from "./theme-toggle";
import { DxCodeLogo } from "./dxcode-logo";
import { DxCodeWordmark } from "./dxcode-wordmark";

export async function SiteHeader() {
  const [chrome, user] = await Promise.all([
    fetchSiteChrome(),
    fetchCurrentUser(),
  ]);
  const authed = Boolean(user);

  return (
    <header className="site-header disinab-header">
      <div className="site-header__inner disinab-header__bar">
        <div className="disinab-header__leading">
          <HeaderAccount
            guestHref={chrome.guestCtaHref}
            guestLabel={chrome.guestCtaLabel}
            authedHref={chrome.authedCtaHref}
            authedLabel={chrome.authedCtaLabel}
            authed={authed}
          />
          <ThemeToggle />
        </div>

        <Link href="/" className="site-brand disinab-header__brand">
          <span className="disinab-header__mark" aria-hidden="true">
            <DxCodeLogo className="disinab-header__logo" decorative bare />
          </span>
          <span className="disinab-header__copy">
            {chrome.brandName === "DXCode" ? (
              <DxCodeWordmark className="site-brand__name" />
            ) : (
              <span className="site-brand__name">{chrome.brandName}</span>
            )}
          </span>
        </Link>

        <SiteHeaderNav links={chrome.headerLinks} />

        <div className="site-header__actions disinab-header__actions">
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
            authed={authed}
          />
        </div>
      </div>
    </header>
  );
}
