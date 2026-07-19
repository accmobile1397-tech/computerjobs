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
  createCategory,
  TaxonomyError,
} from "@/modules/taxonomy/services/taxonomy.service";
import { createCategorySchema } from "@/modules/taxonomy/validators/taxonomy.schema";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const adminUserId = await getBearerUserId(request);

  if (!adminUserId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(adminUserId, "taxonomy:write");
    const body = createCategorySchema.parse(await request.json());
    const category = await createCategory({
      nameFa: body.nameFa,
      nameEn: body.nameEn,
      slug: body.slug,
      description: body.description,
      aliases: body.aliases,
      isOfficial: body.isOfficial,
      adminUserId,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(category, requestId), { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof TaxonomyError) {
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
