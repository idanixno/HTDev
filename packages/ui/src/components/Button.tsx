import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type SharedProps = {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

export type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type ButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClassName(
  variant: ButtonVariant,
  loading: boolean,
  className?: string,
) {
  return ["z-btn", `z-btn--${variant}`, loading ? "z-btn--loading" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    loading = false,
    className,
    children,
  } = props;
  const classes = buttonClassName(variant, loading, className);

  if ("href" in props && props.href) {
    const {
      href,
      variant: _v,
      loading: _l,
      className: _c,
      children: _ch,
      ...anchorRest
    } = props;
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={loading || undefined}
        {...anchorRest}
      >
        {loading ? <span className="z-btn__spinner" aria-hidden="true" /> : null}
        <span>{children}</span>
      </a>
    );
  }

  const {
    variant: _v,
    loading: _l,
    className: _c,
    children: _ch,
    type = "button",
    disabled,
    ...buttonRest
  } = props as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {loading ? <span className="z-btn__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
