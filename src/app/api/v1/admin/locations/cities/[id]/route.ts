import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
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
import {
  LocationError,
  updateCity,
} from "@/modules/location/services/location.service";
import { updateCitySchema } from "@/modules/location/validators/location.schema";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "location:write");
    const body = updateCitySchema.parse(await request.json());
    const city = await updateCity({
      cityId: id,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      adminUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(city, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof LocationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Validation failed");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
