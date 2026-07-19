import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { requirePermission } from "@/modules/authorization/services/authorization.service";
import { listMyCompanies } from "@/modules/companies/services/company.service";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  await requirePermission(userId, "company:read:own");
  const companies = await listMyCompanies(userId);
  return NextResponse.json(successResponse(companies, requestId));
}
