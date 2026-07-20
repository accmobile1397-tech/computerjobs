import {
  ApplicationStatus,
  BillingOwnerType,
  CompanyStatus,
  CompanyVerificationStatus,
  JobStatus,
  UserPrimaryType,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  assertCompanyAccess,
  CompanyError,
} from "@/modules/companies/services/company.service";
import {
  resolveResumeIdForApply,
  ResumeError,
} from "@/modules/resumes/services/resume.service";
import { FEATURE_KEYS } from "@/modules/billing/constants";
import { BillingError } from "@/modules/billing/services/billing-core";
import { consumeQuota } from "@/modules/billing/services/quota.service";
import { publishJobApplicationSubmitted } from "@/modules/events/publishers/job.publisher";
import type {
  SubmitApplicationInput,
  UpdateApplicationStatusInput,
} from "@/modules/jobs/validators/job.schema";

export class ApplicationError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

const applicationInclude = {
  job: {
    include: {
      company: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

function mapCompanyError(error: unknown): never {
  if (error instanceof CompanyError) throw new ApplicationError(error.code);
  throw error;
}

function isJobAcceptingApplications(job: {
  status: JobStatus;
  expiresAt: Date | null;
  company: {
    status: CompanyStatus;
    verificationStatus: CompanyVerificationStatus;
    deletedAt: Date | null;
  };
}) {
  const now = new Date();
  return (
    job.status === JobStatus.PUBLISHED &&
    job.expiresAt != null &&
    job.expiresAt > now &&
    job.company.deletedAt == null &&
    job.company.status === CompanyStatus.ACTIVE &&
    job.company.verificationStatus === CompanyVerificationStatus.VERIFIED
  );
}

async function getJobForApplication(jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, deletedAt: null, status: { not: JobStatus.DELETED } },
    include: { company: true },
  });
  if (!job) throw new ApplicationError("JOB_NOT_FOUND");
  return job;
}

async function getJobForEmployerApplications(jobId: string, userId: string) {
  const job = await getJobForApplication(jobId);
  try {
    await assertCompanyAccess(job.companyId, userId);
  } catch (error) {
    mapCompanyError(error);
  }
  return job;
}

export async function submitApplication(params: {
  jobId: string;
  userId: string;
  input: SubmitApplicationInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: {
      id: params.userId,
      deletedAt: null,
      primaryType: UserPrimaryType.JOB_SEEKER,
    },
  });
  if (!user) throw new ApplicationError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new ApplicationError("USER_NOT_ACTIVE");

  const job = await getJobForApplication(params.jobId);
  if (!isJobAcceptingApplications(job)) {
    throw new ApplicationError("JOB_NOT_ACCEPTING");
  }

  const existing = await prisma.jobApplication.findFirst({
    where: {
      jobId: params.jobId,
      userId: params.userId,
      deletedAt: null,
      status: { not: ApplicationStatus.WITHDRAWN },
    },
  });
  if (existing) throw new ApplicationError("ALREADY_APPLIED");

  try {
    await consumeQuota({
      ownerType: BillingOwnerType.USER,
      ownerId: params.userId,
      featureKey: FEATURE_KEYS.APPLICATION_PER_MONTH,
      defaultPlanSlug: "seeker_free",
      actorUserId: params.userId,
      refType: "job",
      refId: params.jobId,
    });
  } catch (error) {
    if (error instanceof BillingError) throw new ApplicationError(error.code);
    throw error;
  }

  let resumeId: string | null = null;
  try {
    resumeId = await resolveResumeIdForApply({
      userId: params.userId,
      resumeId: params.input.resumeId,
    });
  } catch (error) {
    if (error instanceof ResumeError) throw new ApplicationError(error.code);
    throw error;
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: params.jobId,
      userId: params.userId,
      coverLetter: params.input.coverLetter,
      resumeId,
      status: ApplicationStatus.SUBMITTED,
    },
    include: applicationInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "APPLICATION_SUBMITTED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { applicationId: application.id, jobId: params.jobId },
  });

  await publishJobApplicationSubmitted({
    jobId: params.jobId,
    applicationId: application.id,
    userId: params.userId,
    actorUserId: params.userId,
  });

  return application;
}

export async function withdrawApplication(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const application = await prisma.jobApplication.findFirst({
    where: {
      jobId: params.jobId,
      userId: params.userId,
      deletedAt: null,
    },
    include: applicationInclude,
  });
  if (!application) throw new ApplicationError("APPLICATION_NOT_FOUND");

  if (
    application.status !== ApplicationStatus.SUBMITTED &&
    application.status !== ApplicationStatus.VIEWED
  ) {
    throw new ApplicationError("INVALID_APPLICATION_STATE");
  }

  const updated = await prisma.jobApplication.update({
    where: { id: application.id },
    data: {
      status: ApplicationStatus.WITHDRAWN,
      withdrawnAt: new Date(),
    },
    include: applicationInclude,
  });

  await writeAuditLog({
    userId: params.userId,
    action: "APPLICATION_WITHDRAWN",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { applicationId: application.id, jobId: params.jobId },
  });

  return updated;
}

export async function listSeekerApplications(params: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 100);
  const where = { userId: params.userId, deletedAt: null };

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      include: applicationInclude,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function listJobApplications(params: {
  jobId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  page?: number;
  limit?: number;
}) {
  await getJobForEmployerApplications(params.jobId, params.userId);

  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 100);
  const where = { jobId: params.jobId, deletedAt: null };

  const submitted = await prisma.jobApplication.findMany({
    where: { ...where, status: ApplicationStatus.SUBMITTED },
    select: { id: true },
  });

  if (submitted.length) {
    const now = new Date();
    await prisma.jobApplication.updateMany({
      where: { id: { in: submitted.map((row) => row.id) } },
      data: { status: ApplicationStatus.VIEWED, viewedAt: now },
    });

    await Promise.all(
      submitted.map((row) =>
        writeAuditLog({
          userId: params.userId,
          action: "APPLICATION_VIEWED",
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadata: { applicationId: row.id, jobId: params.jobId },
        }),
      ),
    );
  }

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            slug: true,
            jobSeekerProfile: {
              select: {
                displayName: true,
                headline: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function updateApplicationStatus(params: {
  jobId: string;
  applicationId: string;
  userId: string;
  input: UpdateApplicationStatusInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  await getJobForEmployerApplications(params.jobId, params.userId);

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: params.applicationId,
      jobId: params.jobId,
      deletedAt: null,
    },
  });
  if (!application) throw new ApplicationError("APPLICATION_NOT_FOUND");

  if (application.status === ApplicationStatus.WITHDRAWN) {
    throw new ApplicationError("INVALID_APPLICATION_STATE");
  }

  const data: {
    status: ApplicationStatus;
    viewedAt?: Date;
  } = { status: params.input.status };

  if (params.input.status === ApplicationStatus.VIEWED && !application.viewedAt) {
    data.viewedAt = new Date();
  }

  const updated = await prisma.jobApplication.update({
    where: { id: params.applicationId },
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          slug: true,
          jobSeekerProfile: {
            select: {
              displayName: true,
              headline: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  await writeAuditLog({
    userId: params.userId,
    action: "APPLICATION_STATUS_CHANGED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: {
      applicationId: params.applicationId,
      jobId: params.jobId,
      status: params.input.status,
    },
  });

  if (params.input.status === ApplicationStatus.VIEWED && !application.viewedAt) {
    await writeAuditLog({
      userId: params.userId,
      action: "APPLICATION_VIEWED",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { applicationId: params.applicationId, jobId: params.jobId },
    });
  }

  return updated;
}
