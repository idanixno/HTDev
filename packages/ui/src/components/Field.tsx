import type { InputHTMLAttributes, ReactNode } from "react";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
};

export function Field({
  id,
  label,
  hint,
  error,
  mono = false,
  className,
  disabled,
  ...rest
}: FieldProps) {
  const describedBy = [
    error ? `${id}-error` : null,
    hint && !error ? `${id}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const classes = [
    "z-field",
    error ? "z-field--error" : "",
    disabled ? "z-field--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <label className="z-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={["z-field__control", mono ? "z-field__control--mono" : ""]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {error ? (
        <p className="z-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p className="z-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
