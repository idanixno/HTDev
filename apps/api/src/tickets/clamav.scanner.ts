import { createConnection, type Socket } from "node:net";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

export type ClamScanResult =
  | { status: "clean" }
  | { status: "infected"; signature: string }
  | { status: "skipped"; reason: string }
  | { status: "unavailable"; reason: string };

/**
 * Optional ClamAV daemon scanner (INSTREAM over TCP or Unix socket).
 *
 * Env:
 * - CLAMAV_ENABLED=true → attempt scan
 * - CLAMAV_REQUIRED=true → fail closed if daemon unreachable (recommended in prod)
 * - CLAMD_HOST (default 127.0.0.1) + CLAMD_PORT (default 3310)
 * - or CLAMD_SOCKET=/var/run/clamav/clamd.ctl
 */
@Injectable()
export class ClamAvScanner {
  private readonly logger = new Logger(ClamAvScanner.name);

  enabled(): boolean {
    return process.env.CLAMAV_ENABLED === "true";
  }

  required(): boolean {
    return process.env.CLAMAV_REQUIRED === "true";
  }

  async scanBuffer(bytes: Buffer): Promise<ClamScanResult> {
    if (!this.enabled()) {
      return { status: "skipped", reason: "CLAMAV_ENABLED not set" };
    }

    try {
      const reply = await this.instream(bytes);
      if (/OK\s*$/i.test(reply) || /: OK/i.test(reply)) {
        return { status: "clean" };
      }
      const found = reply.match(/:\s*(.+)\s+FOUND/i);
      if (found) {
        return { status: "infected", signature: found[1]!.trim() };
      }
      this.logger.warn(`Unexpected clamd reply: ${reply.slice(0, 200)}`);
      return { status: "unavailable", reason: `unexpected reply: ${reply.slice(0, 80)}` };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "clamd error";
      this.logger.warn(`ClamAV unavailable: ${reason}`);
      return { status: "unavailable", reason };
    }
  }

  /**
   * Enforce policy: infected → 400; required+unavailable → 503-style 400.
   */
  async assertClean(bytes: Buffer): Promise<void> {
    const result = await this.scanBuffer(bytes);
    if (result.status === "infected") {
      this.logger.warn(`ClamAV blocked attachment: ${result.signature}`);
      throw new BadRequestException(
        `فایل آلوده شناسایی شد و رد شد (${result.signature}).`,
      );
    }
    if (result.status === "unavailable" && this.required()) {
      throw new BadRequestException(
        "سرویس آنتی‌ویروس در دسترس نیست؛ آپلود موقتاً ممکن نیست.",
      );
    }
  }

  private instream(bytes: Buffer): Promise<string> {
    const chunkSize = 2048;
    return new Promise((resolve, reject) => {
      const socket = this.connect();
      let settled = false;
      let reply = Buffer.alloc(0);
      const timer = setTimeout(() => {
        fail(new Error("clamd timeout"));
      }, Number(process.env.CLAMAV_TIMEOUT_MS ?? 15_000));

      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        reject(err);
      };

      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.end();
        resolve(reply.toString("utf8").trim());
      };

      socket.on("error", (err) => fail(err));
      socket.on("data", (chunk) => {
        reply = Buffer.concat([reply, chunk]);
        if (reply.includes(0x00) || /FOUND|OK|ERROR/i.test(reply.toString("utf8"))) {
          done();
        }
      });
      socket.on("end", done);

      socket.on("connect", () => {
        try {
          socket.write(Buffer.from("zINSTREAM\0"));
          for (let offset = 0; offset < bytes.length; offset += chunkSize) {
            const slice = bytes.subarray(offset, offset + chunkSize);
            const len = Buffer.alloc(4);
            len.writeUInt32BE(slice.length, 0);
            socket.write(len);
            socket.write(slice);
          }
          const zero = Buffer.alloc(4);
          zero.writeUInt32BE(0, 0);
          socket.write(zero);
        } catch (err) {
          fail(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
  }

  private connect(): Socket {
    const sock = process.env.CLAMD_SOCKET?.trim();
    if (sock) {
      return createConnection({ path: sock });
    }
    const host = process.env.CLAMD_HOST?.trim() || "127.0.0.1";
    const port = Number(process.env.CLAMD_PORT ?? 3310);
    return createConnection({ host, port });
  }
}
