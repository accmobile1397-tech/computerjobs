import type { PrismaClient } from "@prisma/client";
import type { DomainEvent } from "@/modules/events/bus/types";
import {
  dispatchNotification,
  type DispatchResult,
  type NotificationGatewayDeps,
} from "@/modules/notifications/gateway";
import {
  getMappingEntries,
  type EventMappingEntry,
} from "@/modules/notifications/handlers/mapping.v1";
import { resolveRecipients } from "@/modules/notifications/handlers/resolve-recipients";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export type HandleDomainEventDeps = NotificationGatewayDeps & {
  prisma?: PrismaClient;
};

function payloadAsVariables(
  payload: Record<string, unknown>
): Record<string, string | number> {
  const variables: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number") {
      variables[key] = value;
    }
  }
  return variables;
}

/**
 * C-009-5 — maps domain event → NotificationGateway only.
 * Never imports Email/Sms/InApp providers.
 */
export async function handleDomainEvent(
  event: DomainEvent,
  deps: HandleDomainEventDeps = {}
): Promise<DispatchResult[]> {
  const db = deps.prisma ?? defaultPrisma;
  const entries = getMappingEntries(event.name);
  if (entries.length === 0) return [];

  const results: DispatchResult[] = [];
  const variables = payloadAsVariables(event.payload);

  for (const entry of entries) {
    await dispatchMappedEntry(event, entry, variables, db, deps, results);
  }

  return results;
}

async function dispatchMappedEntry(
  event: DomainEvent,
  entry: EventMappingEntry,
  variables: Record<string, string | number>,
  db: PrismaClient,
  deps: HandleDomainEventDeps,
  results: DispatchResult[]
): Promise<void> {
  const recipients = await resolveRecipients(event, entry.recipients, db);

  for (const recipient of recipients) {
    for (const channel of entry.channels) {
      const result = await dispatchNotification(
        {
          templateKey: entry.templateKey,
          channel,
          recipientType: recipient.recipientType,
          recipientId: recipient.recipientId,
          variables,
          eventId: event.eventId,
          eventName: event.name,
          correlationId: event.correlationId ?? event.eventId,
        },
        { ...deps, prisma: db }
      );
      results.push(result);
    }
  }
}
