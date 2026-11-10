/**
 * Signed owner marker cookie so /admin middleware can skip a network round-trip
 * on every navigation. Bound to the session token; cleared on logout.
 */

export const OWNER_MARKER_COOKIE = "zharfa_ao";

function secret(): string | null {
  return process.env.SESSION_SECRET?.trim() || null;
}

async function hmacHex(message: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function tokenFingerprint(sessionToken: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(sessionToken));
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createOwnerMarker(
  sessionToken: string,
): Promise<string | null> {
  const key = secret();
  if (!key || !sessionToken) return null;
  const fp = await tokenFingerprint(sessionToken);
  const sig = await hmacHex(`OWNER:${fp}`, key);
  return `${fp}.${sig}`;
}

export async function verifyOwnerMarker(
  sessionToken: string,
  marker: string | undefined | null,
): Promise<boolean> {
  const key = secret();
  if (!key || !sessionToken || !marker) return false;
  const [fp, sig] = marker.split(".");
  if (!fp || !sig || fp.length !== 32 || sig.length !== 64) return false;
  const expectedFp = await tokenFingerprint(sessionToken);
  if (fp !== expectedFp) return false;
  const expectedSig = await hmacHex(`OWNER:${fp}`, key);
  if (expectedSig.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i += 1) {
    mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0;
}
