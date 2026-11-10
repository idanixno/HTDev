import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiBaseUrl, SESSION_COOKIE_NAME } from "../../../../../lib/auth-constants";
import { assertSameOrigin } from "../../../../../lib/csrf";

export const runtime = "nodejs";

const MAX_BYTES = 150 * 1024 * 1024;

function kindFor(file: File) {
  const typed = TYPES[file.type];
  if (typed) return typed;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return TYPES["video/mp4"];
  if (name.endsWith(".webm")) return TYPES["video/webm"];
  if (name.endsWith(".ogg") || name.endsWith(".ogv")) return TYPES["video/ogg"];
  return null;
}

const TYPES: Record<string, { ext: string; check: (bytes: Buffer) => boolean }> = {
  "video/mp4": {
    ext: ".mp4",
    check: (bytes) => bytes.subarray(0, 32).includes(Buffer.from("ftyp")),
  },
  "video/webm": {
    ext: ".webm",
    check: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3,
  },
  "video/ogg": {
    ext: ".ogg",
    check: (bytes) => bytes.subarray(0, 4).toString("ascii") === "OggS",
  },
};

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
    return NextResponse.json({ message: "فایل ویدیو انتخاب نشده." }, { status: 400 });
  }
  const kind = kindFor(file);
  if (!kind) {
    return NextResponse.json(
      { message: "فقط فایل mp4، webm یا ogg پذیرفته می‌شود." },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "حجم ویدیو باید بین یک بایت و ۱۵۰ مگابایت باشد." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!kind.check(bytes)) {
    return NextResponse.json({ message: "محتوای فایل با نوع ویدیو هم‌خوان نیست." }, { status: 400 });
  }

  const filename = `${randomUUID()}${kind.ext}`;
  const dir = path.join(process.cwd(), "public", "media", "lessons");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return NextResponse.json({ url: `/media/lessons/${filename}` });
}
