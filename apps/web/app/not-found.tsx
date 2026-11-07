import { Button } from "@zharfa/ui";

export default function NotFound() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">۴۰۴</p>
      <h1>این صفحه در ژرفا نیست</h1>
      <p className="editorial__lead">
        نشانی اشتباه است یا محتوا منتشر نشده. از کاتالوگ یا صفحه اصلی ادامه دهید.
      </p>
      <div className="editorial__actions">
        <Button href="/">خانه</Button>
        <Button href="/courses" variant="secondary">
          دوره‌ها
        </Button>
      </div>
    </article>
  );
}
