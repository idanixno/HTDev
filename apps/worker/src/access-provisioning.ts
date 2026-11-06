/**
 * BullMQ AccessProvisioning processor.
 * Mirrors apps/api SpotPlayerService.processProvisioning rules:
 * - Never invent license keys
 * - SUCCEEDED only when SpotPlayer returns _id + key
 * - Idempotent skip when already SUCCEEDED with key
 * Official API: https://spotplayer.ir/help/api
 */
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import {
  GatewayCredentialsStatus,
  PrismaClient,
  SpotPlayerLicenseStatus,
} from "@zharfa/database";

const DEFAULT_ENDPOINT = "https://panel.spotplayer.ir/license/edit/";

function deriveKey(): Buffer {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.SPOTPLAYER_CRYPTO_SECRET?.trim() ||
    "local-dev-only-spotplayer-crypto";
  return createHash("sha256").update(secret).digest();
}

function decryptSecret(payload: string): string | null {
  try {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    if (!ivHex || !tagHex || !dataHex) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(),
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}

function resolveApiKey(encrypted: string | null | undefined): string | null {
  const fromEnv = process.env.SPOTPLAYER_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (encrypted) return decryptSecret(encrypted);
  return null;
}

export type AccessProvisioningJobData = {
  licenseId: string;
  idempotencyKey: string;
};

export async function processAccessProvisioning(
  prisma: PrismaClient,
  data: AccessProvisioningJobData,
): Promise<{ outcome: string; reason?: string }> {
  const license = await prisma.spotPlayerLicense.findUnique({
    where: { id: data.licenseId },
    include: { user: true, course: true },
  });
  if (!license) {
    throw new Error(`License ${data.licenseId} not found`);
  }

  if (
    license.status === SpotPlayerLicenseStatus.SUCCEEDED &&
    license.licenseKey?.trim()
  ) {
    return { outcome: "already_succeeded" };
  }

  let setting = await prisma.spotPlayerSetting.findUnique({
    where: { id: "default" },
  });
  if (!setting) {
    setting = await prisma.spotPlayerSetting.create({
      data: {
        id: "default",
        technicalEnabled: true,
        testMode: true,
        credentialsStatus: process.env.SPOTPLAYER_API_KEY?.trim()
          ? GatewayCredentialsStatus.PRESENT
          : GatewayCredentialsStatus.MISSING,
        licenseEndpoint: DEFAULT_ENDPOINT,
      },
    });
  }

  await prisma.spotPlayerLicense.update({
    where: { id: license.id },
    data: {
      status: SpotPlayerLicenseStatus.IN_PROGRESS,
      attemptCount: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });

  const fail = async (reason: string, raw?: unknown) => {
    await prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: {
        status: SpotPlayerLicenseStatus.FAILED,
        lastError: reason,
        lastAttemptAt: new Date(),
        ...(raw !== undefined ? { providerPayload: raw as object } : {}),
      },
    });
    return { outcome: "failed", reason };
  };

  if (!setting.technicalEnabled) {
    return fail("SpotPlayer technicalEnabled=false (DISABLED).");
  }

  const apiKey = resolveApiKey(setting.apiKeyEncrypted);
  if (!apiKey) {
    return fail(
      "SpotPlayer credentials missing (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED).",
    );
  }

  const mapping = await prisma.spotPlayerCourseMapping.findUnique({
    where: { courseId: license.courseId },
  });
  if (!mapping?.enabled || !mapping.spotPlayerCourseId.trim()) {
    return fail("Course has no enabled SpotPlayer course mapping.");
  }

  const watermark =
    license.user.phone?.trim() ||
    license.user.email?.trim() ||
    license.user.username;

  if (process.env.SPOTPLAYER_MOCK_HOOKS === "true") {
    if (process.env.SPOTPLAYER_MOCK_FAIL === "true") {
      return fail("Mock SpotPlayer forced failure.", { mock: true });
    }
    const id = `mock_lic_worker_${Date.now()}`;
    await prisma.spotPlayerLicense.update({
      where: { id: license.id },
      data: {
        status: SpotPlayerLicenseStatus.SUCCEEDED,
        spotPlayerLicenseId: id,
        licenseKey: `mock-key-${id}`,
        licenseUrl: `/${id}/mock/`,
        provisionedAt: new Date(),
        lastError: null,
        providerPayload: { _id: id, key: `mock-key-${id}`, mock: true },
      },
    });
    return { outcome: "succeeded" };
  }

  const endpoint =
    process.env.SPOTPLAYER_LICENSE_ENDPOINT?.trim() ||
    setting.licenseEndpoint?.trim() ||
    DEFAULT_ENDPOINT;

  const body = {
    test: setting.testMode,
    course: [mapping.spotPlayerCourseId.trim()],
    name: license.user.displayName || license.user.username,
    watermark: { texts: [{ text: watermark }] },
    payload: license.orderId ?? license.idempotencyKey,
  };

  let raw: unknown;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        $API: apiKey,
        $LEVEL: "-1",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      raw = text;
    }
    if (!res.ok) {
      const msg =
        typeof raw === "object" &&
        raw &&
        "ex" in raw &&
        typeof (raw as { ex?: { msg?: string } }).ex?.msg === "string"
          ? (raw as { ex: { msg: string } }).ex.msg
          : `SpotPlayer HTTP ${res.status}`;
      return fail(msg, raw);
    }
  } catch (err) {
    return fail(err instanceof Error ? err.message : "network error");
  }

  if (
    typeof raw !== "object" ||
    raw === null ||
    !("_id" in raw) ||
    !("key" in raw)
  ) {
    return fail(
      "SpotPlayer response missing _id/key — refusing to invent a license.",
      raw,
    );
  }

  const licenseId = String((raw as { _id: unknown })._id ?? "");
  const licenseKey = String((raw as { key: unknown }).key ?? "");
  const licenseUrl = String((raw as { url?: unknown }).url ?? "");
  if (!licenseId || !licenseKey) {
    return fail(
      "SpotPlayer returned empty _id/key — refusing to invent a license.",
      raw,
    );
  }

  await prisma.spotPlayerLicense.update({
    where: { id: license.id },
    data: {
      status: SpotPlayerLicenseStatus.SUCCEEDED,
      spotPlayerLicenseId: licenseId,
      licenseKey,
      licenseUrl: licenseUrl || null,
      provisionedAt: new Date(),
      lastError: null,
      providerPayload: raw as object,
    },
  });

  return { outcome: "succeeded" };
}

/** Exported for completeness; encryption lives primarily in API admin path. */
export function encryptSecretForTests(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}
