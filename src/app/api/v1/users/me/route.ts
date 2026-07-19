import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { loadAuthorizationContext } from "@/modules/authorization/services/authorization.service";
import { findUserById } from "@/modules/users/repositories/user.repository";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  const user = await findUserById(userId);
  if (!user) {
    const mapped = mapErrorToResponse("NOT_FOUND", requestId, "Not found");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  const { roles, permissions } = await loadAuthorizationContext(userId);

  return NextResponse.json(
    successResponse(
      {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        slug: user.slug,
        primaryType: user.primaryType,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        roles,
        permissions,
        jobSeekerProfile: user.jobSeekerProfile,
        employerProfile: user.employerProfile,
      },
      requestId,
    ),
  );
}

export async function PATCH(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  return NextResponse.json(
    mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "Use profile-specific endpoints",
    ).body,
    { status: 400 },
  );
}
