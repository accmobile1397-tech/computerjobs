import {
  CompanyMemberRole,
  CompanyStatus,
  CompanyVerificationStatus,
  EmployerVerificationStatus,
  ProfileVisibility,
  UserPrimaryType,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  isReservedSlug,
  slugFromName,
  validateSlugFormat,
} from "@/modules/shared/utils/slug.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { assertActiveCity, LocationError } from "@/modules/location/services/location.service";
import {
  computeJobSeekerCompletionScore,
} from "@/modules/users/utils/completion-score.util";
import type {
  UpdateEmployerProfileInput,
  UpdateJobSeekerProfileInput,
} from "@/modules/users/validators/profile.schema";

export class ProfileError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function assertSlugAvailable(slug: string, userId: string) {
  if (!validateSlugFormat(slug) || isReservedSlug(slug)) {
    throw new ProfileError("SLUG_RESERVED");
  }
  const existing = await prisma.user.findFirst({
    where: { slug, deletedAt: null, NOT: { id: userId } },
  });
  if (existing) throw new ProfileError("SLUG_TAKEN");
}

export async function updateUserSlug(params: {
  userId: string;
  slug: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.userId, deletedAt: null },
  });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new ProfileError("USER_NOT_ACTIVE");
  }

  await assertSlugAvailable(params.slug, params.userId);

  await prisma.user.update({
    where: { id: params.userId },
    data: { slug: params.slug },
  });

  await writeAuditLog({
    userId: params.userId,
    action: "PROFILE_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { field: "slug" },
  });

  return { slug: params.slug };
}

export async function getJobSeekerProfile(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, primaryType: UserPrimaryType.JOB_SEEKER },
    include: { jobSeekerProfile: true },
  });
  if (!user?.jobSeekerProfile) throw new ProfileError("NOT_FOUND");
  return { user: { id: user.id, slug: user.slug }, profile: user.jobSeekerProfile };
}

export async function updateJobSeekerProfile(params: {
  userId: string;
  input: UpdateJobSeekerProfileInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.userId, deletedAt: null, primaryType: UserPrimaryType.JOB_SEEKER },
    include: { jobSeekerProfile: true },
  });
  if (!user?.jobSeekerProfile) throw new ProfileError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new ProfileError("USER_NOT_ACTIVE");

  if (params.input.cityId) {
    try {
      await assertActiveCity(params.input.cityId);
    } catch (error) {
      if (error instanceof LocationError) throw new ProfileError(error.code);
      throw error;
    }
  }

  let slug = user.slug;
  if (params.input.slug) {
    await assertSlugAvailable(params.input.slug, params.userId);
    slug = params.input.slug;
    await prisma.user.update({ where: { id: params.userId }, data: { slug } });
  } else if (!slug && params.input.displayName) {
    const candidate = slugFromName(params.input.displayName, user.id.slice(0, 6));
    if (validateSlugFormat(candidate) && !isReservedSlug(candidate)) {
      const taken = await prisma.user.findFirst({
        where: { slug: candidate, deletedAt: null, NOT: { id: params.userId } },
      });
      if (!taken) {
        slug = candidate;
        await prisma.user.update({ where: { id: params.userId }, data: { slug: candidate } });
      }
    }
  }

  const merged = {
    displayName: params.input.displayName ?? user.jobSeekerProfile.displayName,
    headline: params.input.headline ?? user.jobSeekerProfile.headline,
    bio: params.input.bio ?? user.jobSeekerProfile.bio,
    avatarUrl: params.input.avatarUrl ?? user.jobSeekerProfile.avatarUrl,
    cityLabel: params.input.cityLabel ?? user.jobSeekerProfile.cityLabel,
    cityId: params.input.cityId ?? user.jobSeekerProfile.cityId,
    profileVisibility:
      params.input.profileVisibility ?? user.jobSeekerProfile.profileVisibility,
  };

  const completionScore = computeJobSeekerCompletionScore(merged, Boolean(slug));

  const profile = await prisma.jobSeekerProfile.update({
    where: { userId: params.userId },
    data: {
      ...params.input,
      completionScore,
    },
  });

  await writeAuditLog({
    userId: params.userId,
    action: "PROFILE_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { type: "job_seeker" },
  });

  return { slug, profile };
}

export async function getEmployerProfile(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, primaryType: UserPrimaryType.EMPLOYER },
    include: { employerProfile: { include: { company: true } } },
  });
  if (!user?.employerProfile) throw new ProfileError("NOT_FOUND");
  return { user: { id: user.id, slug: user.slug }, profile: user.employerProfile };
}

export async function updateEmployerProfile(params: {
  userId: string;
  input: UpdateEmployerProfileInput;
  ipAddress?: string;
  userAgent?: string;
}) {
  const user = await prisma.user.findFirst({
    where: { id: params.userId, deletedAt: null, primaryType: UserPrimaryType.EMPLOYER },
    include: { employerProfile: true },
  });
  if (!user?.employerProfile) throw new ProfileError("NOT_FOUND");
  if (user.status !== UserStatus.ACTIVE) throw new ProfileError("USER_NOT_ACTIVE");

  if (params.input.slug) {
    await assertSlugAvailable(params.input.slug, params.userId);
    await prisma.user.update({ where: { id: params.userId }, data: { slug: params.input.slug } });
  }

  const profile = await prisma.employerProfile.update({
    where: { userId: params.userId },
    data: {
      displayName: params.input.displayName,
      jobTitle: params.input.jobTitle,
      bio: params.input.bio,
    },
  });

  await writeAuditLog({
    userId: params.userId,
    action: "PROFILE_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { type: "employer" },
  });

  return { slug: params.input.slug ?? user.slug, profile };
}

export async function getPublicProfileBySlug(slug: string, viewerPrimaryType?: UserPrimaryType) {
  const user = await prisma.user.findFirst({
    where: { slug, deletedAt: null, status: UserStatus.ACTIVE },
    include: {
      jobSeekerProfile: true,
      employerProfile: { include: { company: true } },
    },
  });
  if (!user) throw new ProfileError("NOT_FOUND");

  if (user.primaryType === UserPrimaryType.JOB_SEEKER && user.jobSeekerProfile) {
    const vis = user.jobSeekerProfile.profileVisibility;
    if (vis === ProfileVisibility.PRIVATE) throw new ProfileError("NOT_FOUND");
    if (
      vis === ProfileVisibility.EMPLOYERS_ONLY &&
      viewerPrimaryType !== UserPrimaryType.EMPLOYER &&
      viewerPrimaryType !== UserPrimaryType.ADMIN &&
      viewerPrimaryType !== UserPrimaryType.SUPER_ADMIN
    ) {
      throw new ProfileError("NOT_FOUND");
    }
    return {
      slug: user.slug,
      primaryType: user.primaryType,
      profile: {
        displayName: user.jobSeekerProfile.displayName,
        headline: user.jobSeekerProfile.headline,
        bio: user.jobSeekerProfile.bio,
        avatarUrl: user.jobSeekerProfile.avatarUrl,
        cityLabel: user.jobSeekerProfile.cityLabel,
      },
    };
  }

  if (user.primaryType === UserPrimaryType.EMPLOYER && user.employerProfile) {
    return {
      slug: user.slug,
      primaryType: user.primaryType,
      profile: {
        displayName: user.employerProfile.displayName,
        jobTitle: user.employerProfile.jobTitle,
        bio: user.employerProfile.bio,
        companyId: user.employerProfile.companyId,
      },
    };
  }

  throw new ProfileError("NOT_FOUND");
}

export async function updateEmployerVerification(params: {
  targetUserId: string;
  status: EmployerVerificationStatus;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const profile = await prisma.employerProfile.findFirst({
    where: { userId: params.targetUserId, deletedAt: null },
  });
  if (!profile) throw new ProfileError("NOT_FOUND");

  const updated = await prisma.employerProfile.update({
    where: { userId: params.targetUserId },
    data: { verificationStatus: params.status },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "EMPLOYER_VERIFICATION_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { targetUserId: params.targetUserId, status: params.status },
  });

  return updated;
}
