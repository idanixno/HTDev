import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM helpers for optional admin-stored SpotPlayer API keys.
 * Prefers env SPOTPLAYER_API_KEY at runtime; DB ciphertext is an override store.
 * Never log plaintext keys.
 */

function deriveKey(): Buffer {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.SPOTPLAYER_CRYPTO_SECRET?.trim() ||
    "local-dev-only-spotplayer-crypto";
  return createHash("sha256").update(secret).digest();
}

/** Encrypts plaintext → `iv:tag:ciphertext` (hex segments). */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(payload: string): string | null {
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

export function maskSecret(secret: string | null | undefined): string | null {
  if (!secret) return null;
  const trimmed = secret.trim();
  if (!trimmed) return null;
  if (trimmed.length <= 4) return "••••";
  return `••••••••${trimmed.slice(-4)}`;
}

export function last4(secret: string): string {
  const t = secret.trim();
  return t.length <= 4 ? t : t.slice(-4);
}
