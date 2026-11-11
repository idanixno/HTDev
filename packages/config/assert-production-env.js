/**
 * Fail-fast production boot checks shared by API / worker / web.
 * No dependencies — plain ESM for Docker and Node 20+.
 */

const WEAK_SECRETS = new Set([
  "",
  "change-me-in-local-dev-only",
  "change-me-otp-pepper-local-only",
  "changeme",
  "secret",
  "password",
]);

function isTruthyFlag(value) {
  return value === "true" || value === "1";
}

function requireHttpsUrl(name, value) {
  if (!value || !value.trim()) {
    return `${name} is required in production`;
  }
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") {
      return `${name} must use https in production (got ${url.protocol})`;
    }
  } catch {
    return `${name} is not a valid URL`;
  }
  return null;
}

/**
 * @param {"api" | "worker" | "web"} role
 * @param {NodeJS.ProcessEnv} [env]
 */
export function assertProductionEnv(role, env = process.env) {
  if (env.NODE_ENV !== "production") return;

  /** @type {string[]} */
  const errors = [];

  if (isTruthyFlag(env.PAYMENT_MOCK_HOOKS)) {
    errors.push("PAYMENT_MOCK_HOOKS must be false in production");
  }
  if (isTruthyFlag(env.SPOTPLAYER_MOCK_HOOKS)) {
    errors.push("SPOTPLAYER_MOCK_HOOKS must be false in production");
  }
  if (isTruthyFlag(env.SPOTPLAYER_MOCK_FAIL)) {
    errors.push("SPOTPLAYER_MOCK_FAIL must be false in production");
  }

  for (const key of ["SESSION_SECRET", "OTP_PEPPER", "INTERNAL_SECURITY_TOKEN"]) {
    const raw = (env[key] ?? "").trim();
    if (!raw || WEAK_SECRETS.has(raw) || raw.length < 24) {
      errors.push(
        `${key} must be set to a strong unique secret (≥24 chars) in production`,
      );
    }
  }

  if (env.SESSION_SECRET?.trim() === env.OTP_PEPPER?.trim()) {
    errors.push("SESSION_SECRET and OTP_PEPPER must be different");
  }
  if (env.SESSION_SECRET?.trim() === env.INTERNAL_SECURITY_TOKEN?.trim()) {
    errors.push("INTERNAL_SECURITY_TOKEN must not equal SESSION_SECRET");
  }

  const webOriginErr = requireHttpsUrl("WEB_ORIGIN", env.WEB_ORIGIN);
  if (webOriginErr) errors.push(webOriginErr);

  const siteErr = requireHttpsUrl(
    "NEXT_PUBLIC_SITE_URL",
    env.NEXT_PUBLIC_SITE_URL || env.WEB_ORIGIN,
  );
  if (siteErr) errors.push(siteErr);

  if (role === "api" || role === "web") {
    const apiPublicErr = requireHttpsUrl("API_PUBLIC_URL", env.API_PUBLIC_URL);
    if (apiPublicErr) errors.push(apiPublicErr);
  }

  if (role === "api" || role === "worker") {
    if (!(env.DATABASE_URL ?? "").trim()) {
      errors.push("DATABASE_URL is required in production");
    }
    if (!(env.REDIS_URL ?? "").trim()) {
      errors.push("REDIS_URL is required in production");
    }
  }

  if (errors.length) {
    const block = errors.map((e) => `  - ${e}`).join("\n");
    throw new Error(
      `[zharfa] Refusing to start ${role} in production:\n${block}`,
    );
  }
}
