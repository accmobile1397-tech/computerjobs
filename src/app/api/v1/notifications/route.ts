import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  listInbox,
  NotificationInboxError,
} from "@/modules/notifications/services/inbox.service";
import { listInboxQuerySchema } from "@/modules/notifications/validators/user-api.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    const query = listInboxQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const data = await listInbox(userId, query);
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
    if (error instanceof NotificationInboxError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
