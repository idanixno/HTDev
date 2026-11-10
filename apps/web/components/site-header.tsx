import Link from "next/link";
import { Button } from "@zharfa/ui";
import { CartLink } from "./cart-link";
import { MobileNav } from "./mobile-nav";
import { SiteHeaderNav } from "./site-header-nav";
import { ThemeToggle } from "./theme-toggle";
import { fetchCurrentUser } from "../lib/session";

export async function SiteHeader() {
  const user = await fetchCurrentUser();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__name">ژرفا</span>
          <span className="site-brand__tag">اطلس یادگیری عمیق</span>
        </Link>

        <SiteHeaderNav />

        <div className="site-header__actions">
          <CartLink />
          <ThemeToggle />
          <MobileNav authed={Boolean(user)} />
          {user ? (
            <Button href="/dashboard" variant="secondary">
              حساب من
            </Button>
          ) : (
            <Button href="/login">ورود</Button>
          )}
        </div>
      </div>
    </header>
  );
}
