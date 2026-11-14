import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function mediaUploadDirectory(): string {
  const configured = process.env.MEDIA_UPLOAD_DIR?.trim();
  return configured || path.join(process.cwd(), "public", "media");
}

export async function saveUploadedMedia(
  category: "covers" | "lessons",
  filename: string,
  bytes: Buffer,
): Promise<void> {
  const destination = path.join(mediaUploadDirectory(), category, filename);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes, { flag: "wx" });
}

export function resolveUploadedMediaPath(segments: string[]): {
  filePath: string;
  contentType: string;
} | null {
  if (segments.length !== 2) return null;

  const category = segments[0];
  const filename = segments[1];
  if (!category || !filename) return null;
  if (category !== "covers" && category !== "lessons") return null;
  if (
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\.(?:jpg|png|webp|gif|mp4|webm|ogg)$/.test(
      filename,
    )
  ) {
    return null;
  }

  const contentTypeByExtension: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
  };
  const extension = path.extname(filename);
  const contentType = contentTypeByExtension[extension];
  if (!contentType) return null;

  return {
    filePath: path.join(mediaUploadDirectory(), category, filename),
    contentType,
  };
}
