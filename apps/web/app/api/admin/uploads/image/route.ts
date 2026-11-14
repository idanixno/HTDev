import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../../lib/csrf";
import { saveUploadedMedia } from "../../../../../lib/media-storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

type Kind = { ext: string; check: (bytes: Buffer) => boolean };

const TYPES: Record<string, Kind> = {
  "image/jpeg": {
    ext: ".jpg",
    check: (bytes) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  "image/png": {
    ext: ".png",
    check: (bytes) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47,
  },
  "image/webp": {
    ext: ".webp",
    check: (bytes) =>
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "image/gif": {
    ext: ".gif",
    check: (bytes) => {
      const head = bytes.subarray(0, 6).toString("ascii");
      return head === "GIF87a" || head === "GIF89a";
    },
  },
};

function kindFor(file: File): Kind | null {
  const typed = TYPES[file.type];
  if (typed) return typed;
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return TYPES["image/jpeg"] ?? null;
  }
  if (name.endsWith(".png")) return TYPES["image/png"] ?? null;
  if (name.endsWith(".webp")) return TYPES["image/webp"] ?? null;
  if (name.endsWith(".gif")) return TYPES["image/gif"] ?? null;
  return null;
}

export async function POST(request: Request) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: "یافت نشد." }, { status: 404 });
  }

  const me = await fetch(`${apiBaseUrl()}/identity/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-token": token,
    },
    cache: "no-store",
  });
  if (!me.ok) {
    return NextResponse.json({ message: "یافت نشد." }, { status: 404 });
  }
  const profile = (await me.json()) as { user?: { role?: string } };
  if (profile.user?.role !== "OWNER") {
    return NextResponse.json({ message: "یافت نشد." }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "فایل تصویر انتخاب نشده." }, { status: 400 });
  }
  const kind = kindFor(file);
  if (!kind) {
    return NextResponse.json(
      { message: "فقط jpg، png، webp یا gif پذیرفته می‌شود." },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "حجم تصویر باید بین یک بایت و ۸ مگابایت باشد." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!kind.check(bytes)) {
    return NextResponse.json(
      { message: "محتوای فایل با نوع تصویر هم‌خوان نیست." },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}${kind.ext}`;
  await saveUploadedMedia("covers", filename, bytes);
  return NextResponse.json({ url: `/media/covers/${filename}` });
}
