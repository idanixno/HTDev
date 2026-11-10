import { BadRequestException } from "@nestjs/common";

/**
 * Content heuristics for ticket attachments — always on (no ClamAV required).
 * Catches common XSS polyglots and executable payloads mislabeled as images/text/PDF.
 */
export function assertAttachmentContentSafe(
  contentType: string,
  bytes: Buffer,
): void {
  const type = contentType.trim().toLowerCase().split(";")[0]!;
  const sample = bytes.subarray(0, Math.min(bytes.length, 64 * 1024));

  // Universal: EICAR test string (standard AV probe)
  const ascii = sample.toString("latin1");
  if (ascii.includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE")) {
    throw new BadRequestException("فایل مشکوک به بدافزار رد شد.");
  }

  // Universal: HTML/script payloads that enable stored XSS if opened inline
  if (looksLikeActiveHtml(sample)) {
    throw new BadRequestException(
      "محتوای HTML/اسکریپت در پیوست مجاز نیست (جلوگیری از XSS).",
    );
  }

  switch (type) {
    case "text/plain":
      assertSafePlainText(sample);
      break;
    case "image/gif":
    case "image/png":
    case "image/jpeg":
    case "image/webp":
      assertSafeImage(sample);
      break;
    case "application/pdf":
      assertSafePdf(sample);
      break;
    default:
      break;
  }
}

function looksLikeActiveHtml(bytes: Buffer): boolean {
  const text = bytes
    .toString("utf8")
    .replace(/\0/g, "")
    .slice(0, 32 * 1024)
    .toLowerCase();
  return (
    /<\s*script\b/.test(text) ||
    /<\s*iframe\b/.test(text) ||
    /<\s*object\b/.test(text) ||
    /<\s*embed\b/.test(text) ||
    /<\s*svg\b[^>]*\bon\w+\s*=/.test(text) ||
    /javascript\s*:/.test(text) ||
    /<\s*meta\b[^>]+http-equiv\s*=\s*['"]?refresh/.test(text)
  );
}

function assertSafePlainText(sample: Buffer): void {
  const text = sample.toString("utf8").toLowerCase();
  if (
    /<\s*html\b/.test(text) ||
    /<\s*body\b/.test(text) ||
    /<\s*!doctype\b/.test(text) ||
    /<\s*svg\b/.test(text)
  ) {
    throw new BadRequestException(
      "متن پیوست نباید شامل HTML باشد (جلوگیری از XSS).",
    );
  }
}

function assertSafeImage(sample: Buffer): void {
  // Polyglot: HTML after/inside image containers
  const latin = sample.toString("latin1").toLowerCase();
  if (
    latin.includes("<script") ||
    latin.includes("<iframe") ||
    latin.includes("javascript:") ||
    /<\s*svg\b/.test(latin)
  ) {
    throw new BadRequestException(
      "تصویر حاوی نشانه‌های XSS/HTML رد شد.",
    );
  }
}

function assertSafePdf(sample: Buffer): void {
  const latin = sample.toString("latin1");
  // Active content / XSS vectors in PDF
  if (
    /\/JavaScript\b/i.test(latin) ||
    /\/JS\b/.test(latin) ||
    /\/OpenAction\b/i.test(latin) ||
    /\/AA\b/.test(latin) ||
    /\/Launch\b/i.test(latin) ||
    /\/EmbeddedFile\b/i.test(latin)
  ) {
    throw new BadRequestException(
      "PDF حاوی اسکریپت یا اکشن فعال رد شد.",
    );
  }
}
