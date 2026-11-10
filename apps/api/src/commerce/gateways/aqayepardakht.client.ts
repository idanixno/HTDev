/**
 * AqayePardakht (آقای پرداخت) HTTP client — API v2.
 * Docs: https://aqayepardakht.ir/api/
 *
 * Create:  POST https://panel.aqayepardakht.ir/api/v2/create
 * Verify:  POST https://panel.aqayepardakht.ir/api/v2/verify
 * Pay:     GET  https://panel.aqayepardakht.ir/startpay/{transid}
 * Sandbox: GET  https://panel.aqayepardakht.ir/startpay/sandbox/{transid}
 *
 * Test pin is literally `sandbox` (no merchant registration required).
 * Amounts are Toman (IRT), inclusive range 1_000 … 400_000_000.
 */

export const AQAYE_API_BASE = "https://panel.aqayepardakht.ir";
export const AQAYE_CREATE_URL = `${AQAYE_API_BASE}/api/v2/create`;
export const AQAYE_VERIFY_URL = `${AQAYE_API_BASE}/api/v2/verify`;
/** Official sandbox gateway pin from AqayePardakht docs. */
export const AQAYE_SANDBOX_PIN = "sandbox";

export const AQAYE_AMOUNT_MIN = 1_000;
export const AQAYE_AMOUNT_MAX = 400_000_000;

/** Create/verify API error codes (string or number from gateway). */
export const AQAYE_ERROR_MESSAGES: Record<string, string> = {
  "0": "پرداخت انجام نشد.",
  "1": "پرداخت با موفقیت انجام شد.",
  "2": "تراکنش قبلاً وریفای و پرداخت شده است.",
  "-1": "مبلغ (amount) نمی‌تواند خالی باشد.",
  "-2": "کد پین درگاه نمی‌تواند خالی باشد.",
  "-3": "آدرس callback نمی‌تواند خالی باشد.",
  "-4": "مبلغ باید عددی باشد.",
  "-5": "مبلغ باید بین ۱٬۰۰۰ تا ۴۰۰٬۰۰۰٬۰۰۰ تومان باشد.",
  "-6": "کد پین درگاه اشتباه است.",
  "-7": "کد تراکنش (transid) نمی‌تواند خالی باشد.",
  "-8": "تراکنش مورد نظر وجود ندارد.",
  "-9": "کد پین درگاه با درگاه تراکنش مطابقت ندارد.",
  "-10": "مبلغ با مبلغ تراکنش مطابقت ندارد.",
  "-11": "درگاه در انتظار تأیید یا غیرفعال است.",
  "-12": "امکان ارسال درخواست برای این پذیرنده وجود ندارد.",
  "-13": "شماره کارت باید ۱۶ رقم چسبیده باشد.",
  "-14": "درگاه روی سایت دیگری در حال استفاده است.",
  "-15": "آدرس callback با دامنهٔ تأییدشدهٔ درگاه مغایرت دارد.",
  "-16": "ارجاع‌دهنده نامعتبر است (Referer ارسال نشده).",
  "-17": "callback_method باید POST یا GET باشد.",
};

export type AqayeCallbackMethod = "GET" | "POST";

export type AqayeCreateParams = {
  pin: string;
  amount: number;
  callback: string;
  callbackMethod?: AqayeCallbackMethod;
  invoiceId?: string;
  mobile?: string | null;
  email?: string | null;
  description?: string | null;
  cardNumber?: string | null;
  /** Origin used as Referer (required by some gateway checks). */
  referer?: string | null;
};

export type AqayeCreateSuccess = {
  ok: true;
  transid: string;
  raw: unknown;
};

export type AqayeCreateFailure = {
  ok: false;
  code: string;
  message: string;
  raw: unknown;
};

export type AqayeVerifyParams = {
  pin: string;
  amount: number;
  transid: string;
  referer?: string | null;
};

export type AqayeVerifySuccess = {
  ok: true;
  /** "1" first success, "2" already verified. */
  code: "1" | "2";
  alreadyVerified: boolean;
  raw: unknown;
};

export type AqayeVerifyFailure = {
  ok: false;
  code: string;
  message: string;
  raw: unknown;
};

export function aqayeErrorMessage(code: string | number | null | undefined): string {
  const key = String(code ?? "").trim();
  if (!key) return "پاسخ نامعتبر از آقای پرداخت.";
  return AQAYE_ERROR_MESSAGES[key] ?? `خطای آقای پرداخت (کد ${key}).`;
}

export function validateAqayeAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return AQAYE_ERROR_MESSAGES["-4"]!;
  }
  if (amount < AQAYE_AMOUNT_MIN || amount > AQAYE_AMOUNT_MAX) {
    return AQAYE_ERROR_MESSAGES["-5"]!;
  }
  return null;
}

export function aqayeStartPayUrl(transid: string, sandbox: boolean): string {
  const id = encodeURIComponent(transid.trim());
  return sandbox
    ? `${AQAYE_API_BASE}/startpay/sandbox/${id}`
    : `${AQAYE_API_BASE}/startpay/${id}`;
}

export function resolveAqayePin(
  configuredPin: string | null | undefined,
  sandbox: boolean,
): string | null {
  const pin = configuredPin?.trim() || null;
  if (pin) return pin;
  if (sandbox) return AQAYE_SANDBOX_PIN;
  return null;
}

function headers(referer?: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const origin = referer?.trim();
  if (origin) {
    h.Referer = origin.endsWith("/") ? origin : `${origin}/`;
  }
  return h;
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { parseError: true, body: text.slice(0, 500) };
  }
}

export async function aqayeCreateTransaction(
  params: AqayeCreateParams,
): Promise<AqayeCreateSuccess | AqayeCreateFailure> {
  const amountError = validateAqayeAmount(params.amount);
  if (amountError) {
    return { ok: false, code: "-5", message: amountError, raw: { amount: params.amount } };
  }
  if (!params.pin.trim()) {
    return {
      ok: false,
      code: "-2",
      message: AQAYE_ERROR_MESSAGES["-2"]!,
      raw: {},
    };
  }
  if (!params.callback.trim()) {
    return {
      ok: false,
      code: "-3",
      message: AQAYE_ERROR_MESSAGES["-3"]!,
      raw: {},
    };
  }

  const body: Record<string, string | number> = {
    pin: params.pin.trim(),
    amount: params.amount,
    callback: params.callback.trim(),
    callback_method: params.callbackMethod ?? "GET",
  };
  if (params.invoiceId?.trim()) body.invoice_id = params.invoiceId.trim();
  if (params.mobile?.trim()) body.mobile = params.mobile.trim();
  if (params.email?.trim()) body.email = params.email.trim();
  if (params.description?.trim()) body.description = params.description.trim();
  if (params.cardNumber?.trim()) body.card_number = params.cardNumber.trim();

  const res = await fetch(AQAYE_CREATE_URL, {
    method: "POST",
    headers: headers(params.referer),
    body: JSON.stringify(body),
  });
  const json = await readJson(res);
  const status = String(json.status ?? "");
  const transid = typeof json.transid === "string" ? json.transid : "";
  if (status === "success" && transid) {
    return { ok: true, transid, raw: json };
  }
  const code = String(json.code ?? (res.ok ? "unknown" : res.status));
  return {
    ok: false,
    code,
    message: aqayeErrorMessage(code),
    raw: json,
  };
}

export async function aqayeVerifyTransaction(
  params: AqayeVerifyParams,
): Promise<AqayeVerifySuccess | AqayeVerifyFailure> {
  const amountError = validateAqayeAmount(params.amount);
  if (amountError) {
    return { ok: false, code: "-5", message: amountError, raw: { amount: params.amount } };
  }
  if (!params.pin.trim()) {
    return {
      ok: false,
      code: "-2",
      message: AQAYE_ERROR_MESSAGES["-2"]!,
      raw: {},
    };
  }
  if (!params.transid.trim()) {
    return {
      ok: false,
      code: "-7",
      message: AQAYE_ERROR_MESSAGES["-7"]!,
      raw: {},
    };
  }

  const res = await fetch(AQAYE_VERIFY_URL, {
    method: "POST",
    headers: headers(params.referer),
    body: JSON.stringify({
      pin: params.pin.trim(),
      amount: params.amount,
      transid: params.transid.trim(),
    }),
  });
  const json = await readJson(res);
  const status = String(json.status ?? "");
  const code = String(json.code ?? "");

  // Docs: success + code "1" = paid; code "2" = already verified (idempotent).
  if (status === "success" && (code === "1" || code === "2")) {
    return {
      ok: true,
      code,
      alreadyVerified: code === "2",
      raw: json,
    };
  }

  // Some responses may return code "1"/"2" without status field — accept those.
  if (code === "1" || code === "2") {
    return {
      ok: true,
      code,
      alreadyVerified: code === "2",
      raw: json,
    };
  }

  return {
    ok: false,
    code: code || "0",
    message: aqayeErrorMessage(code || "0"),
    raw: json,
  };
}

export function publicWebOrigin(): string {
  return (
    process.env.WEB_ORIGIN?.split(",")[0]?.trim() ||
    process.env.PUBLIC_WEB_ORIGIN?.trim() ||
    "http://localhost:3000"
  );
}
