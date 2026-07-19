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
import {
  rejectSuggestion,
  SuggestionError,
  TaxonomyError,
} from "@/modules/taxonomy/services/suggestion.service";
import { rejectSuggestionSchema } from "@/modules/taxonomy/validators/taxonomy.schema";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "taxonomy:approve");
    const body = rejectSuggestionSchema.parse(await request.json());
    const suggestion = await rejectSuggestion({
      suggestionId: id,
      reviewedById: adminUserId,
      reviewNote: body.reviewNote,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(suggestion, requestId));
  } catch (error) {
    if (
      error instanceof AuthorizationError ||
      error instanceof SuggestionError ||
      error instanceof TaxonomyError
    ) {
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
