/**
 * Deterministic MatchScore v1 — on demand, no persistence.
 * salaryCompatibility reserved (always null / weight 0).
 */

export const MATCH_SCORE_VERSION = 1 as const;

export const MATCH_WEIGHTS = {
  skills: 40,
  technologies: 25,
  category: 15,
  location: 10,
  experienceLevel: 10,
  salaryCompatibility: 0,
} as const;

export type MatchInputs = {
  jobSkillIds: string[];
  resumeSkillIds: string[];
  jobTechnologyIds: string[];
  resumeTechnologyIds: string[];
  jobCategoryId: string;
  resumeCategoryIds: string[];
  jobCityId: string;
  jobProvinceId: string;
  resumeCityIds: string[];
  resumeProvinceIds: string[];
  /** Phase 5 has no resume experienceLevel — leave undefined → 0 */
  jobExperienceLevel?: string | null;
  resumeExperienceLevel?: string | null;
};

function overlapScore(jobIds: string[], resumeIds: string[], max: number) {
  if (jobIds.length === 0) return 0;
  const resumeSet = new Set(resumeIds);
  const hit = jobIds.filter((id) => resumeSet.has(id)).length;
  return Math.round((hit / jobIds.length) * max);
}

const EXPERIENCE_ORDER = [
  "INTERN",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "PRINCIPAL",
] as const;

function experienceScore(
  jobLevel: string | null | undefined,
  resumeLevel: string | null | undefined,
  max: number,
) {
  if (!jobLevel || !resumeLevel) return 0;
  if (jobLevel === resumeLevel) return max;
  const a = EXPERIENCE_ORDER.indexOf(jobLevel as (typeof EXPERIENCE_ORDER)[number]);
  const b = EXPERIENCE_ORDER.indexOf(resumeLevel as (typeof EXPERIENCE_ORDER)[number]);
  if (a < 0 || b < 0) return 0;
  return Math.abs(a - b) === 1 ? Math.round(max / 2) : 0;
}

function locationScore(
  jobCityId: string,
  jobProvinceId: string,
  resumeCityIds: string[],
  resumeProvinceIds: string[],
  max: number,
) {
  if (resumeCityIds.includes(jobCityId)) return max;
  if (resumeProvinceIds.includes(jobProvinceId)) return Math.round(max / 2);
  return 0;
}

export function computeMatchScore(input: MatchInputs) {
  const skills = overlapScore(
    input.jobSkillIds,
    input.resumeSkillIds,
    MATCH_WEIGHTS.skills,
  );
  const technologies = overlapScore(
    input.jobTechnologyIds,
    input.resumeTechnologyIds,
    MATCH_WEIGHTS.technologies,
  );
  const category = input.resumeCategoryIds.includes(input.jobCategoryId)
    ? MATCH_WEIGHTS.category
    : 0;
  const location = locationScore(
    input.jobCityId,
    input.jobProvinceId,
    input.resumeCityIds,
    input.resumeProvinceIds,
    MATCH_WEIGHTS.location,
  );
  const experienceLevel = experienceScore(
    input.jobExperienceLevel,
    input.resumeExperienceLevel,
    MATCH_WEIGHTS.experienceLevel,
  );

  const score = Math.min(
    100,
    skills + technologies + category + location + experienceLevel,
  );

  return {
    version: MATCH_SCORE_VERSION,
    score,
    breakdown: {
      skills,
      technologies,
      category,
      location,
      experienceLevel,
      salaryCompatibility: null as null,
    },
  };
}
