/**
 * Identity normalization helpers — pure functions, safe to unit-test.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Iranian mobile: 09XXXXXXXXX after normalization */
const IR_MOBILE_RE = /^09\d{9}$/;
/** Username: 3–32 chars, latin letters/digits/_/- after trim */
const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/;

export type IdentifierKind = "email" | "phone" | "username";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(normalizeEmail(raw));
}

/**
 * Normalize Iranian phone numbers to local 09XXXXXXXXX form.
 * Accepts: 0912..., +98912..., 0098912..., 98912..., with spaces/dashes.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s\-\(\)]/g, "").trim();
  if (!digits) return null;

  if (digits.startsWith("+98")) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("0098")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("98") && digits.length === 12) {
    digits = "0" + digits.slice(2);
  }

  if (!IR_MOBILE_RE.test(digits)) {
    return null;
  }
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_RE.test(raw.trim());
}

/** Detect login identifier kind heuristically, then normalize. */
export function classifyIdentifier(raw: string): {
  kind: IdentifierKind;
  normalized: string;
} | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    if (!isValidEmail(trimmed)) return null;
    return { kind: "email", normalized: normalizeEmail(trimmed) };
  }

  // Digits / + leading → try phone
  if (/^[+0-9\s\-()]+$/.test(trimmed) && /\d{8,}/.test(trimmed)) {
    const phone = normalizePhone(trimmed);
    if (!phone) return null;
    return { kind: "phone", normalized: phone };
  }

  if (!isValidUsername(trimmed)) return null;
  return { kind: "username", normalized: normalizeUsername(trimmed) };
}
