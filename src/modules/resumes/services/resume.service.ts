import {
  ResumeStatus,
  ResumeVisibility,
  UserPrimaryType,
  UserStatus,
  type AuditAction,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import type {
  CertificateInput,
  EducationInput,
  ExperienceInput,
  LanguageInput,
  ProjectInput,
  UpdateResumeInput,
} from "@/modules/resumes/validators/resume.schema";

export class ResumeError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

const resumeInclude = {
  educations: { orderBy: { sortOrder: "asc" as const } },
  experiences: {
    orderBy: { sortOrder: "asc" as const },
    include: { city: { select: { id: true, slug: true, nameFa: true } } },
  },
  skills: {
    orderBy: { sortOrder: "asc" as const },
    include: { skill: { select: { id: true, slug: true, nameFa: true } } },
  },
  technologies: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      technology: { select: { id: true, slug: true, nameFa: true } },
    },
  },
  languages: { orderBy: { sortOrder: "asc" as const } },
  certificates: { orderBy: { sortOrder: "asc" as const } },
  projects: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      technologies: {
        include: {
          technology: { select: { id: true, slug: true, nameFa: true } },
        },
      },
    },
  },
} as const;

function computeCompletionScore(r: {
  summary: string | null;
  educations: unknown[];
  experiences: unknown[];
  skills: unknown[];
  technologies: unknown[];
  languages: unknown[];
  certificates: unknown[];
  projects: unknown[];
}) {
  let score = 0;
  if (r.summary?.trim()) score += 10;
  if (r.educations.length >= 1) score += 15;
  if (r.experiences.length >= 1) score += 25;
  if (r.skills.length >= 3) score += 20;
  if (r.languages.length >= 1) score += 10;
  if (r.projects.length >= 1 || r.certificates.length >= 1) score += 10;
  if (r.technologies.length >= 1) score += 10;
  return Math.min(100, score);
}

async function assertJobSeeker(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      primaryType: UserPrimaryType.JOB_SEEKER,
    },
  });
  if (!user) throw new ResumeError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new ResumeError("USER_NOT_ACTIVE");
  return user;
}

async function getOrCreateResume(userId: string) {
  await assertJobSeeker(userId);
  const existing = await prisma.resume.findFirst({
    where: { userId, deletedAt: null },
    include: resumeInclude,
  });
  if (existing) return existing;

  const created = await prisma.resume.create({
    data: { userId },
    include: resumeInclude,
  });
  await writeAuditLog({
    userId,
    action: "RESUME_CREATED",
    metadata: { resumeId: created.id },
  });
  return created;
}

async function recomputeAndReturn(resumeId: string) {
  const resume = await prisma.resume.findUniqueOrThrow({
    where: { id: resumeId },
    include: resumeInclude,
  });
  const completionScore = computeCompletionScore(resume);
  if (completionScore !== resume.completionScore) {
    return prisma.resume.update({
      where: { id: resumeId },
      data: { completionScore },
      include: resumeInclude,
    });
  }
  return resume;
}

async function audit(
  userId: string,
  action: AuditAction,
  metadata: Record<string, string | number | boolean | null>,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  await writeAuditLog({
    userId,
    action,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    metadata,
  });
}

export async function getOwnResume(userId: string) {
  return getOrCreateResume(userId);
}

export async function updateOwnResume(params: {
  userId: string;
  input: UpdateResumeInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const resume = await getOrCreateResume(params.userId);
  const visibilityChanged =
    params.input.visibility != null && params.input.visibility !== resume.visibility;
  const statusChanged =
    params.input.status != null && params.input.status !== resume.status;

  const updated = await prisma.resume.update({
    where: { id: resume.id },
    data: {
      title: params.input.title === undefined ? undefined : params.input.title,
      summary: params.input.summary === undefined ? undefined : params.input.summary,
      visibility: params.input.visibility,
      status: params.input.status,
    },
    include: resumeInclude,
  });

  const score = computeCompletionScore(updated);
  const result =
    score !== updated.completionScore
      ? await prisma.resume.update({
          where: { id: updated.id },
          data: { completionScore: score },
          include: resumeInclude,
        })
      : updated;

  if (visibilityChanged) {
    await audit(params.userId, "RESUME_VISIBILITY_CHANGED", { resumeId: resume.id }, params);
  } else if (statusChanged) {
    await audit(params.userId, "RESUME_STATUS_CHANGED", { resumeId: resume.id }, params);
  } else {
    await audit(params.userId, "RESUME_UPDATED", { resumeId: resume.id }, params);
  }
  return result;
}

export async function addEducation(
  userId: string,
  input: EducationInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  await prisma.resumeEducation.create({
    data: {
      resumeId: resume.id,
      institution: input.institution,
      degree: input.degree ?? null,
      fieldOfStudy: input.fieldOfStudy ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : (input.endDate ?? null),
      isCurrent: input.isCurrent ?? false,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  await audit(userId, "RESUME_EDUCATION_CREATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function updateEducation(
  userId: string,
  educationId: string,
  input: EducationInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeEducation.findFirst({
    where: { id: educationId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeEducation.update({
    where: { id: educationId },
    data: {
      institution: input.institution,
      degree: input.degree ?? null,
      fieldOfStudy: input.fieldOfStudy ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : (input.endDate ?? null),
      isCurrent: input.isCurrent ?? false,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? row.sortOrder,
    },
  });
  await audit(userId, "RESUME_EDUCATION_UPDATED", { resumeId: resume.id, educationId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function deleteEducation(
  userId: string,
  educationId: string,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeEducation.findFirst({
    where: { id: educationId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeEducation.delete({ where: { id: educationId } });
  await audit(userId, "RESUME_EDUCATION_DELETED", { resumeId: resume.id, educationId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function addExperience(
  userId: string,
  input: ExperienceInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  if (input.cityId) {
    const city = await prisma.city.findFirst({
      where: { id: input.cityId, isActive: true },
    });
    if (!city) throw new ResumeError("LOCATION_NOT_FOUND");
  }
  await prisma.resumeExperience.create({
    data: {
      resumeId: resume.id,
      companyName: input.companyName,
      title: input.title,
      employmentType: input.employmentType ?? null,
      cityId: input.cityId ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : (input.endDate ?? null),
      isCurrent: input.isCurrent ?? false,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  await audit(userId, "RESUME_EXPERIENCE_CREATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function updateExperience(
  userId: string,
  experienceId: string,
  input: ExperienceInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeExperience.findFirst({
    where: { id: experienceId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  if (input.cityId) {
    const city = await prisma.city.findFirst({
      where: { id: input.cityId, isActive: true },
    });
    if (!city) throw new ResumeError("LOCATION_NOT_FOUND");
  }
  await prisma.resumeExperience.update({
    where: { id: experienceId },
    data: {
      companyName: input.companyName,
      title: input.title,
      employmentType: input.employmentType ?? null,
      cityId: input.cityId ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : (input.endDate ?? null),
      isCurrent: input.isCurrent ?? false,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? row.sortOrder,
    },
  });
  await audit(userId, "RESUME_EXPERIENCE_UPDATED", { resumeId: resume.id, experienceId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function deleteExperience(
  userId: string,
  experienceId: string,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeExperience.findFirst({
    where: { id: experienceId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeExperience.delete({ where: { id: experienceId } });
  await audit(userId, "RESUME_EXPERIENCE_DELETED", { resumeId: resume.id, experienceId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function replaceSkills(
  userId: string,
  skills: { skillId: string; proficiency?: string | null; sortOrder?: number }[],
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  if (skills.length > 30) throw new ResumeError("RESUME_SECTION_LIMIT_EXCEEDED");
  const ids = skills.map((s) => s.skillId);
  if (new Set(ids).size !== ids.length) throw new ResumeError("DUPLICATE_SKILL");

  const found = await prisma.skill.findMany({
    where: { id: { in: ids }, deletedAt: null, isActive: true },
  });
  if (found.length !== ids.length) throw new ResumeError("SKILL_NOT_FOUND");

  await prisma.$transaction([
    prisma.resumeSkill.deleteMany({ where: { resumeId: resume.id } }),
    prisma.resumeSkill.createMany({
      data: skills.map((s, i) => ({
        resumeId: resume.id,
        skillId: s.skillId,
        proficiency: (s.proficiency as never) ?? null,
        sortOrder: s.sortOrder ?? i,
      })),
    }),
  ]);
  await audit(userId, "RESUME_SKILL_UPDATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function replaceTechnologies(
  userId: string,
  technologies: {
    technologyId: string;
    proficiency?: string | null;
    sortOrder?: number;
  }[],
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  if (technologies.length > 30) throw new ResumeError("RESUME_SECTION_LIMIT_EXCEEDED");
  const ids = technologies.map((t) => t.technologyId);
  if (new Set(ids).size !== ids.length) throw new ResumeError("DUPLICATE_TECHNOLOGY");

  const found = await prisma.technology.findMany({
    where: { id: { in: ids }, deletedAt: null, isActive: true },
  });
  if (found.length !== ids.length) throw new ResumeError("TECHNOLOGY_NOT_FOUND");

  await prisma.$transaction([
    prisma.resumeTechnology.deleteMany({ where: { resumeId: resume.id } }),
    prisma.resumeTechnology.createMany({
      data: technologies.map((t, i) => ({
        resumeId: resume.id,
        technologyId: t.technologyId,
        proficiency: (t.proficiency as never) ?? null,
        sortOrder: t.sortOrder ?? i,
      })),
    }),
  ]);
  await audit(userId, "RESUME_TECHNOLOGY_UPDATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function addLanguage(
  userId: string,
  input: LanguageInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const count = await prisma.resumeLanguage.count({ where: { resumeId: resume.id } });
  if (count >= 10) throw new ResumeError("RESUME_SECTION_LIMIT_EXCEEDED");
  await prisma.resumeLanguage.create({
    data: {
      resumeId: resume.id,
      languageCode: input.languageCode,
      languageName: input.languageName,
      proficiency: input.proficiency,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  await audit(userId, "RESUME_LANGUAGE_CREATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function updateLanguage(
  userId: string,
  languageId: string,
  input: LanguageInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeLanguage.findFirst({
    where: { id: languageId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeLanguage.update({
    where: { id: languageId },
    data: {
      languageCode: input.languageCode,
      languageName: input.languageName,
      proficiency: input.proficiency,
      sortOrder: input.sortOrder ?? row.sortOrder,
    },
  });
  await audit(userId, "RESUME_LANGUAGE_UPDATED", { resumeId: resume.id, languageId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function deleteLanguage(
  userId: string,
  languageId: string,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeLanguage.findFirst({
    where: { id: languageId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeLanguage.delete({ where: { id: languageId } });
  await audit(userId, "RESUME_LANGUAGE_DELETED", { resumeId: resume.id, languageId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function addCertificate(
  userId: string,
  input: CertificateInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  await prisma.resumeCertificate.create({
    data: {
      resumeId: resume.id,
      name: input.name,
      issuer: input.issuer ?? null,
      issueDate: input.issueDate ?? null,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  await audit(userId, "RESUME_CERTIFICATE_CREATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function updateCertificate(
  userId: string,
  certificateId: string,
  input: CertificateInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeCertificate.findFirst({
    where: { id: certificateId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeCertificate.update({
    where: { id: certificateId },
    data: {
      name: input.name,
      issuer: input.issuer ?? null,
      issueDate: input.issueDate ?? null,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl ?? null,
      sortOrder: input.sortOrder ?? row.sortOrder,
    },
  });
  await audit(userId, "RESUME_CERTIFICATE_UPDATED", { resumeId: resume.id, certificateId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function deleteCertificate(
  userId: string,
  certificateId: string,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeCertificate.findFirst({
    where: { id: certificateId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeCertificate.delete({ where: { id: certificateId } });
  await audit(userId, "RESUME_CERTIFICATE_DELETED", { resumeId: resume.id, certificateId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function addProject(
  userId: string,
  input: ProjectInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const techIds = input.technologyIds ?? [];
  if (techIds.length) {
    const found = await prisma.technology.findMany({
      where: { id: { in: techIds }, deletedAt: null, isActive: true },
    });
    if (found.length !== techIds.length) throw new ResumeError("TECHNOLOGY_NOT_FOUND");
  }

  await prisma.resumeProject.create({
    data: {
      resumeId: resume.id,
      title: input.title,
      description: input.description ?? null,
      url: input.url ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      sortOrder: input.sortOrder ?? 0,
      technologies: {
        create: techIds.map((technologyId) => ({ technologyId })),
      },
    },
  });
  await audit(userId, "RESUME_PROJECT_CREATED", { resumeId: resume.id }, meta);
  return recomputeAndReturn(resume.id);
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: ProjectInput,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeProject.findFirst({
    where: { id: projectId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");

  const techIds = input.technologyIds ?? [];
  if (techIds.length) {
    const found = await prisma.technology.findMany({
      where: { id: { in: techIds }, deletedAt: null, isActive: true },
    });
    if (found.length !== techIds.length) throw new ResumeError("TECHNOLOGY_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.resumeProjectTechnology.deleteMany({ where: { projectId } });
    await tx.resumeProject.update({
      where: { id: projectId },
      data: {
        title: input.title,
        description: input.description ?? null,
        url: input.url ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        sortOrder: input.sortOrder ?? row.sortOrder,
      },
    });
    if (techIds.length) {
      await tx.resumeProjectTechnology.createMany({
        data: techIds.map((technologyId) => ({ projectId, technologyId })),
      });
    }
  });
  await audit(userId, "RESUME_PROJECT_UPDATED", { resumeId: resume.id, projectId }, meta);
  return recomputeAndReturn(resume.id);
}

export async function deleteProject(
  userId: string,
  projectId: string,
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const resume = await getOrCreateResume(userId);
  const row = await prisma.resumeProject.findFirst({
    where: { id: projectId, resumeId: resume.id },
  });
  if (!row) throw new ResumeError("RESUME_SECTION_NOT_FOUND");
  await prisma.resumeProject.delete({ where: { id: projectId } });
  await audit(userId, "RESUME_PROJECT_DELETED", { resumeId: resume.id, projectId }, meta);
  return recomputeAndReturn(resume.id);
}

/** Public resume — user slug owns the URL; resume has no slug. */
export async function getPublicResumeByUserSlug(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: UserStatus.ACTIVE,
      primaryType: UserPrimaryType.JOB_SEEKER,
    },
    include: {
      jobSeekerProfile: {
        select: { displayName: true, headline: true },
      },
      resume: { include: resumeInclude },
    },
  });
  if (!user?.resume || user.resume.deletedAt) throw new ResumeError("RESUME_NOT_FOUND");
  if (
    user.resume.visibility !== ResumeVisibility.PUBLIC ||
    user.resume.status !== ResumeStatus.ACTIVE
  ) {
    throw new ResumeError("RESUME_NOT_PUBLIC");
  }

  return {
    userSlug: user.slug,
    displayName: user.jobSeekerProfile?.displayName ?? null,
    headline: user.jobSeekerProfile?.headline ?? null,
    resume: user.resume,
  };
}

export async function getApplicantResume(params: {
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
    include: {
      job: true,
      resume: { include: resumeInclude },
    },
  });
  if (!application) throw new ResumeError("APPLICATION_NOT_FOUND");

  try {
    await assertCompanyAccess(application.job.companyId, params.employerUserId);
  } catch (error) {
    if (error instanceof CompanyError) throw new ResumeError(error.code);
    throw error;
  }

  const resume = application.resume;
  if (!resume || resume.deletedAt) throw new ResumeError("RESUME_NOT_ACCESSIBLE");
  if (resume.status !== ResumeStatus.ACTIVE) throw new ResumeError("RESUME_NOT_ACCESSIBLE");
  if (
    resume.visibility !== ResumeVisibility.EMPLOYERS_ONLY &&
    resume.visibility !== ResumeVisibility.PUBLIC
  ) {
    throw new ResumeError("RESUME_NOT_ACCESSIBLE");
  }

  return resume;
}

export async function resolveResumeIdForApply(params: {
  userId: string;
  resumeId?: string;
}) {
  if (params.resumeId) {
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.resumeId,
        userId: params.userId,
        deletedAt: null,
        status: ResumeStatus.ACTIVE,
      },
    });
    if (!resume) throw new ResumeError("RESUME_NOT_FOUND");
    return resume.id;
  }

  const resume = await prisma.resume.findFirst({
    where: {
      userId: params.userId,
      deletedAt: null,
      status: ResumeStatus.ACTIVE,
    },
  });
  return resume?.id ?? null;
}
