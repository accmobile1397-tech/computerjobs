import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  VerificationError,
  verifyEmailToken,
} from "@/modules/auth/services/verification.service";

export async function GET(request: NextRequest) {
  const { requestId, ipAddress } = getRequestMeta(request);
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "توکن الزامی است",
    );
    return NextResponse.json(mapped.body, { status: 400 });
  }

  try {
    const data = await verifyEmailToken({ token, ipAddress });
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof VerificationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const { requestId, ipAddress } = getRequestMeta(request);
  const body = await request.json().catch(() => ({}));
  const token = (body as { token?: string }).token;

  if (!token) {
    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "توکن الزامی است",
    );
    return NextResponse.json(mapped.body, { status: 400 });
  }

  try {
    const data = await verifyEmailToken({ token, ipAddress });
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof VerificationError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
