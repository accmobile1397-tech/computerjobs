import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  listCitiesByProvinceSlug,
  LocationError,
} from "@/modules/location/services/location.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;
  const activeParam = request.nextUrl.searchParams.get("active");
  const activeOnly = activeParam === null ? true : activeParam !== "false";

  try {
    const cities = await listCitiesByProvinceSlug(slug, activeOnly);
    return NextResponse.json(successResponse(cities, requestId));
  } catch (error) {
    if (error instanceof LocationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
