import type { BillingOwnerType } from "@prisma/client";
import type { EventBus } from "@/modules/events/bus";
import { eventBus as defaultEventBus } from "@/modules/events/bus";
import { EVENTS } from "@/modules/events/catalog/events";
import { getCatalogEntry } from "@/modules/events/catalog/lookup";

export type PublishPaymentSucceededInput = {
  paymentId: string;
  ownerType: BillingOwnerType;
  ownerId: string;
  sku: string;
  correlationId?: string;
  actorUserId?: string;
};

/**
 * Emit `payment.succeeded` after webhook settlement (RFC-003 publish-after-success).
 * No notification/dispatch — EventBus only.
 */
export async function publishPaymentSucceeded(
  input: PublishPaymentSucceededInput,
  bus: EventBus = defaultEventBus
): Promise<void> {
  const entry = getCatalogEntry(EVENTS.PAYMENT_SUCCEEDED);
  if (!entry) {
    throw new Error("catalog missing payment.succeeded");
  }

  await bus.publish({
    name: EVENTS.PAYMENT_SUCCEEDED,
    version: entry.version,
    occurredAt: new Date().toISOString(),
    aggregateType: entry.aggregateType,
    aggregateId: input.paymentId,
    correlationId: input.correlationId ?? input.paymentId,
    actorUserId: input.actorUserId,
    payload: {
      paymentId: input.paymentId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      sku: input.sku,
    },
  });
}
