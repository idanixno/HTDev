/** Shared Persian field messages for forms (Field + textarea/select). */

export const REQUIRED_FIELD_MESSAGE = "این فیلد الزامی است.";

export function requiredFieldError(
  value: string | null | undefined,
): string | null {
  return String(value ?? "").trim() ? null : REQUIRED_FIELD_MESSAGE;
}

export function minLengthFieldError(
  value: string,
  min: number,
  kind: "text" | "password" = "text",
): string | null {
  if (!value.trim()) return REQUIRED_FIELD_MESSAGE;
  if (value.length >= min) return null;
  if (kind === "password") {
    return `رمز عبور باید حداقل ${min.toLocaleString("fa-IR")} نویسه باشد.`;
  }
  return `حداقل ${min.toLocaleString("fa-IR")} نویسه لازم است.`;
}
