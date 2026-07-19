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
import { approveJob, JobError } from "@/modules/jobs/services/job.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "job:approve");
    const job = await approveJob({
      jobId: id,
      adminUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(job, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof JobError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
