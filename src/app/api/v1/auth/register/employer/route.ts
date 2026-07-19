import { NextRequest, NextResponse } from "next/server";
import { UserPrimaryType } from "@prisma/client";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  RegisterError,
  registerUser,
} from "@/modules/auth/services/register.service";
import { registerEmployerSchema } from "@/modules/auth/validators/auth.schema";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);

  try {
    const body = registerEmployerSchema.parse(await request.json());
    const data = await registerUser({
      email: body.email,
      password: body.password,
      displayName: body.displayName,
      companyName: body.companyName,
      primaryType: UserPrimaryType.EMPLOYER,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      successResponse(
        {
          ...data,
          message: "ایمیل تأیید ارسال شد",
        },
        requestId,
      ),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RegisterError) {
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
