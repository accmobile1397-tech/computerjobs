import {
  CompanyInviteStatus,
  CompanyMemberRole,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { normalizeEmail, generateSecureToken, hashToken } from "@/modules/auth/utils/crypto.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";

export class MemberError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function listCompanyMembers(companyId: string, userId: string) {
  await assertCompanyAccess(companyId, userId);
  return prisma.companyMember.findMany({
    where: { companyId, deletedAt: null },
    include: {
      user: {
        select: { id: true, email: true, slug: true, status: true },
      },
    },
  });
}

export async function removeCompanyMember(params: {
  companyId: string;
  targetUserId: string;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertCompanyAccess(params.companyId, params.actorUserId, [
    CompanyMemberRole.OWNER,
    CompanyMemberRole.ADMIN,
  ]);

  const target = await prisma.companyMember.findFirst({
    where: {
      companyId: params.companyId,
      userId: params.targetUserId,
      deletedAt: null,
    },
  });
  if (!target) throw new MemberError("NOT_FOUND");
  if (target.role === CompanyMemberRole.OWNER) {
    throw new MemberError("CANNOT_REMOVE_OWNER");
  }

  await prisma.companyMember.update({
    where: { id: target.id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    userId: params.actorUserId,
    action: "MEMBER_REMOVED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId, targetUserId: params.targetUserId },
  });
}

export async function updateMemberRole(params: {
  companyId: string;
  targetUserId: string;
  role: CompanyMemberRole;
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertCompanyAccess(params.companyId, params.actorUserId, [CompanyMemberRole.OWNER]);

  const target = await prisma.companyMember.findFirst({
    where: {
      companyId: params.companyId,
      userId: params.targetUserId,
      deletedAt: null,
    },
  });
  if (!target) throw new MemberError("NOT_FOUND");
  if (target.role === CompanyMemberRole.OWNER) {
    throw new MemberError("CANNOT_CHANGE_OWNER_ROLE");
  }

  return prisma.companyMember.update({
    where: { id: target.id },
    data: { role: params.role },
  });
}

export async function createCompanyInvite(params: {
  companyId: string;
  email: string;
  role: CompanyMemberRole;
  invitedBy: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (params.role === CompanyMemberRole.OWNER) {
    throw new MemberError("VALIDATION_ERROR");
  }

  await assertCompanyAccess(params.companyId, params.invitedBy, [
    CompanyMemberRole.OWNER,
    CompanyMemberRole.ADMIN,
  ]);

  const email = normalizeEmail(params.email);

  const existingMember = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: {
      companyMemberships: {
        where: { companyId: params.companyId, deletedAt: null },
      },
    },
  });
  if (existingMember?.companyMemberships.length) {
    throw new MemberError("MEMBER_ALREADY_EXISTS");
  }

  const pending = await prisma.companyInvite.findFirst({
    where: {
      companyId: params.companyId,
      email,
      status: CompanyInviteStatus.PENDING,
    },
  });
  if (pending) throw new MemberError("INVITE_ALREADY_PENDING");

  const plainToken = generateSecureToken();
  const invite = await prisma.companyInvite.create({
    data: {
      companyId: params.companyId,
      email,
      role: params.role,
      tokenHash: hashToken(plainToken),
      invitedBy: params.invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await writeAuditLog({
    userId: params.invitedBy,
    action: "MEMBER_INVITED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId, email },
  });

  console.info("[companies] invite token stub", { inviteId: invite.id, token: plainToken });

  return { inviteId: invite.id, email };
}

export async function acceptCompanyInvite(params: {
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({ where: { id: params.userId, deletedAt: null } });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new MemberError("USER_NOT_ACTIVE");
  }

  const tokenHash = hashToken(params.token);
  const invite = await prisma.companyInvite.findFirst({
    where: { tokenHash, status: CompanyInviteStatus.PENDING },
  });
  if (!invite) throw new MemberError("INVITE_INVALID");
  if (invite.expiresAt < new Date()) throw new MemberError("INVITE_EXPIRED");
  if (invite.email !== user.email) throw new MemberError("INVITE_EMAIL_MISMATCH");

  await prisma.$transaction(async (tx) => {
    await tx.companyMember.create({
      data: {
        companyId: invite.companyId,
        userId: params.userId,
        role: invite.role,
      },
    });

    await tx.companyInvite.update({
      where: { id: invite.id },
      data: {
        status: CompanyInviteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  });

  await writeAuditLog({
    userId: params.userId,
    action: "MEMBER_ACCEPTED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: invite.companyId },
  });

  return { companyId: invite.companyId };
}

export async function revokeCompanyInvite(params: {
  companyId: string;
  inviteId: string;
  userId: string;
}) {
  await assertCompanyAccess(params.companyId, params.userId, [
    CompanyMemberRole.OWNER,
    CompanyMemberRole.ADMIN,
  ]);

  const invite = await prisma.companyInvite.findFirst({
    where: { id: params.inviteId, companyId: params.companyId, status: CompanyInviteStatus.PENDING },
  });
  if (!invite) throw new MemberError("NOT_FOUND");

  return prisma.companyInvite.update({
    where: { id: invite.id },
    data: { status: CompanyInviteStatus.REVOKED },
  });
}

export async function transferCompanyOwnership(params: {
  companyId: string;
  newOwnerUserId: string;
  currentOwnerId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertCompanyAccess(params.companyId, params.currentOwnerId, [CompanyMemberRole.OWNER]);

  const newOwnerMember = await prisma.companyMember.findFirst({
    where: {
      companyId: params.companyId,
      userId: params.newOwnerUserId,
      deletedAt: null,
    },
  });
  if (!newOwnerMember) throw new MemberError("NOT_COMPANY_MEMBER");

  await prisma.$transaction(async (tx) => {
    await tx.companyMember.update({
      where: { id: newOwnerMember.id },
      data: { role: CompanyMemberRole.OWNER },
    });

    const current = await tx.companyMember.findFirst({
      where: {
        companyId: params.companyId,
        userId: params.currentOwnerId,
        deletedAt: null,
      },
    });
    if (current) {
      await tx.companyMember.update({
        where: { id: current.id },
        data: { role: CompanyMemberRole.ADMIN },
      });
    }

    await tx.company.update({
      where: { id: params.companyId },
      data: { ownerId: params.newOwnerUserId },
    });
  });

  await writeAuditLog({
    userId: params.currentOwnerId,
    action: "OWNERSHIP_TRANSFERRED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: {
      companyId: params.companyId,
      newOwnerUserId: params.newOwnerUserId,
    },
  });
}
