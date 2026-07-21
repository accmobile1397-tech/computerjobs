import { z } from "zod";
import { BillingOwnerType, ConsumableType } from "@prisma/client";

export const billingGrantSchema = z.object({
  ownerType: z.nativeEnum(BillingOwnerType),
  ownerId: z.string().min(1),
  consumableType: z.nativeEnum(ConsumableType),
  amount: z.number().int().positive(),
});

export const billingSettingSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
});

export const billingFeatureVersionSchema = z.object({
  planId: z.string().uuid(),
  featureKey: z.string().min(1),
  limitValue: z.number().int().nullable(),
  period: z.enum(["NONE", "DAY", "MONTH", "YEAR"]),
  rollover: z.boolean().optional(),
});
