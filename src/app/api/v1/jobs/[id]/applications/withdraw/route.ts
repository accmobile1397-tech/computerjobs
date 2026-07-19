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
import {
  ApplicationError,
  withdrawApplication,
} from "@/modules/jobs/services/application.service";
import { JobError } from "@/modules/jobs/services/job.service";

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
    const application = await withdrawApplication({
      jobId: id,
      userId,
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
    throw error;
  }
}
