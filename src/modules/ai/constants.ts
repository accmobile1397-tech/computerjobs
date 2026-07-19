export const AI_FEATURE_KEYS = {
  MATCH_EXPLAIN: "ai.match.explain",
  JOB_IMPROVE: "ai.job.improve_description",
} as const;

export const AI_PROMPT_IDS = {
  MATCH_EXPLAIN: "match-explain.v1",
  JOB_IMPROVE: "job-improve.v1",
} as const;

export type AiFeatureKey =
  (typeof AI_FEATURE_KEYS)[keyof typeof AI_FEATURE_KEYS];
