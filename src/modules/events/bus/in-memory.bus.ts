import { randomUUID } from "crypto";
import type { Logger } from "pino";
import { EventBusError } from "@/modules/events/bus/errors";
import type {
  DomainEvent,
  EventBus,
  EventHandler,
  PublishInput,
  RegisterHandlerOptions,
} from "@/modules/events/bus/types";
import { validateEnvelope } from "@/modules/events/bus/validate-envelope";
import { logger as defaultLogger } from "@/modules/shared/logger";

type RegisteredHandler = {
  handler: EventHandler;
  options: RegisterHandlerOptions;
  seenEventIds: Set<string>;
};

export type InMemoryEventBusOptions = {
  logger?: Logger;
};

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, RegisteredHandler[]>();
  private readonly logger: Logger;

  constructor(options: InMemoryEventBusOptions = {}) {
    this.logger = options.logger ?? defaultLogger;
  }

  registerHandler(
    eventName: string,
    handler: EventHandler,
    options: RegisterHandlerOptions = {}
  ): void {
    if (!eventName.trim()) {
      throw new EventBusError("eventName must be a non-empty string");
    }

    const entry: RegisteredHandler = {
      handler,
      options,
      seenEventIds: new Set<string>(),
    };

    const existing = this.handlers.get(eventName) ?? [];
    existing.push(entry);
    this.handlers.set(eventName, existing);
  }

  async publish(input: PublishInput): Promise<void> {
    const event = validateEnvelope(input);
    if (!event.eventId) {
      event.eventId = randomUUID();
    }

    const registered = this.handlers.get(event.name) ?? [];
    if (registered.length === 0) {
      this.logger.debug({ eventId: event.eventId, name: event.name }, "event published (no handlers)");
      return;
    }

    const syncHandlers = registered.filter((entry) => !entry.options.async);
    const asyncHandlers = registered.filter((entry) => entry.options.async);

    for (const entry of syncHandlers) {
      await this.dispatch(entry, event);
    }

    await Promise.all(asyncHandlers.map((entry) => this.dispatch(entry, event)));
  }

  private async dispatch(entry: RegisteredHandler, event: DomainEvent): Promise<void> {
    if (entry.options.idempotent) {
      if (entry.seenEventIds.has(event.eventId)) {
        this.logger.debug(
          { eventId: event.eventId, name: event.name },
          "skipping idempotent handler (duplicate eventId)"
        );
        return;
      }
      entry.seenEventIds.add(event.eventId);
    }

    try {
      await entry.handler({ event, logger: this.logger });
    } catch (error) {
      this.logger.error(
        { err: error, eventId: event.eventId, name: event.name },
        "event handler failed"
      );
    }
  }
}
