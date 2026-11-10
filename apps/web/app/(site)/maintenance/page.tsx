import type { Metadata } from "next";
import { Button } from "@zharfa/ui";
import { privateMetadata } from "../../../lib/seo";

export const metadata: Metadata = privateMetadata("تعمیرات");

export default function MaintenancePage() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">تعمیرات</p>
      <h1>ژرفا موقتاً در دسترس نیست</h1>
      <p className="editorial__lead">
        صفحه عمومی در حالت تعمیر است. اگر مدیر هستید، از ورود به پنل مدیریت
        ادامه دهید. خرید و کاتالوگ بعد از برداشتن این حالت برمی‌گردند.
      </p>
      <div className="editorial__actions">
        <Button href="/login?next=/admin" variant="secondary">
          ورود مدیر
        </Button>
      </div>
    </article>
  );
}
