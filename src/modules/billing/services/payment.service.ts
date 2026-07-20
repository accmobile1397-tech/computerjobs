import {
  BillingOwnerType,
  PaymentStatus,
  SubscriptionHistoryEvent,
  SubscriptionStatus,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { getActivePaymentProvider } from "@/modules/billing/providers";
import { BillingError } from "@/modules/billing/services/billing-core";
import { creditWallet } from "@/modules/billing/services/wallet.service";
import { publishPaymentSucceeded } from "@/modules/events/publishers/payment.publisher";

export async function startCheckout(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  sku: string;
  actorUserId: string;
  idempotencyKey?: string;
  callbackUrl: string;
}) {
  const key = params.idempotencyKey ?? randomUUID();

  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: key },
  });
  if (existing) {
    return {
      paymentId: existing.id,
      status: existing.status,
      redirectUrl: (existing.metadata as { redirectUrl?: string } | null)?.redirectUrl,
      reused: true,
    };
  }

  const price = await prisma.planPrice.findFirst({
    where: { sku: params.sku, isActive: true },
  });
  if (!price) throw new BillingError("PLAN_NOT_FOUND");

  const provider = await getActivePaymentProvider();

  const payment = await prisma.payment.create({
    data: {
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      sku: params.sku,
      amount: price.amount,
      currency: price.currency,
      status: PaymentStatus.PENDING,
      gateway: provider.name,
      idempotencyKey: key,
    },
  });

  await writeAuditLog({
    userId: params.actorUserId,
    action: "PAYMENT_CREATED",
    metadata: { paymentId: payment.id, sku: params.sku, amount: price.amount },
  });

  const created = await provider.createPayment({
    paymentId: payment.id,
    amount: price.amount,
    currency: price.currency,
    callbackUrl: params.callbackUrl,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PROCESSING,
      gatewayRef: created.gatewayRef,
      metadata: { redirectUrl: created.redirectUrl },
    },
  });

  await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status: "CREATE",
      rawResponse: created.raw as object,
    },
  });

  return {
    paymentId: updated.id,
    status: updated.status,
    redirectUrl: created.redirectUrl,
    reused: false,
  };
}

/** Return URL — status only. NEVER settles. */
export async function getPaymentStatus(paymentId: string, ownerId?: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new BillingError("NOT_FOUND");
  if (ownerId && payment.ownerId !== ownerId) throw new BillingError("PERMISSION_DENIED");
  return {
    id: payment.id,
    status: payment.status,
    sku: payment.sku,
    amount: payment.amount,
    currency: payment.currency,
    // Explicit: return URL is informational only
    settled: payment.status === PaymentStatus.SUCCEEDED,
    note: "Settlement occurs only via verified webhook",
  };
}

async function grantEntitlement(payment: {
  id: string;
  sku: string;
  ownerType: BillingOwnerType;
  ownerId: string;
  actorUserId?: string;
}) {
  const price = await prisma.planPrice.findFirst({ where: { sku: payment.sku } });
  if (!price) return;

  if (price.planId) {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + (price.periodMonths ?? 1));

    const existing = await prisma.subscription.findUnique({
      where: {
        ownerType_ownerId: {
          ownerType: payment.ownerType,
          ownerId: payment.ownerId,
        },
      },
    });

    if (existing) {
      const fromPlanId = existing.planId;
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: price.planId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
        },
      });
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: existing.id,
          event: SubscriptionHistoryEvent.PLAN_CHANGED,
          fromPlanId,
          toPlanId: price.planId,
          note: `payment ${payment.id}`,
          actorUserId: payment.actorUserId,
        },
      });
    } else {
      const sub = await prisma.subscription.create({
        data: {
          ownerType: payment.ownerType,
          ownerId: payment.ownerId,
          planId: price.planId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: end,
          history: {
            create: {
              event: SubscriptionHistoryEvent.CREATED,
              toPlanId: price.planId,
              note: `payment ${payment.id}`,
              actorUserId: payment.actorUserId,
            },
          },
        },
      });
      void sub;
    }
    await writeAuditLog({
      userId: payment.actorUserId,
      action: "SUBSCRIPTION_CHANGED",
      metadata: { paymentId: payment.id, planId: price.planId },
    });
  }

  if (price.consumableType && price.packQuantity) {
    await creditWallet({
      ownerType: payment.ownerType,
      ownerId: payment.ownerId,
      consumableType: price.consumableType,
      amount: price.packQuantity,
      actorUserId: payment.actorUserId,
      refType: "payment",
      refId: payment.id,
    });
  }
}

/**
 * Idempotent settlement — only called from verified webhook path.
 * Keys: payment.id (idempotencyKey unique) + gatewayRef match.
 */
export async function settlePaymentFromWebhook(params: {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}) {
  const provider = await getActivePaymentProvider();
  const verified = await provider.verifyWebhook({
    headers: params.headers,
    body: params.body,
  });

  if (!verified.ok) {
    await writeAuditLog({
      action: "PAYMENT_FAILED",
      metadata: { reason: "webhook_verify_failed" },
    });
    throw new BillingError("PAYMENT_VERIFY_FAILED");
  }

  let payment = verified.paymentId
    ? await prisma.payment.findUnique({ where: { id: verified.paymentId } })
    : null;

  if (!payment && verified.gatewayRef) {
    payment = await prisma.payment.findFirst({
      where: { gatewayRef: verified.gatewayRef },
    });
  }

  if (!payment) throw new BillingError("NOT_FOUND");

  if (
    payment.gatewayRef &&
    verified.gatewayRef &&
    payment.gatewayRef !== verified.gatewayRef
  ) {
    throw new BillingError("PAYMENT_VERIFY_FAILED");
  }

  // Idempotent: already terminal success
  if (
    payment.status === PaymentStatus.SUCCEEDED ||
    payment.status === PaymentStatus.REFUNDED
  ) {
    return { payment, alreadySettled: true };
  }

  if (!verified.paid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    await writeAuditLog({
      action: "PAYMENT_FAILED",
      metadata: { paymentId: payment.id, gatewayRef: verified.gatewayRef },
    });
    return { payment: { ...payment, status: PaymentStatus.FAILED }, alreadySettled: false };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUniqueOrThrow({ where: { id: payment!.id } });
    if (
      current.status === PaymentStatus.SUCCEEDED ||
      current.status === PaymentStatus.REFUNDED
    ) {
      return current;
    }
    return tx.payment.update({
      where: { id: payment!.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        gatewayRef: verified.gatewayRef || current.gatewayRef,
      },
    });
  });

  if (updated.status === PaymentStatus.SUCCEEDED) {
    // Only grant if we transitioned (check attempt log) — safe to call; subscription upsert handles
    const priorSuccess = await prisma.paymentAttempt.findFirst({
      where: { paymentId: updated.id, status: "SETTLED" },
    });
    if (!priorSuccess) {
      await grantEntitlement({
        id: updated.id,
        sku: updated.sku,
        ownerType: updated.ownerType,
        ownerId: updated.ownerId,
      });
      await prisma.paymentAttempt.create({
        data: {
          paymentId: updated.id,
          status: "SETTLED",
          rawResponse: verified.raw as object,
        },
      });
      await writeAuditLog({
        action: "PAYMENT_SETTLED",
        metadata: {
          paymentId: updated.id,
          gatewayRef: updated.gatewayRef,
          idempotencyKey: updated.idempotencyKey,
        },
      });
      await writeAuditLog({
        action: "PAYMENT_SUCCEEDED",
        metadata: { paymentId: updated.id },
      });
      await publishPaymentSucceeded({
        paymentId: updated.id,
        ownerType: updated.ownerType,
        ownerId: updated.ownerId,
        sku: updated.sku,
        correlationId: updated.idempotencyKey,
      });
    }
  }

  return { payment: updated, alreadySettled: Boolean(updated.status === PaymentStatus.SUCCEEDED) };
}
