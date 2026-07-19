import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { revokeRefreshToken } from "@/modules/auth/services/token.service";
import { writeAuditLog } from "@/modules/auth/services/audit.service";

export async function POST(request: NextRequest) {
  const { requestId, ipAddress, userAgent } = getRequestMeta(request);
  const userId = await getBearerUserId(request);
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken) await revokeRefreshToken(refreshToken);

  if (userId) {
    await writeAuditLog({
      userId,
      action: "LOGOUT",
      ipAddress,
      userAgent,
    });
  }

  const response = NextResponse.json(
    successResponse({ message: "خروج موفق" }, requestId),
  );
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/api/v1/auth" });
  return response;
}
