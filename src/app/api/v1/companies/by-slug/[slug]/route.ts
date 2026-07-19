import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  CompanyError,
  getPublicCompanyBySlug,
} from "@/modules/companies/services/company.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;

  try {
    const company = await getPublicCompanyBySlug(slug);
    return NextResponse.json(successResponse(company, requestId));
  } catch (error) {
    if (error instanceof CompanyError) {
      const mapped = mapErrorToResponse("NOT_FOUND", requestId, "Not found");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
