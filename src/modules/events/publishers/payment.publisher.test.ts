import { describe, expect, it, vi } from "vitest";
import { BillingOwnerType } from "@prisma/client";
import type { EventBus, PublishInput } from "@/modules/events/bus";
import { EVENTS } from "@/modules/events/catalog";
import { getCatalogEntry } from "@/modules/events/catalog/lookup";
import { publishPaymentSucceeded } from "@/modules/events/publishers/payment.publisher";

describe("publishPaymentSucceeded", () => {
  it("publishes RFC-003 envelope via EventBus using EVENTS constant", async () => {
    const published: PublishInput[] = [];
    const bus: EventBus = {
      publish: vi.fn(async (event) => {
        published.push(event);
      }),
      registerHandler: vi.fn(),
    };

    await publishPaymentSucceeded(
      {
        paymentId: "pay-1",
        ownerType: BillingOwnerType.USER,
        ownerId: "user-1",
        sku: "plan-pro-monthly",
        correlationId: "idem-1",
        actorUserId: "user-1",
      },
      bus
    );

    expect(published).toHaveLength(1);
    const event = published[0]!;
    const entry = getCatalogEntry(EVENTS.PAYMENT_SUCCEEDED)!;

    expect(event.name).toBe(EVENTS.PAYMENT_SUCCEEDED);
    expect(event.version).toBe(entry.version);
    expect(event.aggregateType).toBe(entry.aggregateType);
    expect(event.aggregateId).toBe("pay-1");
    expect(event.correlationId).toBe("idem-1");
    expect(event.payload).toEqual({
      paymentId: "pay-1",
      ownerType: BillingOwnerType.USER,
      ownerId: "user-1",
      sku: "plan-pro-monthly",
    });
  });

  it("defaults correlationId to paymentId", async () => {
    const published: PublishInput[] = [];
    const bus: EventBus = {
      publish: vi.fn(async (event) => {
        published.push(event);
      }),
      registerHandler: vi.fn(),
    };

    await publishPaymentSucceeded(
      {
        paymentId: "pay-2",
        ownerType: BillingOwnerType.COMPANY,
        ownerId: "co-1",
        sku: "wallet-credits-100",
      },
      bus
    );

    expect(published[0]?.correlationId).toBe("pay-2");
  });
});
