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
import { prisma } from "@/modules/shared/prisma/client";
import {
  createSuggestion,
  listSuggestions,
  SuggestionError,
  TaxonomyError,
} from "@/modules/taxonomy/services/suggestion.service";
import {
  createSuggestionSchema,
  listSuggestionsQuerySchema,
} from "@/modules/taxonomy/validators/taxonomy.schema";

export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "taxonomy:read");
    const query = listSuggestionsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listSuggestions(query);
    return NextResponse.json(successResponse(result, requestId));
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

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "taxonomy:write");
    const body = createSuggestionSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { primaryType: true },
    });
    if (!user) {
      const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    const suggestion = await createSuggestion({
      entityType: body.entityType,
      proposedNameFa: body.proposedNameFa,
      proposedNameEn: body.proposedNameEn,
      proposedSlug: body.proposedSlug,
      proposedAliases: body.proposedAliases,
      parentId: body.parentId,
      source: body.source,
      aiMetadata: body.aiMetadata,
      createdById: adminUserId,
      creatorPrimaryType: user.primaryType,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(suggestion, requestId), { status: 201 });
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
