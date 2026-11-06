import type { CSSProperties } from "react";

type Point = { date: string; value: number };
type Slice = { status: string; count: number };

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

export function LineChart({
  title,
  series,
  emptyLabel = "داده‌ای در این بازه نیست",
  valueSuffix = "",
}: {
  title: string;
  series: Point[];
  emptyLabel?: string;
  valueSuffix?: string;
}) {
  const values = series.map((p) => p.value);
  const max = Math.max(0, ...values);
  const hasData = values.some((v) => v > 0);
  const w = 560;
  const h = 180;
  const padX = 12;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = series.map((p, i) => {
    const x =
      series.length <= 1
        ? padX + innerW / 2
        : padX + (i / (series.length - 1)) * innerW;
    const y =
      max === 0
        ? padY + innerH
        : padY + innerH - (p.value / max) * innerH;
    return `${x},${y}`;
  });

  const areaPoints = [
    `${padX},${padY + innerH}`,
    ...points,
    `${padX + innerW},${padY + innerH}`,
  ].join(" ");

  return (
    <figure className="admin-chart">
      <figcaption className="admin-chart__title">{title}</figcaption>
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
            <polygon points={areaPoints} className="admin-chart__area" />
            <polyline
              points={points.join(" ")}
              className="admin-chart__line"
              fill="none"
            />
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
  emptyLabel = "داده‌ای نیست",
}: {
  title: string;
  items: Slice[];
  emptyLabel?: string;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <figure className="admin-chart">
      <figcaption className="admin-chart__title">{title}</figcaption>
      {total === 0 ? (
        <p className="admin-chart__empty">{emptyLabel}</p>
      ) : (
        <ul className="admin-bars">
          {items.map((item, idx) => {
            const pct = total ? (item.count / total) * 100 : 0;
            return (
              <li key={item.status} className="admin-bars__row">
                <div className="admin-bars__label">
                  <span>{item.status}</span>
                  <span>{formatFa(item.count)}</span>
                </div>
                <div className="admin-bars__track" aria-hidden>
                  <div
                    className="admin-bars__fill"
                    style={
                      {
                        width: `${pct}%`,
                        background: CHART_COLORS[idx % CHART_COLORS.length],
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
