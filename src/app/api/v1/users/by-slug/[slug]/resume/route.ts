import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  getPublicResumeByUserSlug,
  ResumeError,
} from "@/modules/resumes/services/resume.service";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;

  try {
    const data = await getPublicResumeByUserSlug(slug);
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof ResumeError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
