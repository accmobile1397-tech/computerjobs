import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { requirePermission } from "@/modules/authorization/services/authorization.service";
import {
  CompanyError,
  deleteCompany,
  getCompanyById,
  updateCompany,
} from "@/modules/companies/services/company.service";
import { updateCompanySchema } from "@/modules/companies/validators/company.schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { requestId } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "company:read:own");
    const company = await getCompanyById(id, userId);
    return NextResponse.json(successResponse(company, requestId));
  } catch (error) {
    if (error instanceof CompanyError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "company:update:own");
    const body = updateCompanySchema.parse(await request.json());
    const company = await updateCompany({
      companyId: id,
      userId,
      input: body,
      ipAddress,
      userAgent,
    });
    return NextResponse.json(successResponse(company, requestId));
  } catch (error) {
    if (error instanceof CompanyError) {
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const { id } = await context.params;

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    await requirePermission(userId, "company:update:own");
    const company = await deleteCompany({ companyId: id, userId, ipAddress, userAgent });
    return NextResponse.json(successResponse(company, requestId));
  } catch (error) {
    if (error instanceof CompanyError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
