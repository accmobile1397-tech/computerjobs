import { describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { appendDomainEventLog } from "@/modules/events/log/append-domain-event";
import type { DomainEvent } from "@/modules/events/bus/types";
import { InMemoryEventBus } from "@/modules/events/bus/in-memory.bus";
import pino from "pino";
import { EVENTS } from "@/modules/events/catalog";

const silentLogger = pino({ level: "silent" });

function sampleDomainEvent(
  overrides: Partial<DomainEvent> = {},
): DomainEvent {
  return {
    eventId: overrides.eventId ?? "550e8400-e29b-41d4-a716-446655440001",
    name: overrides.name ?? EVENTS.PAYMENT_SUCCEEDED,
    version: overrides.version ?? 1,
    occurredAt: overrides.occurredAt ?? "2026-07-21T12:00:00.000Z",
    aggregateType: overrides.aggregateType ?? "Payment",
    aggregateId: overrides.aggregateId ?? "pay-1",
    correlationId: overrides.correlationId ?? "corr-1",
    payload: overrides.payload ?? { paymentId: "pay-1" },
  };
}

describe("appendDomainEventLog (P10-003 · C-010-5)", () => {
  it("creates an append-only row with mapped fields", async () => {
    const create = vi.fn().mockResolvedValue({ id: "row-1" });
    const event = sampleDomainEvent();

    await appendDomainEventLog(event, {
      db: { domainEventLog: { create } },
    });

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      data: {
        eventId: event.eventId,
        name: event.name,
        version: 1,
        occurredAt: new Date("2026-07-21T12:00:00.000Z"),
        aggregateType: "Payment",
        aggregateId: "pay-1",
        correlationId: "corr-1",
        payload: { paymentId: "pay-1" },
      },
    });
  });

  it("ignores duplicate eventId (P2002) without throwing", async () => {
    const create = vi.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(
      appendDomainEventLog(sampleDomainEvent(), {
        db: { domainEventLog: { create } },
      }),
    ).resolves.toBeUndefined();
  });

  it("rethrows non-unique persistence errors", async () => {
    const create = vi.fn().mockRejectedValue(new Error("db down"));

    await expect(
      appendDomainEventLog(sampleDomainEvent(), {
        db: { domainEventLog: { create } },
      }),
    ).rejects.toThrow("db down");
  });
});

describe("InMemoryEventBus DomainEventLog hook (P10-003)", () => {
  it("persists before dispatching handlers", async () => {
    const order: string[] = [];
    const persist = vi.fn(async () => {
      order.push("persist");
    });
    const bus = new InMemoryEventBus({
      logger: silentLogger,
      persistDomainEvent: persist,
    });

    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, async () => {
      order.push("handler");
    });

    await bus.publish({
      name: EVENTS.PAYMENT_SUCCEEDED,
      version: 1,
      occurredAt: "2026-07-21T12:00:00.000Z",
      aggregateType: "Payment",
      aggregateId: "pay-1",
      payload: {
        paymentId: "pay-1",
        ownerType: "USER",
        ownerId: "u1",
        amount: 1000,
        currency: "IRR",
        sku: "plan",
      },
    });

    expect(persist).toHaveBeenCalledOnce();
    expect(order).toEqual(["persist", "handler"]);
  });

  it("persists even when no handlers are registered", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const bus = new InMemoryEventBus({
      logger: silentLogger,
      persistDomainEvent: persist,
    });

    await bus.publish({
      name: EVENTS.PAYMENT_SUCCEEDED,
      version: 1,
      occurredAt: "2026-07-21T12:00:00.000Z",
      aggregateType: "Payment",
      aggregateId: "pay-1",
      payload: {
        paymentId: "pay-1",
        ownerType: "USER",
        ownerId: "u1",
        amount: 1000,
        currency: "IRR",
        sku: "plan",
      },
    });

    expect(persist).toHaveBeenCalledOnce();
  });

  it("still dispatches handlers if persist throws", async () => {
    const handler = vi.fn();
    const bus = new InMemoryEventBus({
      logger: silentLogger,
      persistDomainEvent: async () => {
        throw new Error("persist failed");
      },
    });

    bus.registerHandler(EVENTS.PAYMENT_SUCCEEDED, handler);

    await bus.publish({
      name: EVENTS.PAYMENT_SUCCEEDED,
      version: 1,
      occurredAt: "2026-07-21T12:00:00.000Z",
      aggregateType: "Payment",
      aggregateId: "pay-1",
      payload: {
        paymentId: "pay-1",
        ownerType: "USER",
        ownerId: "u1",
        amount: 1000,
        currency: "IRR",
        sku: "plan",
      },
    });

    expect(handler).toHaveBeenCalledOnce();
  });
});
