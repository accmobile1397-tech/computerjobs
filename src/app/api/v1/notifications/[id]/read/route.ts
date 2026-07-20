import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  markNotificationRead,
  NotificationInboxError,
} from "@/modules/notifications/services/inbox.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    const { id } = await context.params;
    const data = await markNotificationRead(userId, id);
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof NotificationInboxError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
