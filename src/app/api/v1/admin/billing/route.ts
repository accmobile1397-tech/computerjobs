import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { BillingOwnerType, ConsumableType } from "@prisma/client";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  AuthorizationError,
  requirePermission,
} from "@/modules/authorization/services/authorization.service";
import { prisma } from "@/modules/shared/prisma/client";
import { BillingError } from "@/modules/billing/services/billing-core";
import { creditWallet } from "@/modules/billing/services/wallet.service";
import { writeAuditLog } from "@/modules/auth/services/audit.service";

const grantSchema = z.object({
  ownerType: z.nativeEnum(BillingOwnerType),
  ownerId: z.string().min(1),
  consumableType: z.nativeEnum(ConsumableType),
  amount: z.number().int().positive(),
});

const settingSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
});

const featureVersionSchema = z.object({
  planId: z.string().uuid(),
  featureKey: z.string().min(1),
  limitValue: z.number().int().nullable(),
  period: z.enum(["NONE", "DAY", "MONTH", "YEAR"]),
  rollover: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "billing:admin");
    const [plans, settings] = await Promise.all([
      prisma.planDefinition.findMany({
        include: { features: true, prices: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.systemSetting.findMany(),
    ]);
    return NextResponse.json(successResponse({ plans, settings }, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "billing:admin");
    const body = await request.json();
    const action = body.action as string;

    if (action === "grant") {
      const input = grantSchema.parse(body);
      const result = await creditWallet({
        ...input,
        actorUserId: userId,
        adminGrant: true,
      });
      return NextResponse.json(successResponse(result, requestId));
    }

    if (action === "setting") {
      const input = settingSchema.parse(body);
      const row = await prisma.systemSetting.upsert({
        where: { key: input.key },
        create: {
          key: input.key,
          valueJson: input.value as object,
          updatedById: userId,
        },
        update: {
          valueJson: input.value as object,
          updatedById: userId,
        },
      });
      await writeAuditLog({
        userId,
        action: "SYSTEM_SETTING_UPDATED",
        ipAddress,
        userAgent,
        metadata: { key: input.key },
      });
      return NextResponse.json(successResponse(row, requestId));
    }

    if (action === "versionFeature") {
      const input = featureVersionSchema.parse(body);
      const latest = await prisma.planFeature.findFirst({
        where: { planId: input.planId, featureKey: input.featureKey },
        orderBy: { version: "desc" },
      });
      const now = new Date();
      if (latest) {
        await prisma.planFeature.update({
          where: { id: latest.id },
          data: { effectiveTo: now },
        });
      }
      const created = await prisma.planFeature.create({
        data: {
          planId: input.planId,
          featureKey: input.featureKey,
          limitValue: input.limitValue,
          period: input.period,
          rollover: input.rollover ?? false,
          version: (latest?.version ?? 0) + 1,
          effectiveFrom: now,
        },
      });
      await writeAuditLog({
        userId,
        action: "PLAN_FEATURE_VERSIONED",
        ipAddress,
        userAgent,
        metadata: { planFeatureId: created.id, featureKey: input.featureKey },
      });
      return NextResponse.json(successResponse(created, requestId), { status: 201 });
    }

    const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Unknown action");
    return NextResponse.json(mapped.body, { status: mapped.status });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Validation failed");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
