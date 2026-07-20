import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { AuthorizationError } from "@/modules/authorization/services/authorization.service";
import { requireNotificationAdmin } from "@/modules/notifications/services/admin-auth";
import {
  NotificationAdminError,
  patchMappingAdmin,
} from "@/modules/notifications/services/admin.service";
import { patchMappingSchema } from "@/modules/notifications/validators/admin-api.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireNotificationAdmin(userId);
    const { id } = await context.params;
    const body = patchMappingSchema.parse(await request.json());
    const item = await patchMappingAdmin(id, body);
    return NextResponse.json(successResponse({ item }, requestId));
  } catch (error) {
    return mapAdminError(error, requestId);
  }
}

function mapAdminError(error: unknown, requestId: string) {
  if (error instanceof ZodError) {
    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "Validation failed"
    );
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  if (error instanceof AuthorizationError) {
    const mapped = mapErrorToResponse(error.code, requestId, error.message);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  if (error instanceof NotificationAdminError) {
    const mapped = mapErrorToResponse(error.code, requestId, error.message);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  throw error;
}
