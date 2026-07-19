import { UserPrimaryType, UserStatus } from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { hashPassword } from "@/modules/auth/utils/password.util";
import {
  generateSecureToken,
  hashToken,
  normalizeEmail,
} from "@/modules/auth/utils/crypto.util";
import { DEFAULT_ROLE_SLUG_BY_PRIMARY_TYPE } from "@/modules/shared/config/role-defaults";

export async function registerUser(params: {
  email: string;
  password: string;
  primaryType: UserPrimaryType;
  displayName?: string;
  companyName?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const email = normalizeEmail(params.email);

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (existing) {
    throw new RegisterError("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(params.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        primaryType: params.primaryType,
        status: UserStatus.PENDING,
      },
    });

    if (params.primaryType === UserPrimaryType.JOB_SEEKER) {
      await tx.jobSeekerProfile.create({
        data: {
          userId: created.id,
          displayName: params.displayName,
        },
      });
    }

    if (params.primaryType === UserPrimaryType.EMPLOYER) {
      let companyId: string | undefined;
      if (params.companyName) {
        const company = await tx.company.create({
          data: {
            name: params.companyName,
            ownerId: created.id,
          },
        });
        await tx.companyMember.create({
          data: {
            companyId: company.id,
            userId: created.id,
            role: "OWNER",
          },
        });
        companyId = company.id;
      }

      await tx.employerProfile.create({
        data: {
          userId: created.id,
          displayName: params.displayName,
          companyId,
        },
      });
    }

    const roleSlug = DEFAULT_ROLE_SLUG_BY_PRIMARY_TYPE[params.primaryType];
    const role = await tx.role.findFirst({
      where: { slug: roleSlug, deletedAt: null },
    });
    if (role) {
      await tx.userRole.create({
        data: { userId: created.id, roleId: role.id },
      });
    }

    const plainToken = generateSecureToken();
    await tx.verificationToken.create({
      data: {
        userId: created.id,
        tokenHash: hashToken(plainToken),
        type: "EMAIL",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return { user: created, verificationToken: plainToken };
  });

  await writeAuditLog({
    userId: user.user.id,
    action: "REGISTER",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { primaryType: params.primaryType },
  });

  // Phase 1 stub — log token (no real email)
  console.info("[auth] verification token stub", {
    userId: user.user.id,
    token: user.verificationToken,
  });

  return {
    userId: user.user.id,
    email: user.user.email,
    status: user.user.status,
  };
}

export class RegisterError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
