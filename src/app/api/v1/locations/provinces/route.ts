import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  listProvinces,
  LocationError,
} from "@/modules/location/services/location.service";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const activeParam = request.nextUrl.searchParams.get("active");
  const activeOnly = activeParam === null ? true : activeParam !== "false";

  try {
    const provinces = await listProvinces(activeOnly);
    return NextResponse.json(successResponse(provinces, requestId));
  } catch (error) {
    if (error instanceof LocationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
