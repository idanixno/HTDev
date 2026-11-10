import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

/** دیسیناب — plate primitives matching dashboard `presence__plate`. */

type PlateTag = "section" | "div" | "article" | "aside" | "header";

export function DisinabPlate({
  children,
  className = "",
  aura = true,
  as: Tag = "section",
  style,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  aura?: boolean;
  as?: PlateTag;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">) {
  return (
    <Tag className={`disinab ${className}`.trim()} style={style} {...rest}>
      {aura ? <div className="disinab__aura" aria-hidden="true" /> : null}
      <div className="disinab__plate">{children}</div>
    </Tag>
  );
}

export function DisinabMark({ children }: { children: ReactNode }) {
  return (
    <div className="disinab__mark" aria-hidden="true">
      <span>{children}</span>
    </div>
  );
}

export function DisinabBadge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "live" | "muted";
}) {
  return (
    <span className="disinab__badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function DisinabTabs({
  items,
  value,
  onChange,
  label,
}: {
  items: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <div className="disinab__tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={`disinab__tab${value === item.id ? " is-active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function DisinabFacts({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: boolean }>;
}) {
  return (
    <dl className="disinab__facts">
      {items.map((item) => (
        <div
          key={item.label}
          className={item.hint ? "disinab__hint-row" : undefined}
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DisinabEndpoint({
  method,
  url,
  label = "Endpoint اصلی",
  onCopy,
}: {
  method: string;
  url: string;
  label?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="disinab__endpoint">
      <div className="disinab__endpoint-head">
        <span className="disinab__method">{method}</span>
        <span className="disinab__endpoint-label">{label}</span>
      </div>
      <code className="disinab__endpoint-url" dir="ltr">
        {url}
      </code>
      {onCopy ? (
        <button type="button" className="disinab__copy" onClick={onCopy}>
          کپی آدرس سرویس
        </button>
      ) : null}
    </div>
  );
}

export function DisinabStatus({
  host,
  live = true,
}: {
  host: string;
  live?: boolean;
}) {
  return (
    <p className="disinab__status" data-live={live ? "1" : "0"}>
      <span aria-hidden="true" />
      <code dir="ltr">{host}</code>
    </p>
  );
}
