export { EVENT_MAPPING_V1, getMappingEntries } from "@/modules/notifications/handlers/mapping.v1";
export type {
  EventMappingConfig,
  EventMappingEntry,
  RecipientRule,
} from "@/modules/notifications/handlers/mapping.v1";

export {
  handleDomainEvent,
  type HandleDomainEventDeps,
} from "@/modules/notifications/handlers/handle-domain-event";

export { resolveRecipients } from "@/modules/notifications/handlers/resolve-recipients";
export type { ResolvedRecipient } from "@/modules/notifications/handlers/resolve-recipients";

export {
  registerNotificationHandlers,
  NOTIFICATION_HANDLER_EVENTS,
} from "@/modules/notifications/handlers/register";
