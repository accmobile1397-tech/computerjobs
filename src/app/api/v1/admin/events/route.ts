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
import { listDomainEvents } from "@/modules/admin/services/event-viewer.service";
import { listEventsQuerySchema } from "@/modules/admin/validators/platform-api.schema";

/** GET /api/v1/admin/events — DomainEventLog viewer (P10-006 · C-010-5). */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.EVENTS_READ);
    const query = listEventsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listDomainEvents(query);
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
