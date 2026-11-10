import { Button } from "@zharfa/ui";
import { DisinabBadge, DisinabPlate } from "../components/disinab";

export default function NotFound() {
  return (
    <div className="disinab-not-found">
      <DisinabPlate
        className="disinab-not-found__plate"
        aria-labelledby="not-found-title"
      >
        <DisinabBadge tone="muted">۴۰۴</DisinabBadge>
        <h1 id="not-found-title">این صفحه در ژرفا نیست</h1>
        <p className="disinab__line">
          نشانی اشتباه است یا محتوا منتشر نشده. از کاتالوگ یا صفحه اصلی ادامه
          دهید.
        </p>
        <div className="disinab-not-found__actions">
          <Button href="/">خانه</Button>
          <Button href="/courses" variant="secondary">
            دوره‌ها
          </Button>
        </div>
      </DisinabPlate>
    </div>
  );
}
