import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { lookup } from "node:dns/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { apiBaseUrl } from "../../../../../lib/auth-constants";
import type { PublicCourseDetail } from "../../../../../lib/catalog";
import { fetchCurrentUser } from "../../../../../lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_EXT = new Set([".mp4", ".webm", ".ogg", ".ogv"]);
const MAX_REMOTE_BYTES = 150 * 1024 * 1024;

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

type ZipEntry = {
  name: string;
  source: AsyncIterable<Uint8Array>;
};

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) {
    return NextResponse.json({ message: "دوره یافت نشد." }, { status: 404 });
  }

  const user = await fetchCurrentUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `/courses/${slug}`);
    return NextResponse.redirect(login);
  }

  const course = await loadCourse(slug);
  if (!course || course.offerKind !== "FREE") {
    return NextResponse.json(
      { message: "دانلود یکجا فقط برای دوره‌های رایگان است." },
      { status: 403 },
    );
  }

  const entries = await collectEntries(course);
  if (entries.length === 0) {
    return NextResponse.json(
      { message: "ویدیویی برای دانلود این دوره ثبت نشده است." },
      { status: 404 },
    );
  }

  const body = zipStream(entries);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function loadCourse(slug: string): Promise<PublicCourseDetail | null> {
  const res = await fetch(`${apiBaseUrl()}/catalog/courses/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as PublicCourseDetail;
}

async function collectEntries(course: PublicCourseDetail): Promise<ZipEntry[]> {
  const entries: ZipEntry[] = [];
  const used = new Set<string>();
  let index = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const asset = lesson.videoAsset?.trim();
      if (!asset) continue;
      const opened = await openVideo(asset);
      if (!opened) continue;
      index += 1;
      const base = `${String(index).padStart(2, "0")} ${safeName(lesson.title)}`;
      let name = `${base}${opened.ext}`;
      let n = 2;
      while (used.has(name)) {
        name = `${base}-${n}${opened.ext}`;
        n += 1;
      }
      used.add(name);
      entries.push({ name, source: opened.source });
    }
  }
  return entries;
}

async function openVideo(
  asset: string,
): Promise<{ ext: string; source: AsyncIterable<Uint8Array> } | null> {
  if (asset.startsWith("/") && !asset.startsWith("//")) {
    const filePath = localVideoPath(asset);
    if (!filePath) return null;
    const info = await stat(filePath).catch(() => null);
    if (!info?.isFile() || info.size <= 0) return null;
    return {
      ext: path.extname(filePath).toLowerCase(),
      source: fileChunks(filePath),
    };
  }

  let url: URL;
  try {
    url = new URL(asset);
  } catch {
    return null;
  }
  if (!(await isPublicVideoUrl(url))) return null;
  const bytes = await fetchRemote(url);
  if (!bytes) return null;
  const ext = videoExtension(url.pathname) ?? ".mp4";
  return { ext, source: singleChunk(bytes) };
}

async function* singleChunk(bytes: Uint8Array): AsyncGenerator<Uint8Array> {
  yield bytes;
}

function localVideoPath(asset: string): string | null {
  if (asset.includes("..") || asset.includes("\\") || asset.includes("\0")) return null;
  const root = path.resolve(process.cwd(), "public");
  const full = path.resolve(root, `.${asset}`);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) return null;
  const ext = path.extname(full).toLowerCase();
  if (!VIDEO_EXT.has(ext)) return null;
  return full;
}

async function* fileChunks(filePath: string): AsyncGenerator<Uint8Array> {
  const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 });
  for await (const chunk of stream) {
    yield chunk as Uint8Array;
  }
}

async function isPublicVideoUrl(url: URL): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return false;
  }
  if (isIpLiteral(host)) return !isPrivateAddress(host);
  try {
    const resolved = await lookup(host);
    return !isPrivateAddress(resolved.address);
  } catch {
    return false;
  }
}

async function fetchRemote(url: URL): Promise<Uint8Array | null> {
  let current = url;
  for (let hop = 0; hop < 3; hop += 1) {
    if (!(await isPublicVideoUrl(current))) return null;
    const res = await fetch(current, { redirect: "manual", cache: "no-store" });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return null;
      current = new URL(next, current);
      continue;
    }
    if (!res.ok || !res.body) return null;
    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_REMOTE_BYTES) return null;
    const reader = res.body.getReader();
    const parts: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const step = await reader.read();
      if (step.done) break;
      total += step.value.byteLength;
      if (total > MAX_REMOTE_BYTES) {
        await reader.cancel();
        return null;
      }
      parts.push(step.value);
    }
    if (total === 0) return null;
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    return bytes;
  }
  return null;
}

function videoExtension(pathname: string): string | null {
  const ext = path.extname(pathname).toLowerCase();
  return VIDEO_EXT.has(ext) ? ext : null;
}

function isIpLiteral(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function isPrivateAddress(address: string): boolean {
  const ip = address.toLowerCase();
  if (ip === "::1" || ip === "0.0.0.0" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) {
    return true;
  }
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const v4 = mapped?.[1] ?? ip;
  const parts = v4.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return ip.includes(":");
  }
  const a = parts[0] ?? 0;
  const b = parts[1] ?? 0;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function safeName(title: string): string {
  const cleaned = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
  return (cleaned || "lesson").slice(0, 80);
}

function zipStream(entries: ZipEntry[]): ReadableStream<Uint8Array> {
  const node = Readable.from(zipRecords(entries));
  return Readable.toWeb(node) as ReadableStream<Uint8Array>;
}

async function* zipRecords(entries: ZipEntry[]): AsyncGenerator<Uint8Array> {
  const now = new Date();
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const local = localHeader(name, now);
    yield local;
    let crc = 0xffffffff;
    let size = 0;
    for await (const chunk of entry.source) {
      crc = crc32Update(crc, chunk);
      size += chunk.byteLength;
      yield chunk;
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const descriptor = dataDescriptor(crc, size);
    yield descriptor;
    central.push(centralHeader(name, crc, size, offset, now));
    offset += local.byteLength + size + descriptor.byteLength;
  }
  let centralSize = 0;
  for (const header of central) {
    centralSize += header.byteLength;
    yield header;
  }
  yield endRecord(entries.length, centralSize, offset);
}

function crc32Update(state: number, chunk: Uint8Array): number {
  let c = state;
  for (let i = 0; i < chunk.length; i += 1) {
    c = CRC_TABLE[(c ^ chunk[i]!) & 0xff]! ^ (c >>> 8);
  }
  return c >>> 0;
}

function dosStamp(date: Date): { time: number; day: number } {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function localHeader(name: Buffer, date: Date): Uint8Array {
  const { time, day } = dosStamp(date);
  const header = Buffer.alloc(30 + name.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0808, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(time, 10);
  header.writeUInt16LE(day, 12);
  header.writeUInt16LE(name.length, 26);
  name.copy(header, 30);
  return header;
}

function dataDescriptor(crc: number, size: number): Uint8Array {
  const header = Buffer.alloc(16);
  header.writeUInt32LE(0x08074b50, 0);
  header.writeUInt32LE(crc >>> 0, 4);
  header.writeUInt32LE(size, 8);
  header.writeUInt32LE(size, 12);
  return header;
}

function centralHeader(
  name: Buffer,
  crc: number,
  size: number,
  offset: number,
  date: Date,
): Uint8Array {
  const { time, day } = dosStamp(date);
  const header = Buffer.alloc(46 + name.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0808, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(time, 12);
  header.writeUInt16LE(day, 14);
  header.writeUInt32LE(crc >>> 0, 16);
  header.writeUInt32LE(size, 20);
  header.writeUInt32LE(size, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt32LE(offset, 42);
  name.copy(header, 46);
  return header;
}

function endRecord(count: number, centralSize: number, offset: number): Uint8Array {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(count, 8);
  header.writeUInt16LE(count, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(offset, 16);
  return header;
}
