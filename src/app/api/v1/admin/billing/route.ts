import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { AuthorizationError } from "@/modules/authorization/services/authorization.service";
import {
  ADMIN_PERMISSIONS,
  requireAdminPermission,
} from "@/modules/admin/permissions";
import { BillingError } from "@/modules/billing/services/billing-core";
import {
  getBillingAdminOverview,
  grantBillingAdmin,
  upsertBillingAdminSetting,
  versionPlanFeatureAdmin,
} from "@/modules/admin/services/billing-admin.service";
import {
  billingFeatureVersionSchema,
  billingGrantSchema,
  billingSettingSchema,
} from "@/modules/admin/validators/billing-admin-api.schema";

/** GET /api/v1/admin/billing — thin route (P10-007). */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.BILLING_READ);
    const data = await getBillingAdminOverview();
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

/** POST /api/v1/admin/billing — thin route (P10-007). */
export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.BILLING_WRITE);
    const body = await request.json();
    const action = body.action as string;

    if (action === "grant") {
      const input = billingGrantSchema.parse(body);
      const result = await grantBillingAdmin({
        ...input,
        actorUserId: userId,
      });
      return NextResponse.json(successResponse(result, requestId));
    }

    if (action === "setting") {
      const input = billingSettingSchema.parse(body);
      const row = await upsertBillingAdminSetting({
        ...input,
        actorUserId: userId,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(successResponse(row, requestId));
    }

    if (action === "versionFeature") {
      const input = billingFeatureVersionSchema.parse(body);
      const created = await versionPlanFeatureAdmin({
        ...input,
        actorUserId: userId,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(successResponse(created, requestId), {
        status: 201,
      });
    }

    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "Unknown action",
    );
    return NextResponse.json(mapped.body, { status: mapped.status });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse(
        "VALIDATION_ERROR",
        requestId,
        "Validation failed",
      );
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
