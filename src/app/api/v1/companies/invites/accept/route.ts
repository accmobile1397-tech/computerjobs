import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  acceptCompanyInvite,
  MemberError,
} from "@/modules/companies/services/member.service";
import { acceptInviteSchema } from "@/modules/companies/validators/company.schema";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    const body = acceptInviteSchema.parse(await request.json());
    const result = await acceptCompanyInvite({
      userId,
      token: body.token,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof MemberError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof ZodError) {
      const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "Validation failed");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
