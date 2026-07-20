import { describe, expect, it, vi } from "vitest";
import pino from "pino";
import { EventBusError } from "@/modules/events/bus/errors";
import { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";
import type { DomainEvent, PublishInput } from "@/modules/events/bus/types";
import { validateEnvelope } from "@/modules/events/bus/validate-envelope";

const silentLogger = pino({ level: "silent" });

function sampleEvent(overrides: Partial<PublishInput> = {}): PublishInput {
  return {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    name: "job.application.submitted",
    version: 1,
    occurredAt: "2026-07-20T10:00:00.000Z",
    aggregateType: "JobApplication",
    aggregateId: "app-1",
    correlationId: "req-1",
    payload: { jobId: "job-1", applicationId: "app-1", userId: "user-1" },
    ...overrides,
  };
}

describe("validateEnvelope", () => {
  it("accepts a valid envelope", () => {
    const event = validateEnvelope(sampleEvent());
    expect(event.name).toBe("job.application.submitted");
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
});

describe("InMemoryEventBus", () => {
  it("dispatches to sync handlers in registration order", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const order: number[] = [];

    bus.registerHandler("payment.succeeded", async () => {
      order.push(1);
    });
    bus.registerHandler("payment.succeeded", async () => {
      order.push(2);
    });

    await bus.publish(sampleEvent({ name: "payment.succeeded" }));
    expect(order).toEqual([1, 2]);
  });

  it("assigns eventId when missing", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    let received: DomainEvent | undefined;

    bus.registerHandler("payment.succeeded", async (ctx) => {
      received = ctx.event;
    });

    await bus.publish(sampleEvent({ name: "payment.succeeded", eventId: undefined }));
    expect(received?.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("does not invoke handlers for other event names", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const handler = vi.fn();

    bus.registerHandler("payment.succeeded", handler);
    await bus.publish(sampleEvent({ name: "job.application.submitted" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("runs async handlers after sync handlers", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const order: string[] = [];

    bus.registerHandler("contact.unlocked", async () => {
      order.push("sync");
    });
    bus.registerHandler(
      "contact.unlocked",
      async () => {
        order.push("async");
      },
      { async: true }
    );

    await bus.publish(sampleEvent({ name: "contact.unlocked" }));
    expect(order).toEqual(["sync", "async"]);
  });

  it("continues when a handler throws", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const second = vi.fn();

    bus.registerHandler("ai.request.failed", async () => {
      throw new Error("handler boom");
    });
    bus.registerHandler("ai.request.failed", second);

    await bus.publish(sampleEvent({ name: "ai.request.failed" }));
    expect(second).toHaveBeenCalledOnce();
  });

  it("skips idempotent handler on duplicate eventId", async () => {
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const handler = vi.fn();

    bus.registerHandler(
      "subscription.activated",
      handler,
      { idempotent: true }
    );

    const event = sampleEvent({ name: "subscription.activated" });
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
