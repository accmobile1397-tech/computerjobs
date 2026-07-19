import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  ProfileError,
  updateUserSlug,
} from "@/modules/users/services/profile.service";
import { updateUserSlugSchema } from "@/modules/users/validators/profile.schema";

export async function PATCH(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    const body = updateUserSlugSchema.parse(await request.json());
    const result = await updateUserSlug({
      userId,
      slug: body.slug,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof ProfileError) {
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
