import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { LoginError, loginUser } from "@/modules/auth/services/login.service";
import { loginSchema } from "@/modules/auth/validators/auth.schema";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);

  try {
    const body = loginSchema.parse(await request.json());
    const result = await loginUser({
      identifier: body.identifier,
      password: body.password,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json(
      successResponse(
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
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
    if (error instanceof LoginError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "ورودی نامعتبر",
    );
    return NextResponse.json(mapped.body, { status: 400 });
  }
}
