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
  deleteJob,
  getEmployerJob,
  JobError,
  updateJob,
} from "@/modules/jobs/services/job.service";
import { updateJobSchema } from "@/modules/jobs/validators/job.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:read:own");
    const job = await getEmployerJob(id, userId);
    return NextResponse.json(successResponse(job, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof JobError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:update:own");
    const body = updateJobSchema.parse(await request.json());
    const job = await updateJob({
      jobId: id,
      userId,
      input: body,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(job, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof JobError) {
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:update:own");
    const job = await deleteJob({ jobId: id, userId, ipAddress, userAgent });
    return NextResponse.json(successResponse(job, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof JobError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
