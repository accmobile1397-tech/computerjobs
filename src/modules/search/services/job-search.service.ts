import {
  CompanyStatus,
  CompanyVerificationStatus,
  JobStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { toPublicJob } from "@/modules/jobs/services/job.service";
import type { SearchJobsQuery } from "@/modules/search/validators/search.schema";

export class SearchError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

const PUBLIC_COMPANY_WHERE = {
  deletedAt: null,
  status: CompanyStatus.ACTIVE,
  verificationStatus: CompanyVerificationStatus.VERIFIED,
} as const;

const publicJobInclude = {
  company: { select: { slug: true, name: true } },
  city: {
    select: { slug: true, nameFa: true, province: { select: { slug: true } } },
  },
  category: { select: { slug: true, nameFa: true } },
  subCategory: { select: { slug: true, nameFa: true } },
  skills: { include: { skill: { select: { slug: true, nameFa: true } } } },
} satisfies Prisma.JobInclude;

function buildWhere(query: SearchJobsQuery): Prisma.JobWhereInput {
  const now = new Date();
  const and: Prisma.JobWhereInput[] = [];

  const where: Prisma.JobWhereInput = {
    deletedAt: null,
    status: JobStatus.PUBLISHED,
    expiresAt: { gt: now },
    company: query.companySlug
      ? { ...PUBLIC_COMPANY_WHERE, slug: query.companySlug }
      : PUBLIC_COMPANY_WHERE,
  };

  if (query.employmentType) where.employmentType = query.employmentType;
  if (query.experienceLevel) where.experienceLevel = query.experienceLevel;
  if (query.isRemote !== undefined) where.isRemote = query.isRemote;
  if (query.salaryType) where.salaryType = query.salaryType;

  if (query.salaryMin != null) {
    and.push({
      OR: [{ salaryMax: { gte: query.salaryMin } }, { salaryMin: { gte: query.salaryMin } }],
    });
  }
  if (query.salaryMax != null) {
    and.push({
      OR: [{ salaryMin: { lte: query.salaryMax } }, { salaryMin: null }],
    });
  }

  if (query.categorySlug) {
    where.category = { slug: query.categorySlug, isActive: true, deletedAt: null };
  }
  if (query.subCategorySlug) {
    where.subCategory = {
      slug: query.subCategorySlug,
      isActive: true,
      deletedAt: null,
    };
  }
  if (query.citySlug) {
    where.city = { slug: query.citySlug, isActive: true };
  } else if (query.provinceSlug) {
    where.city = {
      isActive: true,
      province: { slug: query.provinceSlug, isActive: true },
    };
  }

  if (query.skillIds?.length) {
    and.push({ skills: { some: { skillId: { in: query.skillIds } } } });
  }
  if (query.technologyIds?.length) {
    and.push({
      skills: {
        some: {
          skill: { technologies: { some: { id: { in: query.technologyIds } } } },
        },
      },
    });
  }

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
      ],
    });
  }

  if (and.length) where.AND = and;
  return where;
}

export async function searchJobs(query: SearchJobsQuery) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const where = buildWhere(query);
  const sort = query.sort ?? "publishedAt";

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "expiresAt" ? { expiresAt: "asc" } : { publishedAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: publicJobInclude,
      orderBy,
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
