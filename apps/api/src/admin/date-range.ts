/** Inclusive calendar-day range helpers for admin analytics (UTC dates). */

export type DateRange = {
  from: Date;
  to: Date;
};

export function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

export function endOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

/** Parse YYYY-MM-DD (UTC). Throws on invalid. */
export function parseUtcDateOnly(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    throw new Error(`Invalid date: ${value}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new Error(`Invalid date: ${value}`);
  }
  return dt;
}

/**
 * Resolve from/to query params. Defaults to last 30 UTC days inclusive of today.
 * `to` is end-of-day; `from` is start-of-day.
 */
export function resolveDateRange(input?: {
  from?: string;
  to?: string;
  now?: Date;
}): DateRange {
  const now = input?.now ?? new Date();
  const defaultTo = endOfUtcDay(now);
  const defaultFrom = startOfUtcDay(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29)),
  );

  let from = defaultFrom;
  let to = defaultTo;

  if (input?.from) {
    from = startOfUtcDay(parseUtcDateOnly(input.from));
  }
  if (input?.to) {
    to = endOfUtcDay(parseUtcDateOnly(input.to));
  }

  if (from.getTime() > to.getTime()) {
    throw new Error("from must be on or before to");
  }

  // Cap range at 366 days to keep aggregates bounded.
  const maxMs = 366 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxMs) {
    throw new Error("date range must be at most 366 days");
  }

  return { from, to };
}

/** Each UTC calendar day as YYYY-MM-DD between from..to inclusive. */
export function eachUtcDay(from: Date, to: Date): string[] {
  const days: string[] = [];
  let cursor = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  while (cursor.getTime() <= end.getTime()) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return days;
}

export function utcDayKey(d: Date): string {
  return startOfUtcDay(d).toISOString().slice(0, 10);
}
