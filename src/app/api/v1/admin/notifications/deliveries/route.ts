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
  listDeliveriesAdmin,
  NotificationAdminError,
} from "@/modules/notifications/services/admin.service";
import { listDeliveriesQuerySchema } from "@/modules/notifications/validators/admin-api.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireNotificationAdmin(userId);
    const query = listDeliveriesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const data = await listDeliveriesAdmin(query);
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
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
}
