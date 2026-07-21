import { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";
import { appendDomainEventLog } from "@/modules/events/log/append-domain-event";

export { EventBusError } from "@/modules/events/bus/errors";
export { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";
export type { InMemoryEventBusOptions } from "@/modules/events/bus/in-memory.bus";
export type {
  DomainEvent,
  EventBus,
  EventHandler,
  EventHandlerContext,
  PublishInput,
  RegisterHandlerOptions,
} from "@/modules/events/bus/types";
export { validateEnvelope } from "@/modules/events/bus/validate-envelope";
export { appendDomainEventLog } from "@/modules/events/log/append-domain-event";

/** Process-wide in-memory bus — persists DomainEventLog on publish (P10-003). */
export const eventBus = new InMemoryEventBus({
  persistDomainEvent: appendDomainEventLog,
});
