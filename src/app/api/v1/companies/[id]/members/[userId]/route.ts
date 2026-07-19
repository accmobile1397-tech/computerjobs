import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { requirePermission } from "@/modules/authorization/services/authorization.service";
import {
  MemberError,
  removeCompanyMember,
  updateMemberRole,
} from "@/modules/companies/services/member.service";
import { updateMemberRoleSchema } from "@/modules/companies/validators/company.schema";

type RouteContext = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const actorUserId = await getBearerUserId(request);
  const { id, userId: targetUserId } = await context.params;

  if (!actorUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(actorUserId, "company:members:manage");
    await removeCompanyMember({
      companyId: id,
      targetUserId,
      actorUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse({ removed: true }, requestId));
  } catch (error) {
    if (error instanceof MemberError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const actorUserId = await getBearerUserId(request);
  const { id, userId: targetUserId } = await context.params;

  if (!actorUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(actorUserId, "company:members:manage");
    const body = updateMemberRoleSchema.parse(await request.json());
    const member = await updateMemberRole({
      companyId: id,
      targetUserId,
      role: body.role,
      actorUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(member, requestId));
  } catch (error) {
    if (error instanceof MemberError) {
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
