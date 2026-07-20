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
  listTemplatesAdmin,
  NotificationAdminError,
  upsertTemplateAdmin,
} from "@/modules/notifications/services/admin.service";
import {
  adminListQuerySchema,
  upsertTemplateSchema,
} from "@/modules/notifications/validators/admin-api.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireNotificationAdmin(userId);
    const query = adminListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const data = await listTemplatesAdmin(query);
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    return mapAdminError(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireNotificationAdmin(userId);
    const body = upsertTemplateSchema.parse(await request.json());
    const item = await upsertTemplateAdmin(body);
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
