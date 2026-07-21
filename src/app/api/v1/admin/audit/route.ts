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
import { listAuditLogs } from "@/modules/admin/services/audit-viewer.service";
import { listAuditQuerySchema } from "@/modules/admin/validators/audit-api.schema";

/** GET /api/v1/admin/audit — thin read-only viewer (P10-005). */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.AUDIT_READ);
    const query = listAuditQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listAuditLogs(query);
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse(
        "VALIDATION_ERROR",
        requestId,
        "Validation failed",
      );
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
