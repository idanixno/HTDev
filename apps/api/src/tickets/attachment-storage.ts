import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Private local attachment store for tickets.
 *
 * Security rules:
 * - Bytes never served from a public static path
 * - Keys are opaque (`tickets/{id}/{uuid}.ext`) — reject `..` / absolute paths
 * - Root directory is outside web public assets (TICKET_ATTACHMENT_ROOT)
 * - Download only through authenticated Nest endpoints
 *
 * MinIO/S3 can replace this adapter later using the same key contract.
 */
@Injectable()
export class TicketAttachmentStorage {
  private readonly logger = new Logger(TicketAttachmentStorage.name);

  private root(): string {
    return (
      process.env.TICKET_ATTACHMENT_ROOT?.trim() ||
      path.join(process.cwd(), ".data", "ticket-attachments")
    );
  }

  private resolveSafe(storageKey: string): string {
    if (
      !storageKey ||
      storageKey.includes("..") ||
      storageKey.startsWith("/") ||
      storageKey.includes("\\") ||
      !storageKey.startsWith("tickets/")
    ) {
      throw new NotFoundException("پیوست یافت نشد.");
    }
    const root = path.resolve(this.root());
    const full = path.resolve(root, storageKey);
    if (!full.startsWith(root + path.sep) && full !== root) {
      throw new NotFoundException("پیوست یافت نشد.");
    }
    return full;
  }

  async put(storageKey: string, bytes: Buffer): Promise<void> {
    const full = this.resolveSafe(storageKey);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, bytes, { flag: "wx" });
    this.logger.debug(`stored attachment ${storageKey} (${bytes.length} B)`);
  }

  async get(storageKey: string): Promise<Buffer> {
    const full = this.resolveSafe(storageKey);
    try {
      return await readFile(full);
    } catch {
      throw new NotFoundException("پیوست یافت نشد.");
    }
  }
}
