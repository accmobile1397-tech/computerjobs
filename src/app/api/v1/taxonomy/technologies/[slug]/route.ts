import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  getTechnologyBySlug,
  TaxonomyError,
} from "@/modules/taxonomy/services/taxonomy.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;

  try {
    const technology = await getTechnologyBySlug(slug);
    return NextResponse.json(successResponse(technology, requestId));
  } catch (error) {
    if (error instanceof TaxonomyError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
