import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { EmployerVerificationStatus } from "@prisma/client";
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
  ProfileError,
  updateEmployerVerification,
} from "@/modules/users/services/profile.service";
import { z } from "zod";

const schema = z.object({
  status: z.nativeEnum(EmployerVerificationStatus),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);
  const { userId } = await context.params;

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "company:verify");
    const body = schema.parse(await request.json());
    const profile = await updateEmployerVerification({
      targetUserId: userId,
      status: body.status,
      adminUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(profile, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ProfileError) {
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
