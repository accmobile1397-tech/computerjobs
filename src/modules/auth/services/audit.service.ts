import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";

export async function writeAuditLog(params: {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata ?? undefined,
    },
  });
}
