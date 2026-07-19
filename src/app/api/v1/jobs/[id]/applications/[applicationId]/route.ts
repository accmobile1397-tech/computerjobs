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
  updateApplicationStatus,
} from "@/modules/jobs/services/application.service";
import { JobError } from "@/modules/jobs/services/job.service";
import { updateApplicationStatusSchema } from "@/modules/jobs/validators/job.schema";

type RouteContext = { params: Promise<{ id: string; applicationId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id, applicationId } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:applications:manage:own");
    const body = updateApplicationStatusSchema.parse(await request.json());
    const application = await updateApplicationStatus({
      jobId: id,
      applicationId,
      userId,
      input: body,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(application, requestId));
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
