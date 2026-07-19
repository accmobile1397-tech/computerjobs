import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { verifyAccessToken } from "@/modules/auth/utils/token.util";
import { randomUUID } from "crypto";

export function getRequestMeta(request: NextRequest) {
  return {
    requestId: randomUUID(),
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}

export async function getBearerUserId(request: NextRequest): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const payload = await verifyAccessToken(header.slice(7));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function mapErrorToResponse(
  code: string,
  requestId: string,
  defaultMessage: string,
) {
  const statusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    INVALID_CREDENTIALS: 401,
    UNAUTHORIZED: 401,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 401,
    EMAIL_NOT_VERIFIED: 403,
    ACCOUNT_LOCKED: 403,
    ACCOUNT_SUSPENDED: 403,
    ACCOUNT_BANNED: 403,
    PERMISSION_DENIED: 403,
    MOBILE_LOGIN_NOT_ENABLED: 403,
    NOT_FOUND: 404,
    EMAIL_ALREADY_EXISTS: 409,
    SLUG_TAKEN: 409,
    SLUG_RESERVED: 400,
    COMPANY_ALREADY_EXISTS: 409,
    NOT_COMPANY_MEMBER: 403,
    COMPANY_SUSPENDED: 403,
    INVITE_EXPIRED: 400,
    INVITE_ALREADY_PENDING: 409,
    INVITE_INVALID: 400,
    INVITE_EMAIL_MISMATCH: 400,
    MEMBER_ALREADY_EXISTS: 409,
    CANNOT_REMOVE_OWNER: 400,
    CANNOT_CHANGE_OWNER_ROLE: 400,
    USER_NOT_ACTIVE: 403,
    LOCATION_NOT_FOUND: 404,
    TAXONOMY_NOT_FOUND: 404,
    SUGGESTION_NOT_PENDING: 409,
    PARENT_NOT_FOUND: 400,
    MERGE_TARGET_INVALID: 400,
    CATEGORY_OFFICIAL_PROTECTED: 403,
    JOB_NOT_FOUND: 404,
    JOB_NOT_ACCEPTING: 409,
    ALREADY_APPLIED: 409,
    COMPANY_NOT_VERIFIED: 403,
    INVALID_JOB_STATE: 409,
    APPLICATION_NOT_FOUND: 404,
  };

  const messageMap: Record<string, string> = {
    INVALID_CREDENTIALS: "ایمیل یا رمز عبور اشتباه است",
    EMAIL_NOT_VERIFIED: "ایمیل تأیید نشده است",
    ACCOUNT_LOCKED: "حساب موقتاً قفل شده است",
    ACCOUNT_SUSPENDED: "حساب تعلیق شده است",
    ACCOUNT_BANNED: "حساب مسدود شده است",
    MOBILE_LOGIN_NOT_ENABLED: "ورود با موبایل در فاز ۱ فعال نیست",
    EMAIL_ALREADY_EXISTS: "این ایمیل قبلاً ثبت شده است",
    PERMISSION_DENIED: "دسترسی مجاز نیست",
    TOKEN_INVALID: "توکن نامعتبر است",
  };

  return {
    status: statusMap[code] ?? 400,
    body: errorResponse(
      code,
      messageMap[code] ?? defaultMessage,
      requestId,
    ),
  };
}

export { successResponse, errorResponse };
