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
import { SearchError } from "@/modules/search/services/job-search.service";
import { searchResumes } from "@/modules/search/services/resume-search.service";
import { searchResumesQuerySchema } from "@/modules/search/validators/search.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "search:resumes");
    const query = searchResumesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await searchResumes({ userId, query });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof SearchError) {
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
