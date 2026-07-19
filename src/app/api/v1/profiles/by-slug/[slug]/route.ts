import { NextRequest, NextResponse } from "next/server";
import { UserPrimaryType } from "@prisma/client";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { verifyAccessToken } from "@/modules/auth/utils/token.util";
import {
  getPublicProfileBySlug,
  ProfileError,
} from "@/modules/users/services/profile.service";

async function getViewerPrimaryType(request: NextRequest): Promise<UserPrimaryType | undefined> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const payload = await verifyAccessToken(header.slice(7));
    return payload.primaryType as UserPrimaryType | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { requestId } = getRequestMeta(request);
  const { slug } = await context.params;
  const viewerPrimaryType = await getViewerPrimaryType(request);

  try {
    const profile = await getPublicProfileBySlug(slug, viewerPrimaryType);
    return NextResponse.json(successResponse(profile, requestId));
  } catch (error) {
    if (error instanceof ProfileError) {
      const mapped = mapErrorToResponse("NOT_FOUND", requestId, "Not found");
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
