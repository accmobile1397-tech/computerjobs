import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { requirePermission } from "@/modules/authorization/services/authorization.service";
import {
  MemberError,
  revokeCompanyInvite,
} from "@/modules/companies/services/member.service";
import { CompanyError } from "@/modules/companies/services/company.service";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; inviteId: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id, inviteId } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "company:invite");
    const invite = await revokeCompanyInvite({ companyId: id, inviteId, userId });
    return NextResponse.json(successResponse(invite, requestId));
  } catch (error) {
    if (error instanceof MemberError || error instanceof CompanyError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
