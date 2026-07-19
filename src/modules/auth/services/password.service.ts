import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { revokeAllRefreshTokens } from "@/modules/auth/services/token.service";
import {
  generateSecureToken,
  hashToken,
  normalizeEmail,
} from "@/modules/auth/utils/crypto.util";
import { hashPassword, verifyPassword } from "@/modules/auth/utils/password.util";
import { findUserByEmail } from "@/modules/users/repositories/user.repository";

export async function requestPasswordReset(params: {
  email: string;
  ipAddress?: string;
}) {
  const user = await findUserByEmail(normalizeEmail(params.email));
  if (user) {
    const plainToken = generateSecureToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(plainToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    console.info("[auth] password reset token stub", {
      userId: user.id,
      token: plainToken,
    });
    await writeAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_REQUEST",
      ipAddress: params.ipAddress,
    });
  }
  return { message: "اگر ایمیل موجود باشد، لینک ارسال می‌شود" };
}

export async function resetPassword(params: {
  token: string;
  password: string;
  ipAddress?: string;
}) {
  const tokenHash = hashToken(params.token);
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new PasswordError("TOKEN_INVALID");

  const passwordHash = await hashPassword(params.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await revokeAllRefreshTokens(record.userId);
  await writeAuditLog({
    userId: record.userId,
    action: "PASSWORD_RESET",
    ipAddress: params.ipAddress,
  });

  return { message: "رمز عبور با موفقیت تغییر کرد" };
}

export async function changePassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  ipAddress?: string;
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.userId, deletedAt: null },
  });
  if (!user) throw new PasswordError("UNAUTHORIZED");

  const valid = await verifyPassword(params.currentPassword, user.passwordHash);
  if (!valid) throw new PasswordError("INVALID_CREDENTIALS");

  const passwordHash = await hashPassword(params.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await writeAuditLog({
    userId: user.id,
    action: "PASSWORD_CHANGED",
    ipAddress: params.ipAddress,
  });

  return { message: "رمز عبور تغییر کرد" };
}

export class PasswordError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
