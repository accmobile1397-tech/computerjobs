import {
  JobStatus,
  ResumeStatus,
  ResumeVisibility,
  CompanyStatus,
  CompanyVerificationStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import { SearchError } from "@/modules/search/services/job-search.service";
import { computeMatchScore } from "@/modules/search/services/match-score";

async function loadJobForMatch(jobId: string) {
  const now = new Date();
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
      status: { not: JobStatus.DELETED },
    },
    include: {
      city: { select: { id: true, provinceId: true } },
      skills: { select: { skillId: true } },
      company: true,
    },
  });
  if (!job) throw new SearchError("JOB_NOT_FOUND");

  const skillIds = job.skills.map((s) => s.skillId);
  const technologies =
    skillIds.length === 0
      ? []
      : await prisma.technology.findMany({
          where: { skillId: { in: skillIds }, deletedAt: null, isActive: true },
          select: { id: true },
        });

  return {
    job,
    jobSkillIds: skillIds,
    jobTechnologyIds: technologies.map((t) => t.id),
    isPubliclyMatchable:
      job.status === JobStatus.PUBLISHED &&
      job.expiresAt != null &&
      job.expiresAt > now &&
      job.company.deletedAt == null &&
      job.company.status === CompanyStatus.ACTIVE &&
      job.company.verificationStatus === CompanyVerificationStatus.VERIFIED,
  };
}

async function loadResumeForMatch(resumeId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, deletedAt: null, status: ResumeStatus.ACTIVE },
    include: {
      skills: {
        include: {
          skill: { include: { subCategory: { select: { categoryId: true } } } },
        },
      },
      technologies: { select: { technologyId: true } },
      experiences: {
        include: { city: { select: { id: true, provinceId: true } } },
      },
      user: {
        include: {
          jobSeekerProfile: {
            include: { city: { select: { id: true, provinceId: true } } },
          },
        },
      },
    },
  });
  if (!resume) throw new SearchError("RESUME_NOT_FOUND");
  return resume;
}

function toMatchInputs(
  job: Awaited<ReturnType<typeof loadJobForMatch>>,
  resume: Awaited<ReturnType<typeof loadResumeForMatch>>,
) {
  const resumeCityIds = [
    ...resume.experiences.map((e) => e.city?.id).filter(Boolean),
    resume.user.jobSeekerProfile?.city?.id,
  ].filter((id): id is string => Boolean(id));

  const resumeProvinceIds = [
    ...resume.experiences.map((e) => e.city?.provinceId).filter(Boolean),
    resume.user.jobSeekerProfile?.city?.provinceId,
  ].filter((id): id is string => Boolean(id));

  const resumeCategoryIds = [
    ...new Set(
      resume.skills
        .map((s) => s.skill.subCategory.categoryId)
        .filter(Boolean),
    ),
  ];

  return computeMatchScore({
    jobSkillIds: job.jobSkillIds,
    resumeSkillIds: resume.skills.map((s) => s.skillId),
    jobTechnologyIds: job.jobTechnologyIds,
    resumeTechnologyIds: resume.technologies.map((t) => t.technologyId),
    jobCategoryId: job.job.categoryId,
    resumeCategoryIds,
    jobCityId: job.job.cityId,
    jobProvinceId: job.job.city.provinceId,
    resumeCityIds,
    resumeProvinceIds,
    jobExperienceLevel: job.job.experienceLevel,
    resumeExperienceLevel: null,
  });
}

/** Seeker: match own ACTIVE resume vs job (on demand). */
export async function matchJobForSeeker(params: {
  jobId: string;
  userId: string;
}) {
  const loaded = await loadJobForMatch(params.jobId);
  if (!loaded.isPubliclyMatchable) throw new SearchError("JOB_NOT_FOUND");

  const resume = await prisma.resume.findFirst({
    where: {
      userId: params.userId,
      deletedAt: null,
      status: ResumeStatus.ACTIVE,
    },
  });
  if (!resume) throw new SearchError("RESUME_NOT_FOUND");

  const full = await loadResumeForMatch(resume.id);
  return toMatchInputs(loaded, full);
}

/** Employer: match applicant resume vs job (on demand). */
export async function matchApplicationForEmployer(params: {
  jobId: string;
  applicationId: string;
  employerUserId: string;
}) {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: params.applicationId,
      jobId: params.jobId,
      deletedAt: null,
    },
  });
  if (!application) throw new SearchError("APPLICATION_NOT_FOUND");

  const loaded = await loadJobForMatch(params.jobId);
  try {
    await assertCompanyAccess(loaded.job.companyId, params.employerUserId);
  } catch (error) {
    if (error instanceof CompanyError) throw new SearchError(error.code);
    throw error;
  }

  if (!application.resumeId) throw new SearchError("RESUME_NOT_FOUND");
  const resume = await loadResumeForMatch(application.resumeId);

  if (
    resume.visibility !== ResumeVisibility.EMPLOYERS_ONLY &&
    resume.visibility !== ResumeVisibility.PUBLIC
  ) {
    throw new SearchError("RESUME_NOT_ACCESSIBLE");
  }

  return toMatchInputs(loaded, resume);
}
