import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import {
  AuthorizationError,
  requirePermission,
} from "@/modules/authorization/services/authorization.service";
import { ResumeError } from "@/modules/resumes/services/resume.service";

type Handler = (ctx: {
  userId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  request: NextRequest;
  params: Record<string, string>;
}) => Promise<unknown>;

export async function withResumeMutation(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  permission: string,
  handler: Handler,
) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, permission);
    const params = await context.params;
    const data = await handler({
      userId,
      requestId,
      ipAddress,
      userAgent,
      request,
      params,
    });
    return NextResponse.json(successResponse(data, requestId));
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ResumeError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    if (error instanceof ZodError) {
      const code = error.issues[0]?.message;
      const mapped = mapErrorToResponse(
        code === "INVALID_DATE_RANGE" ||
          code === "DUPLICATE_SKILL" ||
          code === "DUPLICATE_TECHNOLOGY"
          ? code
          : "VALIDATION_ERROR",
        requestId,
        "Validation failed",
      );
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
