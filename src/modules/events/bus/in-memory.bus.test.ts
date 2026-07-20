import { describe, expect, it, vi } from "vitest";
import pino from "pino";
import { EventBusError } from "@/modules/events/bus/errors";
import { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";
import type { DomainEvent, PublishInput } from "@/modules/events/bus/types";
import { validateEnvelope } from "@/modules/events/bus/validate-envelope";
import { EVENTS } from "@/modules/events/catalog";
import { getCatalogEntry } from "@/modules/events/catalog/lookup";

const silentLogger = pino({ level: "silent" });

function sampleEvent(overrides: Partial<PublishInput> = {}): PublishInput {
  const name = overrides.name ?? EVENTS.JOB_APPLICATION_SUBMITTED;
  const version = overrides.version ?? 1;
  const entry = getCatalogEntry(name, version);

  const defaultPayload = entry
    ? Object.fromEntries(entry.payloadFields.map((field) => [field, `${field}-1`]))
    : {};

  return {
    eventId: overrides.eventId ?? "550e8400-e29b-41d4-a716-446655440000",
    occurredAt: overrides.occurredAt ?? "2026-07-20T10:00:00.000Z",
    aggregateId: overrides.aggregateId ?? "agg-1",
    correlationId: overrides.correlationId ?? "req-1",
    name,
    version,
    aggregateType: overrides.aggregateType ?? entry?.aggregateType ?? "Unknown",
    payload: overrides.payload ?? defaultPayload,
  };
}

describe("validateEnvelope", () => {
  it("accepts a valid envelope", () => {
    const event = validateEnvelope(sampleEvent());
    expect(event.name).toBe(EVENTS.JOB_APPLICATION_SUBMITTED);
    expect(event.version).toBe(1);
  });

  it("rejects invalid event names", () => {
    expect(() => validateEnvelope(sampleEvent({ name: "JobPublished" }))).toThrow(
      EventBusError
    );
  });

  it("rejects invalid version", () => {
    expect(() => validateEnvelope(sampleEvent({ version: 0 }))).toThrow(EventBusError);
  });

  it("rejects non-object payload", () => {
    expect(() =>
      validateEnvelope(sampleEvent({ payload: [] as unknown as Record<string, unknown> }))
    ).toThrow(EventBusError);
  });

  it("rejects unknown catalog events", () => {
    expect(() =>
      validateEnvelope(
        sampleEvent({
          name: EVENTS.JOB_APPLICATION_SUBMITTED,
          aggregateType: "JobApplication",
          payload: { jobId: "j1", applicationId: "a1", userId: "u1" },
        })
      )
    ).not.toThrow();

    expect(() =>
      validateEnvelope(
        sampleEvent({
          name: "not.in.catalog",
          aggregateType: "X",
          payload: {},
        })
      )
    ).toThrow(EventBusError);
  });

  it("rejects missing catalog payload fields", () => {
    expect(() =>
      validateEnvelope(
        sampleEvent({
          payload: { jobId: "j1", applicationId: "a1" },
        })
      )
    ).toThrow(/payload missing required field/);
  });
});

describe("InMemoryEventBus", () => {
  it("dispatches to sync handlers in registration order", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const order: number[] = [];

    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, async () => {
      order.push(1);
    });
    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, async () => {
      order.push(2);
    });

    await bus.publish(sampleEvent({ name: EVENTS.PAYMENT_SUCCEEDED }));
    expect(order).toEqual([1, 2]);
  });

  it("assigns eventId when missing", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    let received: DomainEvent | undefined;

    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, async (ctx) => {
      received = ctx.event;
    });

    await bus.publish(sampleEvent({ name: EVENTS.PAYMENT_SUCCEEDED, eventId: undefined }));
    expect(received?.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("does not invoke handlers for other event names", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const handler = vi.fn();

    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, handler);
    await bus.publish(sampleEvent({ name: EVENTS.JOB_APPLICATION_SUBMITTED }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("runs async handlers after sync handlers", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const order: string[] = [];

    bus.registerHandler(EVENTS.CONTACT_UNLOCKED, async () => {
      order.push("sync");
    });
    bus.registerHandler(
      EVENTS.CONTACT_UNLOCKED,
      async () => {
        order.push("async");
      },
      { async: true }
    );

    await bus.publish(sampleEvent({ name: EVENTS.CONTACT_UNLOCKED }));
    expect(order).toEqual(["sync", "async"]);
  });

  it("continues when a handler throws", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const second = vi.fn();

    bus.registerHandler(EVENTS.AI_REQUEST_FAILED, async () => {
      throw new Error("handler boom");
    });
    bus.registerHandler(EVENTS.AI_REQUEST_FAILED, second);

    await bus.publish(sampleEvent({ name: EVENTS.AI_REQUEST_FAILED }));
    expect(second).toHaveBeenCalledOnce();
  });

  it("skips idempotent handler on duplicate eventId", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const handler = vi.fn();

    bus.registerHandler(
      EVENTS.SUBSCRIPTION_ACTIVATED,
      handler,
      { idempotent: true }
    );

    const event = sampleEvent({ name: EVENTS.SUBSCRIPTION_ACTIVATED });
    await bus.publish(event);
    await bus.publish(event);

    expect(handler).toHaveBeenCalledOnce();
  });

  it("rejects invalid envelopes at publish time", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    await expect(
      bus.publish(sampleEvent({ name: "INVALID", eventId: undefined }))
    ).rejects.toThrow(EventBusError);
  });
});
