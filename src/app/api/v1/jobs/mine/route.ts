import { NextRequest, NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { ZodError, z } from "zod";
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
import { JobError, listEmployerJobs } from "@/modules/jobs/services/job.service";
import { listJobsQuerySchema } from "@/modules/jobs/validators/job.schema";

const employerJobsQuerySchema = listJobsQuerySchema
  .pick({ page: true, limit: true })
  .extend({
    companyId: z.string().uuid().optional(),
    status: z.nativeEnum(JobStatus).optional(),
  });

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:read:own");
    const query = employerJobsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listEmployerJobs({ userId, ...query });
    return NextResponse.json(successResponse(result, requestId));
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
