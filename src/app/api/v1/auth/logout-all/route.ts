import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { revokeAllRefreshTokens } from "@/modules/auth/services/token.service";
import { writeAuditLog } from "@/modules/auth/services/audit.service";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);

  if (!userId) {
    const mapped = mapErrorToResponse("UNAUTHORIZED", requestId, "Unauthorized");
    return NextResponse.json(mapped.body, { status: 401 });
  }

  await revokeAllRefreshTokens(userId);
  await writeAuditLog({
    userId,
    action: "LOGOUT_ALL",
    ipAddress,
    userAgent,
  });

  const response = NextResponse.json(
    successResponse({ message: "همه نشست‌ها بسته شد" }, requestId),
  );
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/api/v1/auth" });
  return response;
}
