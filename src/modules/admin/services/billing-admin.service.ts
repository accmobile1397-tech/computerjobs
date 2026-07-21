import type {
  BillingOwnerType,
  ConsumableType,
  FeaturePeriod,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { creditWallet } from "@/modules/billing/services/wallet.service";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export type BillingAdminOverview = {
  plans: Awaited<
    ReturnType<
      PrismaClient["planDefinition"]["findMany"]
    >
  >;
  settings: Awaited<
    ReturnType<PrismaClient["systemSetting"]["findMany"]>
  >;
};

/** GET overview — plans + settings (preserves prior route response shape). */
export async function getBillingAdminOverview(
  db: PrismaClient = defaultPrisma,
): Promise<BillingAdminOverview> {
  const [plans, settings] = await Promise.all([
    db.planDefinition.findMany({
      include: { features: true, prices: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.systemSetting.findMany(),
  ]);
  return { plans, settings };
}

export type GrantBillingAdminInput = {
  ownerType: BillingOwnerType;
  ownerId: string;
  consumableType: ConsumableType;
  amount: number;
  actorUserId: string;
};

export async function grantBillingAdmin(input: GrantBillingAdminInput) {
  return creditWallet({
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    consumableType: input.consumableType,
    amount: input.amount,
    actorUserId: input.actorUserId,
    adminGrant: true,
  });
}

export type UpsertBillingSettingInput = {
  key: string;
  value: unknown;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function upsertBillingAdminSetting(
  input: UpsertBillingSettingInput,
  db: PrismaClient = defaultPrisma,
) {
  const row = await db.systemSetting.upsert({
    where: { key: input.key },
    create: {
      key: input.key,
      valueJson: input.value as Prisma.InputJsonValue,
      updatedById: input.actorUserId,
    },
    update: {
      valueJson: input.value as Prisma.InputJsonValue,
      updatedById: input.actorUserId,
    },
  });

  await writeAuditLog({
    userId: input.actorUserId,
    action: "SYSTEM_SETTING_UPDATED",
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: { key: input.key },
  });

  return row;
}

export type VersionPlanFeatureInput = {
  planId: string;
  featureKey: string;
  limitValue: number | null;
  period: FeaturePeriod | "NONE" | "DAY" | "MONTH" | "YEAR";
  rollover?: boolean;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function versionPlanFeatureAdmin(
  input: VersionPlanFeatureInput,
  db: PrismaClient = defaultPrisma,
) {
  const latest = await db.planFeature.findFirst({
    where: { planId: input.planId, featureKey: input.featureKey },
    orderBy: { version: "desc" },
  });
  const now = new Date();
  if (latest) {
    await db.planFeature.update({
      where: { id: latest.id },
      data: { effectiveTo: now },
    });
  }
  const created = await db.planFeature.create({
    data: {
      planId: input.planId,
      featureKey: input.featureKey,
      limitValue: input.limitValue,
      period: input.period as FeaturePeriod,
      rollover: input.rollover ?? false,
      version: (latest?.version ?? 0) + 1,
      effectiveFrom: now,
    },
  });

  await writeAuditLog({
    userId: input.actorUserId,
    action: "PLAN_FEATURE_VERSIONED",
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: { planFeatureId: created.id, featureKey: input.featureKey },
  });

  return created;
}
