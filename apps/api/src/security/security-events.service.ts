import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { SecurityEventType, type Prisma } from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";

const SUSPICIOUS_PATHS = [
  /^\/\.env/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/phpmyadmin/i,
  /^\/\.git/i,
  /^\/backup/i,
  /^\/config\.json$/i,
  /^\/actuator/i,
  /^\/server-status/i,
  /^\/vendor\//i,
  /^\/debug\//i,
];

@Injectable()
export class SecurityEventsService {
  constructor(private readonly prisma: PrismaService) {}

  hashIp(ip: string | null | undefined): string | null {
    if (!ip?.trim()) return null;
    return createHash("sha256").update(ip.trim()).digest("hex");
  }

  isSuspiciousPath(pathname: string): boolean {
    const path = pathname.split("?")[0] ?? pathname;
    return SUSPICIOUS_PATHS.some((re) => re.test(path));
  }

  async record(input: {
    type: SecurityEventType;
    path: string;
    method?: string;
    ip?: string | null;
    userAgent?: string | null;
    meta?: Record<string, unknown>;
  }) {
    return this.prisma.securityEvent.create({
      data: {
        type: input.type,
        path: input.path.slice(0, 500),
        method: input.method?.slice(0, 16) ?? null,
        ipHash: this.hashIp(input.ip),
        userAgent: input.userAgent?.slice(0, 240) ?? null,
        metaJson: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async recent(limit = 50) {
    const rows = await this.prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(100, Math.max(1, limit)),
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      path: r.path,
      method: r.method,
      createdAt: r.createdAt.toISOString(),
      userAgent: r.userAgent,
    }));
  }

  async summary(days = 7) {
    const since = new Date(Date.now() - days * 86400000);
    const groups = await this.prisma.securityEvent.groupBy({
      by: ["type"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });
    return {
      days,
      counts: Object.fromEntries(
        groups.map((g) => [g.type, g._count._all]),
      ) as Record<string, number>,
    };
  }
}
