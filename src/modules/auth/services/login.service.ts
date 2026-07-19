import { UserStatus } from "@prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { createTokenPair } from "@/modules/auth/services/token.service";
import {
  detectIdentifierType,
  normalizeEmail,
  normalizeMobile,
} from "@/modules/auth/utils/crypto.util";
import { verifyPassword } from "@/modules/auth/utils/password.util";
import { loadAuthorizationContext } from "@/modules/authorization/services/authorization.service";
import {
  findUserByEmail,
  findUserByMobile,
  incrementFailedLogin,
  updateUserLoginSuccess,
} from "@/modules/users/repositories/user.repository";

export async function loginUser(params: {
  identifier: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const idType = detectIdentifierType(params.identifier);

  if (idType === "MOBILE") {
    throw new LoginError("MOBILE_LOGIN_NOT_ENABLED");
  }

  if (idType === "INVALID") {
    throw new LoginError("INVALID_CREDENTIALS");
  }

  const user = await findUserByEmail(normalizeEmail(params.identifier));
  if (!user) {
    throw new LoginError("INVALID_CREDENTIALS");
  }

  if (user.status === UserStatus.PENDING || !user.emailVerified) {
    throw new LoginError("EMAIL_NOT_VERIFIED");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new LoginError("ACCOUNT_SUSPENDED");
  }

  if (user.status === UserStatus.BANNED) {
    throw new LoginError("ACCOUNT_BANNED");
  }

  if (user.status === UserStatus.DELETED) {
    throw new LoginError("INVALID_CREDENTIALS");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new LoginError("ACCOUNT_LOCKED");
  }

  if (user.status === UserStatus.LOCKED) {
    if (!user.lockedUntil || user.lockedUntil <= new Date()) {
      await updateUserLoginSuccess(user.id);
    } else {
      throw new LoginError("ACCOUNT_LOCKED");
    }
  }

  const valid = await verifyPassword(params.password, user.passwordHash);
  if (!valid) {
    await incrementFailedLogin(user);
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    throw new LoginError("INVALID_CREDENTIALS");
  }

  await updateUserLoginSuccess(user.id);
  const { roles, permissions } = await loadAuthorizationContext(user.id);
  const tokens = await createTokenPair({
    userId: user.id,
    email: user.email,
    primaryType: user.primaryType,
    roles,
    permissions,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await writeAuditLog({
    userId: user.id,
    action: "LOGIN_SUCCESS",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      primaryType: user.primaryType,
      status: UserStatus.ACTIVE,
      emailVerified: user.emailVerified,
      roles,
      permissions,
    },
  };
}

export class LoginError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

// Reserved for Phase 2+ mobile login
export async function findUserByLoginIdentifier(identifier: string) {
  const type = detectIdentifierType(identifier);
  if (type === "EMAIL") return findUserByEmail(normalizeEmail(identifier));
  if (type === "MOBILE") return findUserByMobile(normalizeMobile(identifier));
  return null;
}
