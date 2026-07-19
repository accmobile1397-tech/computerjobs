import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
import {
  BillingError,
} from "@/modules/billing/services/billing-core";
import { unlockContact } from "@/modules/billing/services/contact-unlock.service";

const bodySchema = z.object({
  companyId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "billing:read:own");
    const body = bodySchema.parse(await request.json());
    const unlock = await unlockContact({
      companyId: body.companyId,
      targetUserId: body.targetUserId,
      actorUserId: userId,
    });
    return NextResponse.json(successResponse(unlock, requestId), { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
