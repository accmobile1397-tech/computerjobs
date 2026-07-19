import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { hashToken } from "@/modules/auth/utils/crypto.util";
import { verifyUserEmail } from "@/modules/users/repositories/user.repository";

export async function verifyEmailToken(params: {
  token: string;
  ipAddress?: string;
}) {
  const tokenHash = hashToken(params.token);
  const record = await prisma.verificationToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
      type: "EMAIL",
    },
  });

  if (!record) throw new VerificationError("TOKEN_INVALID");

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await verifyUserEmail(record.userId);
  await writeAuditLog({
    userId: record.userId,
    action: "EMAIL_VERIFIED",
    ipAddress: params.ipAddress,
  });

  return { message: "ایمیل با موفقیت تأیید شد" };
}

export class VerificationError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
