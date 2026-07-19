import { prisma } from "@/modules/shared/prisma/client";
import {
  getAccessTokenTtlSeconds,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/modules/auth/utils/token.util";
import { hashToken } from "@/modules/auth/utils/crypto.util";
import { loadAuthorizationContext } from "@/modules/authorization/services/authorization.service";
import { findUserById } from "@/modules/users/repositories/user.repository";

export async function createTokenPair(params: {
  userId: string;
  email: string;
  primaryType: string;
  roles: string[];
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}) {
  const accessToken = await signAccessToken({
    sub: params.userId,
    email: params.email,
    primaryType: params.primaryType,
    roles: params.roles,
    permissions: params.permissions,
  });

  const refreshToken = await signRefreshToken(params.userId);
  const tokenHash = hashToken(refreshToken);
  const ttl = Number(process.env.JWT_REFRESH_TTL ?? 604800);

  await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt: new Date(Date.now() + ttl * 1000),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });

  return {
    accessToken,
    expiresIn: getAccessTokenTtlSeconds(),
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const { sub: userId } = await verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new TokenError("TOKEN_INVALID");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await findUserById(userId);
  if (!user || user.status !== "ACTIVE") {
    throw new TokenError("UNAUTHORIZED");
  }

  const { roles, permissions } = await loadAuthorizationContext(userId);
  return createTokenPair({
    userId: user.id,
    email: user.email,
    primaryType: user.primaryType,
    roles,
    permissions,
    ipAddress: stored.ipAddress ?? undefined,
    userAgent: stored.userAgent ?? undefined,
  });
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export class TokenError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
