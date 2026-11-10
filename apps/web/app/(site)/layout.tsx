import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell__main">{children}</main>
      <SiteFooter />
    </div>
  );
}
