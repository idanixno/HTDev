"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
};

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M2.5 12S6.2 6.5 12 6.5 21.5 12 21.5 12 17.8 17.5 12 17.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {off ? (
        <path d="M5 19 19 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      ) : null}
    </svg>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  mono = false,
  className,
  disabled,
  type,
  ...rest
}: FieldProps) {
  const secret = type === "password";
  const [visible, setVisible] = useState(false);
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

  const control = (
    <input
      id={id}
      type={secret && visible ? "text" : type}
      className={["z-field__control", mono ? "z-field__control--mono" : ""]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy || undefined}
      {...rest}
    />
  );

  return (
    <div className={classes}>
      <label className="z-field__label" htmlFor={id}>
        {label}
      </label>
      {secret ? (
        <div className="z-field__secret">
          {control}
          <button
            type="button"
            className="z-field__reveal"
            aria-pressed={visible}
            aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
            disabled={disabled}
            onClick={() => setVisible((value) => !value)}
          >
            <EyeIcon off={visible} />
          </button>
        </div>
      ) : (
        control
      )}
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
