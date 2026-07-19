import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { loadAuthorizationContext } from "@/modules/authorization/services/authorization.service";
import { findUserById } from "@/modules/users/repositories/user.repository";
import {
  requirePermission,
  AuthorizationError,
} from "@/modules/authorization/services/authorization.service";
import { prisma } from "@/modules/shared/prisma/client";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: 401 });
  }

  const user = await findUserById(userId);
  if (!user) {
    const mapped = mapErrorToResponse("NOT_FOUND", requestId, "Not found");
    return NextResponse.json(mapped.body, { status: 404 });
  }

  const { roles, permissions } = await loadAuthorizationContext(userId);

  return NextResponse.json(
    successResponse(
      {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        primaryType: user.primaryType,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        roles,
        permissions,
        profile: user.jobSeekerProfile ?? user.employerProfile,
      },
      requestId,
    ),
  );
}

export async function PATCH(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: 401 });
  }

  try {
    await requirePermission(userId, "users:update:self");
    const body = await request.json();

    if (body.displayName !== undefined) {
      const user = await findUserById(userId);
      if (user?.jobSeekerProfile) {
        await prisma.jobSeekerProfile.update({
          where: { userId },
          data: { displayName: body.displayName },
        });
      }
      if (user?.employerProfile) {
        await prisma.employerProfile.update({
          where: { userId },
          data: { displayName: body.displayName },
        });
      }
    }

    return NextResponse.json(
      successResponse({ message: "به‌روزرسانی شد" }, requestId),
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
