import {
  CompanyStatus,
  CompanyVerificationStatus,
  ResumeStatus,
  ResumeVisibility,
  UserStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { SearchError } from "@/modules/search/services/job-search.service";
import type { SearchResumesQuery } from "@/modules/search/validators/search.schema";

/** Employer must belong to at least one VERIFIED + ACTIVE company. */
export async function assertVerifiedEmployerCompany(userId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: {
      userId,
      deletedAt: null,
      company: {
        deletedAt: null,
        status: CompanyStatus.ACTIVE,
        verificationStatus: CompanyVerificationStatus.VERIFIED,
      },
    },
  });
  if (!membership) throw new SearchError("COMPANY_NOT_VERIFIED");
  return membership;
}

export async function searchResumes(params: {
  userId: string;
  query: SearchResumesQuery;
}) {
  await assertVerifiedEmployerCompany(params.userId);

  const page = params.query.page ?? 1;
  const limit = Math.min(params.query.limit ?? 20, 100);
  const and: Prisma.ResumeWhereInput[] = [];

  const where: Prisma.ResumeWhereInput = {
    deletedAt: null,
    status: ResumeStatus.ACTIVE,
    visibility: { in: [ResumeVisibility.PUBLIC, ResumeVisibility.EMPLOYERS_ONLY] },
    user: { deletedAt: null, status: UserStatus.ACTIVE },
  };

  if (params.query.skillIds?.length) {
    and.push({ skills: { some: { skillId: { in: params.query.skillIds } } } });
  }
  if (params.query.technologyIds?.length) {
    and.push({
      technologies: { some: { technologyId: { in: params.query.technologyIds } } },
    });
  }
  if (params.query.languageCode) {
    and.push({ languages: { some: { languageCode: params.query.languageCode } } });
  }
  if (params.query.cityId) {
    and.push({
      OR: [
        { experiences: { some: { cityId: params.query.cityId } } },
        { user: { jobSeekerProfile: { cityId: params.query.cityId } } },
      ],
    });
  } else if (params.query.provinceSlug) {
    and.push({
      OR: [
        {
          experiences: {
            some: { city: { province: { slug: params.query.provinceSlug } } },
          },
        },
        {
          user: {
            jobSeekerProfile: {
              city: { province: { slug: params.query.provinceSlug } },
            },
          },
        },
      ],
    });
  }
  if (params.query.q) {
    and.push({
      OR: [
        { summary: { contains: params.query.q } },
        { title: { contains: params.query.q } },
        { experiences: { some: { title: { contains: params.query.q } } } },
      ],
    });
  }
  if (and.length) where.AND = and;

  const [rows, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      include: {
        user: {
          select: {
            slug: true,
            jobSeekerProfile: {
              select: { displayName: true, headline: true, cityId: true },
            },
          },
        },
        skills: {
          include: { skill: { select: { id: true, slug: true, nameFa: true } } },
          take: 10,
        },
        technologies: {
          include: {
            technology: { select: { id: true, slug: true, nameFa: true } },
          },
          take: 10,
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.resume.count({ where }),
  ]);

  return {
    data: rows.map((r) => ({
      userSlug: r.user.slug,
      displayName: r.user.jobSeekerProfile?.displayName ?? null,
      headline: r.user.jobSeekerProfile?.headline ?? null,
      title: r.title,
      summary: r.summary,
      completionScore: r.completionScore,
      visibility: r.visibility,
      skills: r.skills.map((s) => s.skill),
      technologies: r.technologies.map((t) => t.technology),
    })),
    meta: { page, limit, total },
  };
}
