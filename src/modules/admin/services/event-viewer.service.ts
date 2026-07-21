import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";
import type { AdminListResult } from "@/modules/admin/types";
import type { ListEventsQuery } from "@/modules/admin/validators/platform-api.schema";

export type DomainEventLogItem = {
  id: string;
  eventId: string;
  name: string;
  version: number;
  occurredAt: Date;
  aggregateType: string;
  aggregateId: string;
  correlationId: string | null;
  payload: Prisma.JsonValue;
  createdAt: Date;
};

/**
 * Read-only DomainEventLog viewer (P10-006 · C-010-5 append-only source).
 * Pagination mandatory — no update/delete.
 */
export async function listDomainEvents(
  query: ListEventsQuery,
  db: PrismaClient = defaultPrisma,
): Promise<AdminListResult<DomainEventLogItem>> {
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Prisma.DomainEventLogWhereInput = {};
  if (query.eventType) {
    where.name = query.eventType;
  }
  if (query.from || query.to) {
    where.occurredAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    db.domainEventLog.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        eventId: true,
        name: true,
        version: true,
        occurredAt: true,
        aggregateType: true,
        aggregateId: true,
        correlationId: true,
        payload: true,
        createdAt: true,
      },
    }),
    db.domainEventLog.count({ where }),
  ]);

  return {
    items: rows,
    total,
    page,
    pageSize,
  };
}
