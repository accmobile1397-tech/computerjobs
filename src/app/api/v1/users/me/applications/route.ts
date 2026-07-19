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
import { ApplicationError, listSeekerApplications } from "@/modules/jobs/services/application.service";
import { listJobsQuerySchema } from "@/modules/jobs/validators/job.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:apply");
    const query = listJobsQuerySchema
      .pick({ page: true, limit: true })
      .parse(Object.fromEntries(request.nextUrl.searchParams));
    const applications = await listSeekerApplications({ userId, ...query });
    return NextResponse.json(successResponse(applications, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ApplicationError) {
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
