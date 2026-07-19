import { ProfileVisibility } from "@prisma/client";

type JobSeekerProfileFields = {
  displayName?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  cityLabel?: string | null;
  profileVisibility?: ProfileVisibility;
};

export function computeJobSeekerCompletionScore(
  profile: JobSeekerProfileFields,
  hasSlug: boolean,
): number {
  const weights: { filled: boolean; points: number }[] = [
    { filled: Boolean(profile.displayName?.trim()), points: 15 },
    { filled: Boolean(profile.headline?.trim()), points: 20 },
    { filled: Boolean(profile.bio?.trim()), points: 25 },
    { filled: Boolean(profile.avatarUrl?.trim()), points: 15 },
    { filled: Boolean(profile.cityLabel?.trim()), points: 10 },
    { filled: hasSlug, points: 15 },
  ];

  return weights.reduce((sum, w) => sum + (w.filled ? w.points : 0), 0);
}

type EmployerProfileFields = {
  displayName?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  companyId?: string | null;
};

export function computeEmployerCompletionScore(
  profile: EmployerProfileFields,
  hasSlug: boolean,
): number {
  const weights: { filled: boolean; points: number }[] = [
    { filled: Boolean(profile.displayName?.trim()), points: 20 },
    { filled: Boolean(profile.jobTitle?.trim()), points: 25 },
    { filled: Boolean(profile.bio?.trim()), points: 25 },
    { filled: Boolean(profile.companyId), points: 20 },
    { filled: hasSlug, points: 10 },
  ];

  return weights.reduce((sum, w) => sum + (w.filled ? w.points : 0), 0);
}
