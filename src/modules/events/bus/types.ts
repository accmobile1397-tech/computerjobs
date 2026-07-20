import type { Logger } from "pino";

/** RFC-003 domain event envelope (frozen). */
export type DomainEvent = {
  eventId: string;
  name: string;
  version: number;
  occurredAt: string;
  actorUserId?: string;
  aggregateType: string;
  aggregateId: string;
  correlationId?: string;
  payload: Record<string, unknown>;
};

export type PublishInput = Omit<DomainEvent, "eventId"> & {
  eventId?: string;
};

export type EventHandlerContext = {
  event: DomainEvent;
  logger: Logger;
};

export type EventHandler = (ctx: EventHandlerContext) => Promise<void>;

export type RegisterHandlerOptions = {
  /** Deferred to BullMQ in later tasks; in-memory bus runs after sync handlers. */
  async?: boolean;
  /** Skip duplicate delivery for the same eventId (in-memory retention for process lifetime). */
  idempotent?: boolean;
};

export interface EventBus {
  publish(event: PublishInput): Promise<void>;
  registerHandler(
    eventName: string,
    handler: EventHandler,
    options?: RegisterHandlerOptions
  ): void;
}
