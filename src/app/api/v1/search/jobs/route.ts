import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { searchJobs } from "@/modules/search/services/job-search.service";
import { searchJobsQuerySchema } from "@/modules/search/validators/search.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);

  try {
    const query = searchJobsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await searchJobs(query);
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Validation failed");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
