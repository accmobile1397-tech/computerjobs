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
import { JobError, publishJob } from "@/modules/jobs/services/job.service";
import { publishJobSchema } from "@/modules/jobs/validators/job.schema";

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
    await requirePermission(userId, "job:update:own");
    const body = publishJobSchema.parse(await request.json().catch(() => ({})));
    const job = await publishJob({
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
