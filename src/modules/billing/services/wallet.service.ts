import {
  BillingOwnerType,
  ConsumableTxKind,
  ConsumableType,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { BillingError } from "@/modules/billing/services/billing-core";

async function getBalance(
  ownerType: BillingOwnerType,
  ownerId: string,
  consumableType: ConsumableType,
) {
  return prisma.consumableBalance.upsert({
    where: {
      ownerType_ownerId_consumableType: { ownerType, ownerId, consumableType },
    },
    create: { ownerType, ownerId, consumableType, available: 0, reserved: 0 },
    update: {},
  });
}

export async function creditWallet(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  requestId?: string;
  adminGrant?: boolean;
}) {
  if (params.amount <= 0) throw new BillingError("VALIDATION_ERROR");

  const balance = await getBalance(
    params.ownerType,
    params.ownerId,
    params.consumableType,
  );

  const [updated, tx] = await prisma.$transaction([
    prisma.consumableBalance.update({
      where: { id: balance.id },
      data: { available: { increment: params.amount } },
    }),
    prisma.consumableTransaction.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        consumableType: params.consumableType,
        delta: params.amount,
        kind: ConsumableTxKind.CREDIT,
        refType: params.refType,
        refId: params.refId,
        requestId: params.requestId,
      },
    }),
  ]);

  await writeAuditLog({
    userId: params.actorUserId,
    action: params.adminGrant ? "BILLING_ADMIN_GRANT" : "WALLET_CREDITED",
    metadata: {
      consumableType: params.consumableType,
      amount: params.amount,
      txId: tx.id,
    },
  });

  return { balance: updated, tx };
}

export async function debitWallet(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  kind?: ConsumableTxKind;
}) {
  if (params.amount <= 0) throw new BillingError("VALIDATION_ERROR");
  const kind = params.kind ?? ConsumableTxKind.DEBIT;

  const balance = await getBalance(
    params.ownerType,
    params.ownerId,
    params.consumableType,
  );
  if (balance.available < params.amount) throw new BillingError("QUOTA_EXCEEDED");

  const [updated, tx] = await prisma.$transaction([
    prisma.consumableBalance.update({
      where: { id: balance.id },
      data: { available: { decrement: params.amount } },
    }),
    prisma.consumableTransaction.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        consumableType: params.consumableType,
        delta: -params.amount,
        kind,
        refType: params.refType,
        refId: params.refId,
      },
    }),
  ]);

  await writeAuditLog({
    userId: params.actorUserId,
    action: "WALLET_DEBITED",
    metadata: {
      consumableType: params.consumableType,
      amount: params.amount,
      txId: tx.id,
    },
  });

  return { balance: updated, tx };
}

/** Move available → reserved (AI / consumable hold). */
export async function reserveWallet(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  requestId?: string;
}) {
  if (params.amount <= 0) throw new BillingError("VALIDATION_ERROR");

  if (params.requestId) {
    const existing = await prisma.consumableTransaction.findFirst({
      where: {
        requestId: params.requestId,
        kind: ConsumableTxKind.RESERVE,
        consumableType: params.consumableType,
      },
    });
    if (existing) {
      const balance = await getBalance(
        params.ownerType,
        params.ownerId,
        params.consumableType,
      );
      return { balance, tx: existing, idempotent: true as const };
    }
  }

  const balance = await getBalance(
    params.ownerType,
    params.ownerId,
    params.consumableType,
  );
  if (balance.available < params.amount) throw new BillingError("QUOTA_EXCEEDED");

  const [updated, tx] = await prisma.$transaction([
    prisma.consumableBalance.update({
      where: { id: balance.id },
      data: {
        available: { decrement: params.amount },
        reserved: { increment: params.amount },
      },
    }),
    prisma.consumableTransaction.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        consumableType: params.consumableType,
        delta: -params.amount,
        kind: ConsumableTxKind.RESERVE,
        refType: params.refType,
        refId: params.refId,
        requestId: params.requestId,
      },
    }),
  ]);

  await writeAuditLog({
    userId: params.actorUserId,
    action: "AI_CREDIT_RESERVED",
    metadata: {
      consumableType: params.consumableType,
      amount: params.amount,
      txId: tx.id,
      requestId: params.requestId,
    },
  });

  return { balance: updated, tx, idempotent: false as const };
}

/** Finalize reserved amount (consume). */
export async function captureWallet(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  requestId?: string;
}) {
  if (params.amount <= 0) throw new BillingError("VALIDATION_ERROR");

  const balance = await getBalance(
    params.ownerType,
    params.ownerId,
    params.consumableType,
  );
  if (balance.reserved < params.amount) throw new BillingError("VALIDATION_ERROR");

  const [updated, tx] = await prisma.$transaction([
    prisma.consumableBalance.update({
      where: { id: balance.id },
      data: { reserved: { decrement: params.amount } },
    }),
    prisma.consumableTransaction.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        consumableType: params.consumableType,
        delta: -params.amount,
        kind: ConsumableTxKind.CAPTURE,
        refType: params.refType,
        refId: params.refId,
        requestId: params.requestId,
      },
    }),
  ]);

  await writeAuditLog({
    userId: params.actorUserId,
    action: "AI_CREDIT_CAPTURED",
    metadata: {
      consumableType: params.consumableType,
      amount: params.amount,
      txId: tx.id,
      requestId: params.requestId,
    },
  });

  return { balance: updated, tx };
}

/** Return reserved amount to available. */
export async function releaseWallet(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  requestId?: string;
}) {
  if (params.amount <= 0) throw new BillingError("VALIDATION_ERROR");

  const balance = await getBalance(
    params.ownerType,
    params.ownerId,
    params.consumableType,
  );
  if (balance.reserved < params.amount) throw new BillingError("VALIDATION_ERROR");

  const [updated, tx] = await prisma.$transaction([
    prisma.consumableBalance.update({
      where: { id: balance.id },
      data: {
        reserved: { decrement: params.amount },
        available: { increment: params.amount },
      },
    }),
    prisma.consumableTransaction.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        consumableType: params.consumableType,
        delta: params.amount,
        kind: ConsumableTxKind.RELEASE,
        refType: params.refType,
        refId: params.refId,
        requestId: params.requestId,
      },
    }),
  ]);

  await writeAuditLog({
    userId: params.actorUserId,
    action: "AI_CREDIT_RELEASED",
    metadata: {
      consumableType: params.consumableType,
      amount: params.amount,
      txId: tx.id,
      requestId: params.requestId,
    },
  });

  return { balance: updated, tx };
}

export async function getWallet(ownerType: BillingOwnerType, ownerId: string) {
  return prisma.consumableBalance.findMany({
    where: { ownerType, ownerId },
  });
}

export async function getWalletAvailable(
  ownerType: BillingOwnerType,
  ownerId: string,
  consumableType: ConsumableType,
) {
  const balance = await getBalance(ownerType, ownerId, consumableType);
  return balance.available;
}
