import {
  BillingOwnerType,
  FeaturePeriod,
  type PlanFeature,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { SETTING_KEYS } from "@/modules/billing/constants";

export class BillingError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  return row.valueJson as T;
}

export async function getTimezone() {
  return getSetting(SETTING_KEYS.TIMEZONE, "Asia/Tehran");
}

/** Format date parts in a timezone using Intl. */
export function formatInTimeZone(date: Date, timeZone: string, pattern: "day" | "month" | "year") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  if (pattern === "day") return `${y}-${m}-${d}`;
  if (pattern === "month") return `${y}-${m}`;
  return y;
}

export async function periodKeyFor(period: FeaturePeriod, at = new Date()) {
  if (period === FeaturePeriod.NONE) return "lifetime";
  const tz = await getTimezone();
  if (period === FeaturePeriod.DAY) return formatInTimeZone(at, tz, "day");
  if (period === FeaturePeriod.MONTH) return formatInTimeZone(at, tz, "month");
  return formatInTimeZone(at, tz, "year");
}

export async function resolveActiveFeature(
  planId: string,
  featureKey: string,
  at = new Date(),
): Promise<PlanFeature | null> {
  const rows = await prisma.planFeature.findMany({
    where: {
      planId,
      featureKey,
      effectiveFrom: { lte: at },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
    },
    orderBy: [{ version: "desc" }],
    take: 1,
  });
  return rows[0] ?? null;
}

export async function getOrCreateSubscription(params: {
  ownerType: BillingOwnerType;
  ownerId: string;
  defaultPlanSlug: string;
}) {
  const existing = await prisma.subscription.findUnique({
    where: {
      ownerType_ownerId: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
      },
    },
    include: { plan: true },
  });
  if (existing) return existing;

  const plan = await prisma.planDefinition.findFirst({
    where: { slug: params.defaultPlanSlug, isActive: true },
  });
  if (!plan) throw new BillingError("PLAN_NOT_FOUND");

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);

  const sub = await prisma.subscription.create({
    data: {
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: end,
      history: {
        create: {
          event: "CREATED",
          toPlanId: plan.id,
          note: "auto-provision free plan",
        },
      },
    },
    include: { plan: true },
  });

  return sub;
}
