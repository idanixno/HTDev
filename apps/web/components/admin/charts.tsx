import type { CSSProperties } from "react";
import { orderStatusLabel } from "../../lib/commerce-shared";
import { licenseStatusLabel } from "../../lib/spotplayer-shared";
import { ticketStatusLabel, type TicketStatus } from "../../lib/ticket-shared";
import { AdminLiveBadge } from "./live-badge";

type Point = { date: string; value: number };
type Slice = { status: string; count: number };
type BreakdownKind = "orders" | "courses" | "tickets" | "provisioning";

const CHART_COLORS = [
  "var(--zharfa-chart-1)",
  "var(--zharfa-chart-2)",
  "var(--zharfa-chart-3)",
  "var(--zharfa-chart-4)",
  "var(--zharfa-chart-5)",
];

function formatFa(n: number): string {
  return n.toLocaleString("fa-IR");
}

function publicationStatusLabel(status: string): string {
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

export function breakdownStatusLabel(
  kind: BreakdownKind,
  status: string,
): string {
  switch (kind) {
    case "orders":
      return orderStatusLabel(status);
    case "courses":
      return publicationStatusLabel(status);
    case "tickets":
      return ticketStatusLabel(status as TicketStatus);
    case "provisioning":
      return licenseStatusLabel(
        status as Parameters<typeof licenseStatusLabel>[0],
      );
    default:
      return status;
  }
}

function toneForStatus(kind: BreakdownKind, status: string): string | null {
  if (kind === "orders") {
    if (status === "PAID") return "var(--zharfa-tone-success)";
    if (status === "FAILED") return "var(--zharfa-tone-danger)";
    if (status === "PENDING" || status === "AWAITING_GATEWAY")
      return "var(--zharfa-tone-pending)";
    if (status === "REFUNDED" || status === "CANCELED")
      return "var(--zharfa-tone-warning)";
  }
  if (kind === "courses") {
    if (status === "PUBLISHED") return "var(--zharfa-tone-success)";
    if (status === "DRAFT") return "var(--zharfa-tone-pending)";
    if (status === "ARCHIVED" || status === "UNPUBLISHED")
      return "var(--zharfa-tone-soon)";
  }
  if (kind === "tickets") {
    if (status === "OPEN") return "var(--zharfa-tone-sale)";
    if (status === "IN_PROGRESS" || status === "WAITING_FOR_USER")
      return "var(--zharfa-tone-pending)";
    if (status === "RESOLVED") return "var(--zharfa-tone-success)";
    if (status === "CLOSED") return "var(--zharfa-text-secondary)";
  }
  if (kind === "provisioning") {
    if (status === "SUCCEEDED") return "var(--zharfa-tone-success)";
    if (status === "FAILED") return "var(--zharfa-tone-danger)";
    if (status === "PENDING" || status === "QUEUED" || status === "IN_PROGRESS")
      return "var(--zharfa-tone-pending)";
  }
  return null;
}

export function LineChart({
  title,
  series,
  emptyLabel = "داده‌ای در این بازه نیست",
  valueSuffix = "",
  live = false,
  chartId = "line",
}: {
  title: string;
  series: Point[];
  emptyLabel?: string;
  valueSuffix?: string;
  live?: boolean;
  chartId?: string;
}) {
  const values = series.map((p) => p.value);
  const max = Math.max(0, ...values);
  const hasData = values.some((v) => v > 0);
  const w = 560;
  const h = 180;
  const padX = 16;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const gradientId = `admin-area-${chartId}`;

  const coords = series.map((p, i) => {
    const x =
      series.length <= 1
        ? padX + innerW / 2
        : padX + (i / (series.length - 1)) * innerW;
    const y =
      max === 0 ? padY + innerH : padY + innerH - (p.value / max) * innerH;
    return { x, y, value: p.value };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPoints = [
    `${padX},${padY + innerH}`,
    ...coords.map((c) => `${c.x},${c.y}`),
    `${padX + innerW},${padY + innerH}`,
  ].join(" ");

  return (
    <figure className="admin-chart admin-chart--line">
      <div className="admin-chart__head">
        <figcaption className="admin-chart__title">{title}</figcaption>
        {live ? <AdminLiveBadge refresh={false} /> : null}
      </div>
      {!hasData ? (
        <p className="admin-chart__empty">{emptyLabel}</p>
      ) : (
        <>
          <svg
            className="admin-chart__svg"
            viewBox={`0 0 ${w} ${h}`}
            role="img"
            aria-label={title}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--zharfa-chart-1)"
                  stopOpacity="0.34"
                />
                <stop
                  offset="100%"
                  stopColor="var(--zharfa-chart-1)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={padX}
                x2={padX + innerW}
                y1={padY + innerH * (1 - t)}
                y2={padY + innerH * (1 - t)}
                className="admin-chart__grid"
              />
            ))}
            <polygon
              points={areaPoints}
              className="admin-chart__area"
              fill={`url(#${gradientId})`}
            />
            <polyline
              points={linePoints}
              className="admin-chart__line"
              fill="none"
              pathLength={1}
            />
            {coords
              .filter((c) => c.value > 0)
              .map((c) => (
                <circle
                  key={`${c.x}-${c.y}`}
                  cx={c.x}
                  cy={c.y}
                  r={3.5}
                  className="admin-chart__dot"
                />
              ))}
          </svg>
          <div className="admin-chart__meta">
            <span>
              بیشینه: {formatFa(max)}
              {valueSuffix}
            </span>
            <span>
              مجموع: {formatFa(values.reduce((a, b) => a + b, 0))}
              {valueSuffix}
            </span>
          </div>
        </>
      )}
    </figure>
  );
}

export function BarBreakdown({
  title,
  items,
  kind,
  emptyLabel = "داده‌ای نیست",
}: {
  title: string;
  items: Slice[];
  kind: BreakdownKind;
  emptyLabel?: string;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <figure className="admin-chart admin-chart--bars">
      <div className="admin-chart__head">
        <figcaption className="admin-chart__title">{title}</figcaption>
      </div>
      {total === 0 ? (
        <p className="admin-chart__empty">{emptyLabel}</p>
      ) : (
        <ul className="admin-bars">
          {items.map((item, idx) => {
            const pct = total ? (item.count / total) * 100 : 0;
            const tone = toneForStatus(kind, item.status);
            return (
              <li
                key={item.status}
                className="admin-bars__row"
                style={{ "--bar-i": idx } as CSSProperties}
              >
                <div className="admin-bars__label">
                  <span>{breakdownStatusLabel(kind, item.status)}</span>
                  <span>{formatFa(item.count)}</span>
                </div>
                <div className="admin-bars__track" aria-hidden>
                  <div
                    className="admin-bars__fill"
                    style={
                      {
                        "--bar-pct": `${pct}%`,
                        background:
                          tone ?? CHART_COLORS[idx % CHART_COLORS.length],
                      } as CSSProperties
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
