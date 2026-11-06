import { createHash, randomUUID } from "node:crypto";
import { BadRequestException } from "@nestjs/common";

/** Max attachment size (5 MiB). */
export const TICKET_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

/** Allowlisted MIME types for ticket attachments. */
export const TICKET_ATTACHMENT_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

export function assertAllowedAttachment(input: {
  contentType: string;
  sizeBytes: number;
  fileName: string;
}): { contentType: string; safeFileName: string; ext: string } {
  const contentType = input.contentType.trim().toLowerCase().split(";")[0]!;
  if (!TICKET_ATTACHMENT_ALLOWED_TYPES.has(contentType)) {
    throw new BadRequestException(
      "نوع فایل مجاز نیست. فقط تصویر، PDF یا متن ساده.",
    );
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > TICKET_ATTACHMENT_MAX_BYTES) {
    throw new BadRequestException(
      `حجم فایل باید بین ۱ بایت و ${TICKET_ATTACHMENT_MAX_BYTES} بایت باشد.`,
    );
  }
  const safeFileName = sanitizeFileName(input.fileName);
  if (!safeFileName) {
    throw new BadRequestException("نام فایل نامعتبر است.");
  }
  return {
    contentType,
    safeFileName,
    ext: EXT_BY_TYPE[contentType] ?? "bin",
  };
}

/** Strip path segments and control chars; keep a short display name. */
export function sanitizeFileName(raw: string): string {
  const base = raw
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim();
  if (!base) return "";
  return base.slice(0, 120);
}

/**
 * Opaque storage key — never derived from user-supplied path segments alone.
 * Pattern: tickets/{ticketId}/{uuid}.{ext}
 */
export function buildAttachmentStorageKey(
  ticketId: string,
  ext: string,
): string {
  const safeTicket = ticketId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeTicket) {
    throw new BadRequestException("شناسه تیکت نامعتبر است.");
  }
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  return `tickets/${safeTicket}/${randomUUID()}.${safeExt}`;
}

export function sha256Hex(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export function decodeBase64Payload(dataBase64: string): Buffer {
  const cleaned = dataBase64.replace(/^data:[^;]+;base64,/, "").trim();
  if (!cleaned || cleaned.length > TICKET_ATTACHMENT_MAX_BYTES * 2) {
    throw new BadRequestException("محتوای پیوست نامعتبر است.");
  }
  try {
    return Buffer.from(cleaned, "base64");
  } catch {
    throw new BadRequestException("رمزگشایی پیوست ناموفق بود.");
  }
}

/**
 * Verify declared MIME against file magic bytes (defense against renamed malware).
 * text/plain: reject NUL bytes and PE/ELF/Mach-O headers.
 */
export function assertAttachmentMagicBytes(
  contentType: string,
  bytes: Buffer,
): void {
  const type = contentType.trim().toLowerCase().split(";")[0]!;
  const ok = matchesMagic(type, bytes);
  if (!ok) {
    throw new BadRequestException(
      "محتوای فایل با نوع اعلام‌شده هم‌خوانی ندارد.",
    );
  }
}

function matchesMagic(contentType: string, bytes: Buffer): boolean {
  if (bytes.length === 0) return false;

  switch (contentType) {
    case "image/png":
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );
    case "image/jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/gif":
      return (
        bytes.length >= 6 &&
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
      );
    case "image/webp":
      return (
        bytes.length >= 12 &&
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    case "application/pdf":
      return (
        bytes.length >= 5 &&
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2d
      );
    case "text/plain":
      if (bytes.includes(0x00)) return false;
      // Reject common executable headers disguised as text.
      if (bytes[0] === 0x4d && bytes[1] === 0x5a) return false; // PE/MZ
      if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46)
        return false; // ELF
      return true;
    default:
      return false;
  }
}
