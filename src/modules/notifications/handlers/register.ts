import type { EventBus } from "@/modules/events/bus";
import { eventBus as defaultEventBus } from "@/modules/events/bus";
import { EVENTS } from "@/modules/events/catalog/events";
import { EVENT_MAPPING_V1 } from "@/modules/notifications/handlers/mapping.v1";
import {
  handleDomainEvent,
  type HandleDomainEventDeps,
} from "@/modules/notifications/handlers/handle-domain-event";

const MVP_EVENT_NAMES = Object.keys(EVENT_MAPPING_V1.mappings);

/**
 * Registers Phase 9 MVP notification handlers on the EventBus.
 * Handlers call NotificationGateway only (C-009-5).
 */
export function registerNotificationHandlers(
  bus: EventBus = defaultEventBus,
  deps: HandleDomainEventDeps = {}
): void {
  for (const eventName of MVP_EVENT_NAMES) {
    bus.registerHandler(
      eventName,
      async ({ event, logger }) => {
        try {
          await handleDomainEvent(event, deps);
        } catch (error) {
          logger.error(
            { err: error, eventId: event.eventId, name: event.name },
            "notification handler failed"
          );
        }
      },
      { idempotent: true }
    );
  }
}

/** Documented MVP event set for tests / status. */
export const NOTIFICATION_HANDLER_EVENTS = [
  EVENTS.JOB_APPLICATION_SUBMITTED,
  EVENTS.PAYMENT_SUCCEEDED,
  EVENTS.SUBSCRIPTION_ACTIVATED,
  EVENTS.CONTACT_UNLOCKED,
  EVENTS.AI_REQUEST_COMPLETED,
  EVENTS.AI_REQUEST_FAILED,
] as const;
