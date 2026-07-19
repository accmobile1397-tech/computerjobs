import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  getProvinceBySlug,
  LocationError,
} from "@/modules/location/services/location.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;

  try {
    const province = await getProvinceBySlug(slug);
    return NextResponse.json(successResponse(province, requestId));
  } catch (error) {
    if (error instanceof LocationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
