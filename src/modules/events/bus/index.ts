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

import { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";

/** Process-wide in-memory bus (Phase 9 MVP). Queue handoff deferred to later tasks. */
export const eventBus = new InMemoryEventBus();
