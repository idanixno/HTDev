"use client";

import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
};

const REQUIRED_MESSAGE = "این فیلد الزامی است.";

function validityMessage(
  input: HTMLInputElement,
  label: ReactNode,
): string | null {
  const { validity } = input;
  if (validity.valid) return null;
  if (validity.valueMissing) return REQUIRED_MESSAGE;
  if (validity.tooShort) {
    const min = input.minLength > 0 ? input.minLength : null;
    if (input.type === "password") {
      return min
        ? `رمز عبور باید حداقل ${min.toLocaleString("fa-IR")} نویسه باشد.`
        : "رمز عبور کوتاه است.";
    }
    return min
      ? `حداقل ${min.toLocaleString("fa-IR")} نویسه لازم است.`
      : "مقدار واردشده کوتاه است.";
  }
  if (validity.tooLong) return "مقدار واردشده بیش از حد بلند است.";
  if (validity.typeMismatch) {
    if (input.type === "email") return "ایمیل معتبر نیست.";
    if (input.type === "url") return "آدرس معتبر نیست.";
    return "مقدار این فیلد معتبر نیست.";
  }
  if (validity.patternMismatch) {
    return typeof label === "string"
      ? `مقدار «${label}» معتبر نیست.`
      : "مقدار این فیلد معتبر نیست.";
  }
  if (validity.rangeUnderflow || validity.rangeOverflow) {
    return "عدد خارج از محدوده مجاز است.";
  }
  return "مقدار این فیلد معتبر نیست.";
}

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
  required,
  onBlur,
  onChange,
  onInvalid,
  ...rest
}: FieldProps) {
  const secret = type === "password";
  const [visible, setVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const shownError = error ?? localError;

  const describedBy = [
    shownError ? `${id}-error` : null,
    hint && !shownError ? `${id}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const classes = [
    "z-field",
    shownError ? "z-field--error" : "",
    disabled ? "z-field--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleInvalid(event: FormEvent<HTMLInputElement>) {
    event.preventDefault();
    const message = validityMessage(event.currentTarget, label);
    if (message) setLocalError(message);
    onInvalid?.(event);
  }

  const control = (
    <input
      id={id}
      type={secret && visible ? "text" : type}
      className={["z-field__control", mono ? "z-field__control--mono" : ""]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      required={required}
      aria-invalid={shownError ? true : undefined}
      aria-describedby={describedBy || undefined}
      aria-required={required ? true : undefined}
      onInvalid={handleInvalid}
      onChange={(event) => {
        if (localError) setLocalError(null);
        event.currentTarget.setCustomValidity("");
        onChange?.(event);
      }}
      onBlur={(event) => {
        if (required && !event.currentTarget.value.trim()) {
          setLocalError(REQUIRED_MESSAGE);
        } else if (!event.currentTarget.checkValidity()) {
          const message = validityMessage(event.currentTarget, label);
          if (message) setLocalError(message);
        } else if (localError) {
          setLocalError(null);
        }
        onBlur?.(event);
      }}
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
      {shownError ? (
        <p className="z-field__error" id={`${id}-error`} role="alert">
          {shownError}
        </p>
      ) : null}
      {!shownError && hint ? (
        <p className="z-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
