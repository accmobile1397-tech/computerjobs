import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
import { improveJobDescription } from "@/modules/ai/jobs/job-improve.service";
import { AiError } from "@/modules/ai/types/ai.types";

const bodySchema = z.object({
  jobId: z.string().uuid(),
  companyId: z.string().uuid(),
  draft: z.string().max(20000).optional(),
  requestId: z.string().min(8).max(120).optional(),
  maxCredits: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "ai:use:company");
    const body = bodySchema.parse(await request.json());
    const result = await improveJobDescription({
      jobId: body.jobId,
      companyId: body.companyId,
      userId,
      draft: body.draft,
      requestId: body.requestId ?? requestId,
      maxCredits: body.maxCredits,
    });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof AiError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof z.ZodError) {
      const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Invalid body");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
