function tehranDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value("year"), value("month") - 1, value("day"));
}

export function relativePublished(iso: string | null, now = new Date()) {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const days = Math.round((tehranDay(now) - tehranDay(then)) / 86_400_000);
  if (days <= 0) return "امروز";
  if (days === 1) return "دیروز";
  if (days < 7) return `${days.toLocaleString("fa-IR")} روز پیش`;
  if (days < 30)
    return `${Math.floor(days / 7).toLocaleString("fa-IR")} هفته پیش`;
  if (days < 365)
    return `${Math.floor(days / 30).toLocaleString("fa-IR")} ماه پیش`;
  return `${Math.floor(days / 365).toLocaleString("fa-IR")} سال پیش`;
}
