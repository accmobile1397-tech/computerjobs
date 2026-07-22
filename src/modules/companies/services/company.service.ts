import {
  CompanyMemberRole,
  CompanyStatus,
  CompanyVerificationStatus,
  UserPrimaryType,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  isReservedSlug,
  slugFromName,
  validateSlugFormat,
  validateWebsiteUrl,
} from "@/modules/shared/utils/slug.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { assertActiveCategory, TaxonomyError } from "@/modules/taxonomy/services/taxonomy.service";
import type {
  CreateCompanyInput,
  ListCompaniesQuery,
  UpdateCompanyInput,
} from "@/modules/companies/validators/company.schema";

export class CompanyError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function assertCompanySlugAvailable(slug: string, excludeCompanyId?: string) {
  if (!validateSlugFormat(slug) || isReservedSlug(slug)) {
    throw new CompanyError("SLUG_RESERVED");
  }
  const existing = await prisma.company.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeCompanyId ? { NOT: { id: excludeCompanyId } } : {}),
    },
  });
  if (existing) throw new CompanyError("SLUG_TAKEN");
}

async function getMemberRole(companyId: string, userId: string) {
  return prisma.companyMember.findFirst({
    where: { companyId, userId, deletedAt: null },
  });
}

export async function assertCompanyAccess(
  companyId: string,
  userId: string,
  allowed: CompanyMemberRole[] = [
    CompanyMemberRole.OWNER,
    CompanyMemberRole.ADMIN,
    CompanyMemberRole.MEMBER,
  ],
) {
  const member = await getMemberRole(companyId, userId);
  if (!member || !allowed.includes(member.role)) {
    throw new CompanyError("NOT_COMPANY_MEMBER");
  }
  return member;
}

export async function createCompany(params: {
  userId: string;
  input: CreateCompanyInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.userId, deletedAt: null, primaryType: UserPrimaryType.EMPLOYER },
    include: { employerProfile: true },
  });
  if (!user?.employerProfile) throw new CompanyError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new CompanyError("USER_NOT_ACTIVE");

  if (user.employerProfile.companyId) {
    throw new CompanyError("COMPANY_ALREADY_EXISTS");
  }

  if (params.input.websiteUrl && !validateWebsiteUrl(params.input.websiteUrl)) {
    throw new CompanyError("VALIDATION_ERROR");
  }

  const slug =
    params.input.slug ??
    slugFromName(params.input.name, user.id.slice(0, 6));
  await assertCompanySlugAvailable(slug);

  const company = await prisma.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        name: params.input.name,
        slug,
        description: params.input.description,
        logoUrl: params.input.logoUrl,
        websiteUrl: params.input.websiteUrl,
        employeeCountRange: params.input.employeeCountRange,
        industryLabel: params.input.industryLabel,
        ownerId: params.userId,
      },
    });

    await tx.companyMember.create({
      data: {
        companyId: created.id,
        userId: params.userId,
        role: CompanyMemberRole.OWNER,
      },
    });

    await tx.employerProfile.update({
      where: { userId: params.userId },
      data: { companyId: created.id },
    });

    return created;
  });

  await writeAuditLog({
    userId: params.userId,
    action: "COMPANY_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: company.id },
  });

  return company;
}

export async function listMyCompanies(userId: string) {
  const memberships = await prisma.companyMember.findMany({
    where: { userId, deletedAt: null, company: { deletedAt: null } },
    include: { company: true },
  });
  return memberships.map((m) => ({ role: m.role, company: m.company }));
}

export async function getCompanyById(companyId: string, userId: string) {
  await assertCompanyAccess(companyId, userId);
  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
  });
  if (!company) throw new CompanyError("NOT_FOUND");
  if (company.status === CompanyStatus.SUSPENDED) {
    throw new CompanyError("COMPANY_SUSPENDED");
  }
  return company;
}

export async function updateCompany(params: {
  companyId: string;
  userId: string;
  input: UpdateCompanyInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertCompanyAccess(params.companyId, params.userId, [
    CompanyMemberRole.OWNER,
    CompanyMemberRole.ADMIN,
  ]);

  const company = await prisma.company.findFirst({
    where: { id: params.companyId, deletedAt: null },
  });
  if (!company) throw new CompanyError("NOT_FOUND");

  if (params.input.slug && params.input.slug !== company.slug) {
    await assertCompanySlugAvailable(params.input.slug, params.companyId);
  }

  if (params.input.websiteUrl && !validateWebsiteUrl(params.input.websiteUrl)) {
    throw new CompanyError("VALIDATION_ERROR");
  }

  if (params.input.categoryId) {
    try {
      await assertActiveCategory(params.input.categoryId);
    } catch (error) {
      if (error instanceof TaxonomyError) throw new CompanyError(error.code);
      throw error;
    }
  }

  const updated = await prisma.company.update({
    where: { id: params.companyId },
    data: params.input,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "COMPANY_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId },
  });

  return updated;
}

export async function deleteCompany(params: {
  companyId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertCompanyAccess(params.companyId, params.userId, [CompanyMemberRole.OWNER]);

  const updated = await prisma.company.update({
    where: { id: params.companyId },
    data: {
      status: CompanyStatus.DELETED,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId: params.userId,
    action: "COMPANY_DELETED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId },
  });

  return updated;
}

export function toPublicCompany(company: {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  employeeCountRange: string | null;
  industryLabel: string | null;
}) {
  return {
    name: company.name,
    slug: company.slug,
    description: company.description,
    logoUrl: company.logoUrl,
    websiteUrl: company.websiteUrl,
    employeeCountRange: company.employeeCountRange,
    industryLabel: company.industryLabel,
  };
}

export async function getPublicCompanyBySlug(slug: string) {
  const company = await prisma.company.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: CompanyStatus.ACTIVE,
      verificationStatus: CompanyVerificationStatus.VERIFIED,
    },
  });
  if (!company) throw new CompanyError("NOT_FOUND");
  return toPublicCompany(company);
}

/** Public company list: ACTIVE + VERIFIED only (same gate as getPublicCompanyBySlug). */
export async function listPublicCompanies(query: ListCompaniesQuery = {}) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const where = {
    deletedAt: null,
    status: CompanyStatus.ACTIVE,
    verificationStatus: CompanyVerificationStatus.VERIFIED,
  } as const;

  const [rows, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        employeeCountRange: true,
        industryLabel: true,
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data: rows.map(toPublicCompany),
    meta: { page, limit, total },
  };
}

export async function updateCompanyVerification(params: {
  companyId: string;
  status: CompanyVerificationStatus;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const company = await prisma.company.findFirst({
    where: { id: params.companyId, deletedAt: null },
  });
  if (!company) throw new CompanyError("NOT_FOUND");

  const updated = await prisma.company.update({
    where: { id: params.companyId },
    data: {
      verificationStatus: params.status,
      verifiedAt: params.status === CompanyVerificationStatus.VERIFIED ? new Date() : null,
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "COMPANY_VERIFICATION_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId, status: params.status },
  });

  return updated;
}

export async function updateCompanyStatus(params: {
  companyId: string;
  status: CompanyStatus;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const company = await prisma.company.findFirst({
    where: { id: params.companyId, deletedAt: null },
  });
  if (!company) throw new CompanyError("NOT_FOUND");

  const updated = await prisma.company.update({
    where: { id: params.companyId },
    data: {
      status: params.status,
      deletedAt: params.status === CompanyStatus.DELETED ? new Date() : null,
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "COMPANY_STATUS_CHANGED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { companyId: params.companyId, status: params.status },
  });

  return updated;
}
