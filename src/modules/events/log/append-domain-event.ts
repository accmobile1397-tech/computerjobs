import { Prisma } from "@prisma/client";
import type { DomainEvent } from "@/modules/events/bus/types";
import { prisma } from "@/modules/shared/prisma/client";
import { logger } from "@/modules/shared/logger";

export type AppendDomainEventLogDeps = {
  db?: {
    domainEventLog: {
      create: (args: {
        data: {
          eventId: string;
          name: string;
          version: number;
          occurredAt: Date;
          aggregateType: string;
          aggregateId: string;
          correlationId: string | null;
          payload: Prisma.InputJsonValue;
        };
      }) => Promise<unknown>;
    };
  };
};

/**
 * Append-only insert into DomainEventLog (C-010-5).
 * Duplicate eventId is ignored (idempotent). Never updates or deletes.
 */
export async function appendDomainEventLog(
  event: DomainEvent,
  deps: AppendDomainEventLogDeps = {},
): Promise<void> {
  const db = deps.db ?? prisma;

  try {
    await db.domainEventLog.create({
      data: {
        eventId: event.eventId,
        name: event.name,
        version: event.version,
        occurredAt: new Date(event.occurredAt),
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        correlationId: event.correlationId ?? null,
        payload: event.payload as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      logger.debug(
        { eventId: event.eventId, name: event.name },
        "domain event log already exists (skip duplicate)",
      );
      return;
    }
    throw error;
  }
}
