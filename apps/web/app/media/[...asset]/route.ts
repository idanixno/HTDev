import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolveUploadedMediaPath } from "../../../lib/media-storage";

export const runtime = "nodejs";

function streamFile(
  filePath: string,
  range?: { start: number; end: number },
): ReadableStream<Uint8Array> {
  const file = createReadStream(filePath, range);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      file.on("data", (chunk: string | Buffer) => {
        file.pause();
        controller.enqueue(
          new Uint8Array(typeof chunk === "string" ? Buffer.from(chunk) : chunk),
        );
      });
      file.once("end", () => controller.close());
      file.once("error", (error) => controller.error(error));
    },
    pull() {
      file.resume();
    },
    cancel() {
      file.destroy();
    },
  });
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTDIR")
  );
}

function parseRange(value: string, size: number): [number, number] | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    return [Math.max(0, size - suffixLength), size - 1];
  }

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return null;
  }
  return [start, Math.min(end, size - 1)];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string[] }> },
) {
  const { asset } = await params;
  const media = resolveUploadedMediaPath(asset);
  if (!media) return new Response(null, { status: 404 });

  let file;
  try {
    file = await stat(media.filePath);
  } catch (error) {
    if (isMissingFile(error)) return new Response(null, { status: 404 });
    throw error;
  }
  if (!file.isFile()) return new Response(null, { status: 404 });

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": media.contentType,
    "X-Content-Type-Options": "nosniff",
  });
  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) {
    headers.set("Content-Length", String(file.size));
    return new Response(streamFile(media.filePath), { headers });
  }

  const range = parseRange(rangeHeader, file.size);
  if (!range) {
    headers.set("Content-Range", `bytes */${file.size}`);
    return new Response(null, { status: 416, headers });
  }

  const [start, end] = range;
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Content-Range", `bytes ${start}-${end}/${file.size}`);
  return new Response(streamFile(media.filePath, { start, end }), {
    status: 206,
    headers,
  });
}
