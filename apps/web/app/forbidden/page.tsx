import type { Metadata } from "next";
import { Button } from "@zharfa/ui";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("دسترسی مجاز نیست");

export default function ForbiddenPage() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">۴۰۳</p>
      <h1>این بخش برای مدیر است</h1>
      <p className="editorial__lead">
        حساب شما اجازه ورود به مدیریت ژرفا را ندارد. دوره‌ها و حساب دانشجو همچنان
        در دسترس‌اند.
      </p>
      <div className="editorial__actions">
        <Button href="/dashboard">حساب من</Button>
        <Button href="/courses" variant="secondary">
          دوره‌ها
        </Button>
      </div>
    </article>
  );
}
