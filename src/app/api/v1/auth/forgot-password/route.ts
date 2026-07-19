import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { requestPasswordReset } from "@/modules/auth/services/password.service";
import { forgotPasswordSchema } from "@/modules/auth/validators/auth.schema";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress } = getRequestMeta(request);

  try {
    const body = forgotPasswordSchema.parse(await request.json());
    const data = await requestPasswordReset({
      email: body.email,
      ipAddress,
    });
    return NextResponse.json(successResponse(data, requestId));
  } catch {
    const mapped = mapErrorToResponse(
      "VALIDATION_ERROR",
      requestId,
      "ورودی نامعتبر",
    );
    return NextResponse.json(mapped.body, { status: 400 });
  }
}
