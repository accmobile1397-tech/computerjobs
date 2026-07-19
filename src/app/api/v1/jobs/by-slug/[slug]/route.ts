import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  getPublicJobBySlug,
  JobError,
} from "@/modules/jobs/services/job.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;

  try {
    const job = await getPublicJobBySlug(slug);
    return NextResponse.json(successResponse(job, requestId));
  } catch (error) {
    if (error instanceof JobError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
