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
import {
  ApplicationError,
  listJobApplications,
  submitApplication,
} from "@/modules/jobs/services/application.service";
import { JobError } from "@/modules/jobs/services/job.service";
import {
  listJobsQuerySchema,
  submitApplicationSchema,
} from "@/modules/jobs/validators/job.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:apply");
    const body = submitApplicationSchema.parse(await request.json().catch(() => ({})));
    const application = await submitApplication({
      jobId: id,
      userId,
      input: body,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(application, requestId), { status: 201 });
  } catch (error) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ApplicationError ||
      error instanceof JobError
    ) {
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

export async function GET(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:applications:read:own");
    const query = listJobsQuerySchema
      .pick({ page: true, limit: true })
      .parse(Object.fromEntries(request.nextUrl.searchParams));
    const applications = await listJobApplications({
      jobId: id,
      userId,
      ipAddress,
      userAgent,
      ...query,
    });
    return NextResponse.json(successResponse(applications, requestId));
  } catch (error) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ApplicationError ||
      error instanceof JobError
    ) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
