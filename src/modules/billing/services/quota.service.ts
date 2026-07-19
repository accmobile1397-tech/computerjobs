import {
  BillingOwnerType,
  ConsumableTxKind,
  ConsumableType,
  FeaturePeriod,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  FEATURE_TO_CONSUMABLE,
} from "@/modules/billing/constants";
import {
  BillingError,
  getOrCreateSubscription,
  periodKeyFor,
  resolveActiveFeature,
} from "@/modules/billing/services/billing-core";
import { debitWallet } from "@/modules/billing/services/wallet.service";

export async function getFeatureLimit(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  featureKey: string;
  defaultPlanSlug: string;
}) {
  const sub = await getOrCreateSubscription({
    ownerType: params.ownerType,
    ownerId: params.ownerId,
    defaultPlanSlug: params.defaultPlanSlug,
  });
  const feature = await resolveActiveFeature(sub.planId, params.featureKey);
  return { sub, feature, limit: feature?.limitValue ?? null, period: feature?.period ?? FeaturePeriod.MONTH };
}

export async function consumeQuota(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  featureKey: string;
  defaultPlanSlug: string;
  actorUserId?: string;
  refType?: string;
  refId?: string;
  amount?: number;
}) {
  const amount = params.amount ?? 1;
  const { feature, limit, period } = await getFeatureLimit(params);

  if (limit == null) {
    // unlimited
    return { source: "unlimited" as const };
  }

  const key = await periodKeyFor(period);
  const usage = await prisma.quotaUsage.upsert({
    where: {
      ownerType_ownerId_featureKey_periodKey: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        featureKey: params.featureKey,
        periodKey: key,
      },
    },
    create: {
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      featureKey: params.featureKey,
      periodKey: key,
      used: 0,
    },
    update: {},
  });

  if (usage.used + amount <= limit) {
    await prisma.quotaUsage.update({
      where: { id: usage.id },
      data: { used: { increment: amount } },
    });
    await writeAuditLog({
      userId: params.actorUserId,
      action: "QUOTA_CONSUMED",
      metadata: {
        featureKey: params.featureKey,
        periodKey: key,
        amount,
        source: "plan",
      },
    });
    return { source: "plan" as const, periodKey: key };
  }

  const consumableName = FEATURE_TO_CONSUMABLE[params.featureKey];
  if (consumableName) {
    await debitWallet({
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      consumableType: consumableName as ConsumableType,
      amount,
      actorUserId: params.actorUserId,
      refType: params.refType,
      refId: params.refId,
      kind: ConsumableTxKind.DEBIT,
    });
    return { source: "wallet" as const };
  }

  throw new BillingError("QUOTA_EXCEEDED");
}

/** Hourly job: no destructive reset — periodKey rotation is the strategy. */
export async function ensurePeriodBoundaries() {
  return {
    ok: true,
    note: "QuotaUsage keyed by periodKey; new periods start at 0 automatically",
    timezone: await (await import("@/modules/billing/services/billing-core")).getTimezone(),
  };
}
