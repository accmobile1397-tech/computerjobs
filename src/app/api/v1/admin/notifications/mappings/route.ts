import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
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
import { NOTIFICATION_PERMISSIONS } from "@/modules/notifications/permissions";
import {
  listMappingsAdmin,
  NotificationAdminError,
  upsertMappingAdmin,
} from "@/modules/notifications/services/admin.service";
import {
  adminListQuerySchema,
  upsertMappingSchema,
} from "@/modules/notifications/validators/admin-api.schema";

const listMappingsQuerySchema = adminListQuerySchema.extend({
  configVersion: z.coerce.number().int().min(1).optional(),
});

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, NOTIFICATION_PERMISSIONS.ADMIN);
    const query = listMappingsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const data = await listMappingsAdmin(query);
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
    await requirePermission(userId, NOTIFICATION_PERMISSIONS.ADMIN);
    const body = upsertMappingSchema.parse(await request.json());
    const item = await upsertMappingAdmin(body);
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
