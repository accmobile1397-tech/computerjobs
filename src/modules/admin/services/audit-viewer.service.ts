import type { AuditAction, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";
import type { AdminListResult } from "@/modules/admin/types";
import type { ListAuditQuery } from "@/modules/admin/validators/audit-api.schema";

export type AuditLogItem = {
  id: string;
  userId: string | null;
  action: AuditAction;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
};

/**
 * Read-only AuditLog viewer (P10-005).
 * Pagination is mandatory — never returns an unbounded dump.
 */
export async function listAuditLogs(
  query: ListAuditQuery,
  db: PrismaClient = defaultPrisma,
): Promise<AdminListResult<AuditLogItem>> {
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Prisma.AuditLogWhereInput = {};
  if (query.action) {
    where.action = query.action;
  }
  if (query.userId) {
    where.userId = query.userId;
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true,
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    items: rows,
    total,
    page,
    pageSize,
  };
}
