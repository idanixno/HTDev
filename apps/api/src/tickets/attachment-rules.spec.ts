import { describe, expect, it } from "vitest";
import {
  assertAllowedAttachment,
  assertAttachmentMagicBytes,
  buildAttachmentStorageKey,
  sanitizeFileName,
} from "./attachment-rules";

describe("ticket attachment rules", () => {
  it("sanitizes path traversal from file names", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("a\\b\\shot.png")).toBe("shot.png");
  });

  it("rejects disallowed MIME types", () => {
    expect(() =>
      assertAllowedAttachment({
        contentType: "application/x-msdownload",
        sizeBytes: 100,
        fileName: "x.exe",
      }),
    ).toThrow(/نوع فایل/);
  });

  it("accepts png under size limit", () => {
    const meta = assertAllowedAttachment({
      contentType: "image/png",
      sizeBytes: 1024,
      fileName: "shot.png",
    });
    expect(meta.ext).toBe("png");
    expect(meta.safeFileName).toBe("shot.png");
  });

  it("builds opaque keys under tickets/ prefix", () => {
    const key = buildAttachmentStorageKey("clxyz123", "pdf");
    expect(key.startsWith("tickets/clxyz123/")).toBe(true);
    expect(key.endsWith(".pdf")).toBe(true);
    expect(key.includes("..")).toBe(false);
  });

  it("accepts PNG magic bytes", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    expect(() => assertAttachmentMagicBytes("image/png", png)).not.toThrow();
  });

  it("rejects JPEG declared as PNG", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(() => assertAttachmentMagicBytes("image/png", jpeg)).toThrow(
      /هم‌خوانی/,
    );
  });

  it("rejects MZ executable disguised as text/plain", () => {
    const pe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]);
    expect(() => assertAttachmentMagicBytes("text/plain", pe)).toThrow(
      /هم‌خوانی/,
    );
  });
});
