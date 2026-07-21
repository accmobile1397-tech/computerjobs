import { NextRequest, NextResponse } from "next/server";
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
import { getMonitoringSummary } from "@/modules/admin/services/monitoring.service";

/** GET /api/v1/admin/monitoring/summary — read-only (P10-006). */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.MONITORING_READ);
    const data = await getMonitoringSummary();
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
