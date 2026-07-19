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
  createJob,
  JobError,
  listPublicJobs,
} from "@/modules/jobs/services/job.service";
import {
  createJobSchema,
  listJobsQuerySchema,
} from "@/modules/jobs/validators/job.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);

  try {
    const query = listJobsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listPublicJobs(query);
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof JobError) {
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

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "job:create");
    const body = createJobSchema.parse(await request.json());
    const job = await createJob({ userId, input: body, ipAddress, userAgent });
    return NextResponse.json(successResponse(job, requestId), { status: 201 });
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
