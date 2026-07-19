import {
  UserPrimaryType,
  UserStatus,
  type User,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
}

export async function findUserByMobile(mobile: string) {
  return prisma.user.findFirst({
    where: { mobile, deletedAt: null },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      jobSeekerProfile: true,
      employerProfile: { include: { company: true } },
    },
  });
}

export async function createUser(data: {
  email: string;
  mobile?: string;
  passwordHash: string;
  primaryType: UserPrimaryType;
  status?: UserStatus;
}) {
  return prisma.user.create({ data });
}

export async function assignRoleBySlug(userId: string, roleSlug: string) {
  const role = await prisma.role.findFirst({
    where: { slug: roleSlug, deletedAt: null },
  });
  if (!role) throw new Error(`Role not found: ${roleSlug}`);

  return prisma.userRole.upsert({
    where: {
      userId_roleId: { userId, roleId: role.id },
    },
    create: { userId, roleId: role.id },
    update: { deletedAt: null },
  });
}

export async function updateUserLoginSuccess(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      status: UserStatus.ACTIVE,
    },
  });
}

export async function incrementFailedLogin(user: User) {
  const attempts = user.failedLoginAttempts + 1;
  const maxAttempts = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS ?? 5);
  const lockMinutes = Number(process.env.AUTH_LOCK_MINUTES ?? 15);

  const data: {
    failedLoginAttempts: number;
    lockedUntil?: Date;
    status?: UserStatus;
  } = { failedLoginAttempts: attempts };

  if (attempts >= maxAttempts) {
    data.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    data.status = UserStatus.LOCKED;
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });

  if (updated.status === UserStatus.LOCKED) {
    const { writeAuditLog } = await import("@/modules/auth/services/audit.service");
    await writeAuditLog({
      userId: user.id,
      action: "USER_LOCKED",
      metadata: { attempts },
    });
  }

  return updated;
}

export async function verifyUserEmail(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
  });
}
