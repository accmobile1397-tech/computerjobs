import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  TokenError,
  refreshAccessToken,
} from "@/modules/auth/services/token.service";

export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);

  try {
    const cookieToken = request.cookies.get("refreshToken")?.value;
    const body = await request.json().catch(() => ({}));
    const refreshToken =
      cookieToken ?? (body as { refreshToken?: string }).refreshToken;

    if (!refreshToken) {
      const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
      return NextResponse.json(mapped.body, { status: 401 });
    }

    const result = await refreshAccessToken(refreshToken);
    const response = NextResponse.json(
      successResponse(
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        requestId,
      ),
    );

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: Number(process.env.JWT_REFRESH_TTL ?? 604800),
    });

    return response;
  } catch (error) {
    if (error instanceof TokenError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
