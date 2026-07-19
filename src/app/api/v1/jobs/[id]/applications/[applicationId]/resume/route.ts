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
  getApplicantResume,
  ResumeError,
} from "@/modules/resumes/services/resume.service";

type Ctx = { params: Promise<{ id: string; applicationId: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id, applicationId } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "resume:read:employer");
    const resume = await getApplicantResume({
      jobId: id,
      applicationId,
      employerUserId: userId,
    });
    return NextResponse.json(successResponse(resume, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ResumeError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
