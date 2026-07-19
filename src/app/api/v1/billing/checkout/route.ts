import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BillingOwnerType } from "@prisma/client";
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
import { BillingError } from "@/modules/billing/services/billing-core";
import { startCheckout } from "@/modules/billing/services/payment.service";

const bodySchema = z.object({
  sku: z.string().min(1).max(80),
  ownerType: z.nativeEnum(BillingOwnerType).optional(),
  ownerId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(8).max(120).optional(),
});

export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "billing:checkout");
    const body = bodySchema.parse(await request.json());
    const ownerType = body.ownerType ?? BillingOwnerType.USER;
    const ownerId = body.ownerId ?? userId;
    const base = process.env.APP_URL ?? request.nextUrl.origin;
    const result = await startCheckout({
      ownerType,
      ownerId,
      sku: body.sku,
      actorUserId: userId,
      idempotencyKey: body.idempotencyKey,
      callbackUrl: `${base}/api/v1/billing/return`,
    });
    return NextResponse.json(successResponse(result, requestId), { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
