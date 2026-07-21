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
import {
  listSystemSettings,
  upsertSystemSetting,
} from "@/modules/admin/services/settings.service";
import { upsertSettingSchema } from "@/modules/admin/validators/platform-api.schema";

/** GET /api/v1/admin/settings — list SystemSetting (masked secrets). */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.SETTINGS_READ);
    const items = await listSystemSettings();
    return NextResponse.json(successResponse({ items }, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

/** PUT /api/v1/admin/settings — upsert one setting + audit. */
export async function PUT(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requireAdminPermission(userId, ADMIN_PERMISSIONS.SETTINGS_WRITE);
    const body = upsertSettingSchema.parse(await request.json());
    const item = await upsertSystemSetting({
      ...body,
      actorUserId: userId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(item, requestId));
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
