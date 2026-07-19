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

export async function getWallet(ownerType: BillingOwnerType, ownerId: string) {
  return prisma.consumableBalance.findMany({
    where: { ownerType, ownerId },
  });
}
