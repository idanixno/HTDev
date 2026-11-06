import { describe, expect, it } from "vitest";
import {
  assertAllowedAttachment,
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
});
