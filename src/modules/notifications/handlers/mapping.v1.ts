import type { NotificationChannel } from "@prisma/client";
import { EVENTS } from "@/modules/events/catalog/events";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";

export type RecipientRule =
  | "job.company.owner"
  | "job.company.members"
  | "payment.owner"
  | "subscription.owner"
  | "contact.target_user"
  | "ai.request.owner";

export type EventMappingEntry = {
  templateKey: string;
  channels: NotificationChannel[];
  recipients: RecipientRule[];
};

export type EventMappingConfig = {
  version: number;
  mappings: Record<string, EventMappingEntry[]>;
};

/** C-009-4 — file SoT for Phase 9 MVP (`{ version, mappings }`). */
export const EVENT_MAPPING_V1: EventMappingConfig = {
  version: 1,
  mappings: {
    [EVENTS.JOB_APPLICATION_SUBMITTED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.JOB_APPLICATION_RECEIVED,
        channels: ["EMAIL", "IN_APP"],
        recipients: ["job.company.members", "job.company.owner"],
      },
    ],
    [EVENTS.PAYMENT_SUCCEEDED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        channels: ["EMAIL"],
        recipients: ["payment.owner"],
      },
    ],
    [EVENTS.SUBSCRIPTION_ACTIVATED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.SUBSCRIPTION_ACTIVATED,
        channels: ["EMAIL", "IN_APP"],
        recipients: ["subscription.owner"],
      },
    ],
    [EVENTS.CONTACT_UNLOCKED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
        channels: ["IN_APP"],
        recipients: ["contact.target_user"],
      },
    ],
    [EVENTS.AI_REQUEST_COMPLETED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_COMPLETED,
        channels: ["IN_APP"],
        recipients: ["ai.request.owner"],
      },
    ],
    [EVENTS.AI_REQUEST_FAILED]: [
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_FAILED,
        channels: ["IN_APP"],
        recipients: ["ai.request.owner"],
      },
    ],
  },
};

export function getMappingEntries(eventName: string): EventMappingEntry[] {
  return EVENT_MAPPING_V1.mappings[eventName] ?? [];
}
