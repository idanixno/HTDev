import { Injectable } from "@nestjs/common";
import { ActivityActorKind, Prisma } from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";

export type AuditWriteInput = {
  actorId?: string | null;
  actorKind?: ActivityActorKind;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditWriteInput) {
    return this.prisma.activityLog.create({
      data: {
        actorKind: input.actorKind ?? ActivityActorKind.OWNER,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async list(query: {
    page?: number;
    pageSize?: number;
    entityType?: string;
    action?: string;
    q?: string;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 30, 100);
    const where: Prisma.ActivityLogWhereInput = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.action) where.action = query.action;
    if (query.q) {
      where.OR = [
        { summary: { contains: query.q, mode: "insensitive" } },
        { action: { contains: query.q, mode: "insensitive" } },
        { entityId: { contains: query.q, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        actorKind: row.actorKind,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        summary: row.summary,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
        actor: row.actor
          ? {
              id: row.actor.id,
              username: row.actor.username,
              displayName: row.actor.displayName,
              role: row.actor.role,
            }
          : null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}
