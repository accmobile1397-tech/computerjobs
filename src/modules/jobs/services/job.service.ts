import {
  BillingOwnerType,
  CompanyMemberRole,
  CompanyStatus,
  CompanyVerificationStatus,
  JobStatus,
  UserPrimaryType,
  UserStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  isReservedSlug,
  slugFromName,
  validateSlugFormat,
} from "@/modules/shared/utils/slug.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import { assertActiveCity, LocationError } from "@/modules/location/services/location.service";
import { assertActiveCategory, TaxonomyError } from "@/modules/taxonomy/services/taxonomy.service";
import { FEATURE_KEYS } from "@/modules/billing/constants";
import {
  BillingError,
} from "@/modules/billing/services/billing-core";
import { consumeQuota } from "@/modules/billing/services/quota.service";
import type {
  CreateJobInput,
  ListJobsQuery,
  PublishJobInput,
  UpdateJobInput,
} from "@/modules/jobs/validators/job.schema";

export class JobError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

const PUBLIC_COMPANY_WHERE = {
  deletedAt: null,
  status: CompanyStatus.ACTIVE,
  verificationStatus: CompanyVerificationStatus.VERIFIED,
} as const;

const employerJobInclude = {
  company: true,
  city: { include: { province: true } },
  category: true,
  subCategory: true,
  skills: { include: { skill: true } },
} satisfies Prisma.JobInclude;

const publicJobInclude = {
  company: { select: { slug: true, name: true } },
  city: { select: { slug: true, nameFa: true, province: { select: { slug: true } } } },
  category: { select: { slug: true, nameFa: true } },
  subCategory: { select: { slug: true, nameFa: true } },
  skills: { include: { skill: { select: { slug: true, nameFa: true } } } },
} satisfies Prisma.JobInclude;

function mapCompanyError(error: unknown): never {
  if (error instanceof CompanyError) throw new JobError(error.code);
  throw error;
}

export async function assertJobCompanyAccess(
  companyId: string,
  userId: string,
  allowed: CompanyMemberRole[] = [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN],
) {
  try {
    return await assertCompanyAccess(companyId, userId, allowed);
  } catch (error) {
    mapCompanyError(error);
  }
}

async function assertJobSlugAvailable(slug: string, excludeJobId?: string) {
  if (!validateSlugFormat(slug) || isReservedSlug(slug)) {
    throw new JobError("SLUG_RESERVED");
  }
  const existing = await prisma.job.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeJobId ? { NOT: { id: excludeJobId } } : {}),
    },
  });
  if (existing) throw new JobError("SLUG_TAKEN");
}

async function generateUniqueJobSlug(title: string, suffix: string) {
  let slug = slugFromName(title, suffix);
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await assertJobSlugAvailable(slug);
      return slug;
    } catch (error) {
      if (error instanceof JobError && error.code === "SLUG_TAKEN") {
        slug = slugFromName(title, `${suffix}${attempt + 1}`);
        continue;
      }
      throw error;
    }
  }
  throw new JobError("SLUG_TAKEN");
}

async function assertCompanyPublishReady(companyId: string) {
  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
  });
  if (!company) throw new JobError("JOB_NOT_FOUND");
  if (
    company.verificationStatus !== CompanyVerificationStatus.VERIFIED ||
    company.status !== CompanyStatus.ACTIVE
  ) {
    throw new JobError("COMPANY_NOT_VERIFIED");
  }
}

async function assertActiveSubCategory(subCategoryId: string, categoryId: string) {
  const row = await prisma.subCategory.findFirst({
    where: { id: subCategoryId, categoryId, isActive: true, deletedAt: null },
  });
  if (!row) throw new JobError("VALIDATION_ERROR");
  return row;
}

async function validateJobRelations(input: {
  cityId: string;
  categoryId: string;
  subCategoryId?: string | null;
  skillIds?: string[];
}) {
  try {
    await assertActiveCity(input.cityId);
  } catch (error) {
    if (error instanceof LocationError) throw new JobError(error.code);
    throw error;
  }

  try {
    await assertActiveCategory(input.categoryId);
  } catch (error) {
    if (error instanceof TaxonomyError) throw new JobError(error.code);
    throw error;
  }

  if (input.subCategoryId) {
    await assertActiveSubCategory(input.subCategoryId, input.categoryId);
  }

  if (input.skillIds?.length) {
    if (input.skillIds.length > 10) throw new JobError("VALIDATION_ERROR");
    const skills = await prisma.skill.findMany({
      where: { id: { in: input.skillIds }, isActive: true, deletedAt: null },
    });
    if (skills.length !== input.skillIds.length) throw new JobError("VALIDATION_ERROR");
  }
}

async function getEmployerJobRecord(jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, deletedAt: null, status: { not: JobStatus.DELETED } },
    include: employerJobInclude,
  });
  if (!job) throw new JobError("JOB_NOT_FOUND");
  return job;
}

function defaultExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

function assertEditableStatus(status: JobStatus) {
  if (status !== JobStatus.DRAFT && status !== JobStatus.PAUSED) {
    throw new JobError("INVALID_JOB_STATE");
  }
}

export async function createJob(params: {
  userId: string;
  input: CreateJobInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: {
      id: params.userId,
      deletedAt: null,
      primaryType: UserPrimaryType.EMPLOYER,
    },
    include: { employerProfile: true },
  });
  if (!user?.employerProfile) throw new JobError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new JobError("USER_NOT_ACTIVE");

  await assertJobCompanyAccess(params.input.companyId, params.userId);

  await validateJobRelations({
    cityId: params.input.cityId,
    categoryId: params.input.categoryId,
    subCategoryId: params.input.subCategoryId,
    skillIds: params.input.skillIds,
  });

  const slug = await generateUniqueJobSlug(params.input.title, params.userId.slice(0, 6));
  const { skillIds, companyId, ...jobData } = params.input;

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        ...jobData,
        companyId,
        slug,
        createdById: params.userId,
        status: JobStatus.DRAFT,
      },
      include: employerJobInclude,
    });

    if (skillIds?.length) {
      await tx.jobSkill.createMany({
        data: skillIds.map((skillId) => ({ jobId: created.id, skillId })),
      });
    }

    return tx.job.findFirstOrThrow({
      where: { id: created.id },
      include: employerJobInclude,
    });
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: job.id, companyId: job.companyId },
  });

  return job;
}

export async function updateJob(params: {
  jobId: string;
  userId: string;
  input: UpdateJobInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);
  assertEditableStatus(job.status);

  const categoryId = params.input.categoryId ?? job.categoryId;
  const cityId = params.input.cityId ?? job.cityId;
  const subCategoryId =
    params.input.subCategoryId !== undefined ? params.input.subCategoryId : job.subCategoryId;

  await validateJobRelations({
    cityId,
    categoryId,
    subCategoryId,
    skillIds: params.input.skillIds,
  });

  const { skillIds, ...updateData } = params.input;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.job.update({
      where: { id: params.jobId },
      data: updateData,
    });

    if (skillIds !== undefined) {
      await tx.jobSkill.deleteMany({ where: { jobId: params.jobId } });
      if (skillIds.length) {
        await tx.jobSkill.createMany({
          data: skillIds.map((skillId) => ({ jobId: params.jobId, skillId })),
        });
      }
    }

    return tx.job.findFirstOrThrow({
      where: { id: params.jobId },
      include: employerJobInclude,
    });
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId },
  });

  return updated;
}

export async function getEmployerJob(jobId: string, userId: string) {
  const job = await getEmployerJobRecord(jobId);
  try {
    await assertCompanyAccess(job.companyId, userId);
  } catch (error) {
    mapCompanyError(error);
  }
  return job;
}

export async function listEmployerJobs(params: {
  userId: string;
  companyId?: string;
  status?: JobStatus;
  page?: number;
  limit?: number;
}) {
  const memberships = await prisma.companyMember.findMany({
    where: {
      userId: params.userId,
      deletedAt: null,
      company: { deletedAt: null },
      ...(params.companyId ? { companyId: params.companyId } : {}),
    },
    select: { companyId: true },
  });

  const companyIds = memberships.map((m) => m.companyId);
  if (!companyIds.length) {
    return { items: [], total: 0, page: params.page ?? 1, limit: params.limit ?? 20 };
  }

  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 100);
  const where = {
    companyId: { in: companyIds },
    deletedAt: null,
    status: { not: JobStatus.DELETED },
    ...(params.status ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: employerJobInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function publishJob(params: {
  jobId: string;
  userId: string;
  input?: PublishJobInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);

  if (job.status !== JobStatus.DRAFT && job.status !== JobStatus.PAUSED) {
    throw new JobError("INVALID_JOB_STATE");
  }

  await assertCompanyPublishReady(job.companyId);

  if (job.status === JobStatus.DRAFT) {
    try {
      await consumeQuota({
        ownerType: BillingOwnerType.COMPANY,
        ownerId: job.companyId,
        featureKey: FEATURE_KEYS.JOB_POST_PER_MONTH,
        defaultPlanSlug: "employer_free",
        actorUserId: params.userId,
        refType: "job",
        refId: params.jobId,
      });
    } catch (error) {
      if (error instanceof BillingError) throw new JobError(error.code);
      throw error;
    }
  }

  const expiresAt = params.input?.expiresAt ?? defaultExpiresAt();

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: {
      status: JobStatus.PENDING_REVIEW,
      expiresAt,
    },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_PUBLISHED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId, expiresAt: expiresAt.toISOString() },
  });

  return updated;
}

export async function approveJob(params: {
  jobId: string;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);

  if (job.status !== JobStatus.PENDING_REVIEW) {
    throw new JobError("INVALID_JOB_STATE");
  }

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: {
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "JOB_APPROVED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId },
  });

  return updated;
}

export async function pauseJob(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);

  if (job.status !== JobStatus.PUBLISHED) {
    throw new JobError("INVALID_JOB_STATE");
  }

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: { status: JobStatus.PAUSED },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_PAUSED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId },
  });

  return updated;
}

export async function resumeJob(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);

  if (job.status !== JobStatus.PAUSED) {
    throw new JobError("INVALID_JOB_STATE");
  }
  if (!job.publishedAt) {
    throw new JobError("INVALID_JOB_STATE");
  }

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: { status: JobStatus.PUBLISHED },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_PUBLISHED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId, resumed: true },
  });

  return updated;
}

export async function closeJob(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);

  if (job.status !== JobStatus.PUBLISHED && job.status !== JobStatus.PAUSED) {
    throw new JobError("INVALID_JOB_STATE");
  }

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: {
      status: JobStatus.CLOSED,
      closedAt: new Date(),
    },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_CLOSED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId },
  });

  return updated;
}

export async function deleteJob(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const job = await getEmployerJobRecord(params.jobId);
  await assertJobCompanyAccess(job.companyId, params.userId);

  const updated = await prisma.job.update({
    where: { id: params.jobId },
    data: {
      status: JobStatus.DELETED,
      deletedAt: new Date(),
    },
    include: employerJobInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "JOB_DELETED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { jobId: params.jobId },
  });

  return updated;
}

function buildPublicJobsWhere(query: ListJobsQuery): Prisma.JobWhereInput {
  const now = new Date();
  const where: Prisma.JobWhereInput = {
    deletedAt: null,
    status: JobStatus.PUBLISHED,
    expiresAt: { gt: now },
    company: PUBLIC_COMPANY_WHERE,
  };

  if (query.employmentType) where.employmentType = query.employmentType;
  if (query.experienceLevel) where.experienceLevel = query.experienceLevel;

  if (query.companySlug) {
    where.company = { ...PUBLIC_COMPANY_WHERE, slug: query.companySlug };
  }

  if (query.categorySlug) {
    where.category = { slug: query.categorySlug, isActive: true, deletedAt: null };
  }

  if (query.subCategorySlug) {
    where.subCategory = { slug: query.subCategorySlug, isActive: true, deletedAt: null };
  }

  if (query.citySlug) {
    where.city = { slug: query.citySlug, isActive: true };
  } else if (query.provinceSlug) {
    where.city = { isActive: true, province: { slug: query.provinceSlug, isActive: true } };
  }

  return where;
}

type PublicJobRow = Prisma.JobGetPayload<{ include: typeof publicJobInclude }>;

export function toPublicJob(job: PublicJobRow) {
  const salary =
    job.showSalary && (job.salaryMin != null || job.salaryMax != null)
      ? {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.salaryCurrency,
          type: job.salaryType,
        }
      : undefined;

  return {
    slug: job.slug,
    title: job.title,
    description: job.description,
    company: job.company,
    city: {
      slug: job.city.slug,
      nameFa: job.city.nameFa,
      provinceSlug: job.city.province.slug,
    },
    category: job.category,
    subCategory: job.subCategory,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    skills: job.skills.map((js) => js.skill),
    salary,
    publishedAt: job.publishedAt,
    expiresAt: job.expiresAt,
  };
}

export async function listPublicJobs(query: ListJobsQuery) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const where = buildPublicJobsWhere(query);

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: publicJobInclude,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data: rows.map(toPublicJob),
    meta: { page, limit, total },
  };
}

export async function getPublicJobBySlug(slug: string) {
  const now = new Date();
  const job = await prisma.job.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: JobStatus.PUBLISHED,
      expiresAt: { gt: now },
      company: PUBLIC_COMPANY_WHERE,
    },
    include: publicJobInclude,
  });

  if (!job) throw new JobError("JOB_NOT_FOUND");
  return toPublicJob(job);
}

/**
 * Sitemap inventory (P12-008 · C-012-2): same public gate as getPublicJobBySlug.
 * Slug-only — pages that would notFound() are never listed.
 */
export async function listPublicJobSlugsForSitemap() {
  const now = new Date();
  const rows = await prisma.job.findMany({
    where: {
      deletedAt: null,
      status: JobStatus.PUBLISHED,
      expiresAt: { gt: now },
      company: PUBLIC_COMPANY_WHERE,
    },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  return rows.map((row) => ({
    slug: row.slug,
    lastModified: row.updatedAt,
  }));
}
