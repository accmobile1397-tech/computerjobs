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
  createCompanyInvite,
  MemberError,
} from "@/modules/companies/services/member.service";
import { inviteMemberSchema } from "@/modules/companies/validators/company.schema";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "company:invite");
    const body = inviteMemberSchema.parse(await request.json());
    const invite = await createCompanyInvite({
      companyId: id,
      email: body.email,
      role: body.role,
      invitedBy: userId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(invite, requestId), { status: 201 });
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
