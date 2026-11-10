/** Shared Persian labels for enum-like statuses shown in UI. */

export function publicationStatusLabel(status: string): string {
  switch (status) {
    case "DRAFT":
      return "پیش‌نویس";
    case "PUBLISHED":
      return "منتشرشده";
    case "UNPUBLISHED":
      return "برداشته‌شده";
    case "ARCHIVED":
      return "بایگانی";
    default:
      return status;
  }
}

export function offerKindLabel(kind: string): string {
  switch (kind) {
    case "PAID":
      return "پولی";
    case "FREE":
      return "رایگان";
    case "PRE_SALE":
      return "پیش‌فروش";
    case "COMING_SOON":
      return "به‌زودی";
    default:
      return kind;
  }
}

export function credentialsStatusLabel(status: string): string {
  switch (status) {
    case "PRESENT":
      return "آماده";
    case "MISSING":
      return "ندارد";
    default:
      return status;
  }
}

export function integrationStatusLabel(status: string): string {
  switch (status) {
    case "IMPLEMENTED":
      return "پیاده‌سازی‌شده";
    case "PARTIAL":
      return "ناقص";
    case "NOT_CONFIGURED":
    case "MISSING":
      return "پیکربندی‌نشده";
    case "DISABLED":
      return "غیرفعال";
    default:
      return status;
  }
}

export function configSourceLabel(source: string): string {
  switch (source) {
    case "env":
      return "محیط";
    case "database":
      return "پایگاه‌داده";
    case "missing":
      return "بدون منبع";
    default:
      return source;
  }
}
