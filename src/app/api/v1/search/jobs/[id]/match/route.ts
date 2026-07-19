import { NextRequest, NextResponse } from "next/server";
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
import { SearchError } from "@/modules/search/services/job-search.service";
import { matchJobForSeeker } from "@/modules/search/services/match.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "match:read:own");
    const result = await matchJobForSeeker({ jobId: id, userId });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof SearchError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
