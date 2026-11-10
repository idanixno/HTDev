import { describe, expect, it } from "vitest";
import { assertAttachmentContentSafe } from "./attachment-scan";

describe("attachment content scan (XSS / malware heuristics)", () => {
  it("rejects EICAR", () => {
    const eicar = Buffer.from(
      "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
    );
    expect(() => assertAttachmentContentSafe("text/plain", eicar)).toThrow(
      /بدافزار/,
    );
  });

  it("rejects HTML script in text/plain", () => {
    const html = Buffer.from('<script>alert(1)</script>\nhello');
    expect(() => assertAttachmentContentSafe("text/plain", html)).toThrow(/XSS/);
  });

  it("rejects script polyglot in PNG-declared buffer", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...Buffer.from('<script>alert(1)</script>'),
    ]);
    expect(() => assertAttachmentContentSafe("image/png", png)).toThrow(/XSS/);
  });

  it("rejects PDF with /JavaScript", () => {
    const pdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /JavaScript 2 0 R >>\nendobj\n");
    expect(() => assertAttachmentContentSafe("application/pdf", pdf)).toThrow(
      /PDF/,
    );
  });

  it("accepts clean PNG header sample", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
    ]);
    expect(() => assertAttachmentContentSafe("image/png", png)).not.toThrow();
  });

  it("accepts plain text without markup", () => {
    expect(() =>
      assertAttachmentContentSafe("text/plain", Buffer.from("سلام، مشکل خرید دارم.")),
    ).not.toThrow();
  });
});
