export const FEATURE_KEYS = {
  APPLICATION_PER_MONTH: "application.per_month",
  JOB_POST_PER_MONTH: "job_post.per_month",
  JOB_CONCURRENT_PUBLISHED: "job.concurrent_published",
  RESUME_VIEW_PER_MONTH: "resume_view.per_month",
  CONTACT_UNLOCK_PER_MONTH: "contact_unlock.per_month",
  RESUME_SEARCH_PER_DAY: "resume_search.per_day",
  MATCH_SCORE_PER_DAY: "match_score.per_day",
  MATCH_SCORE_EMPLOYER_PER_DAY: "match_score.employer.per_day",
  COMPANY_SEATS: "company.seats",
  JOB_FEATURED_SLOTS: "job.featured_slots",
  JOB_URGENT_SLOTS: "job.urgent_slots",
  SAVED_SEARCH_MAX: "saved_search.max",
  JOB_ALERT_MAX: "job_alert.max",
  AI_CREDIT_INCLUDED: "ai_credit.included_period",
} as const;

/** Maps feature keys that can fall back to wallet consumables */
export const FEATURE_TO_CONSUMABLE: Record<string, string> = {
  "job_post.per_month": "JOB_POST",
  "resume_view.per_month": "RESUME_VIEW",
  "contact_unlock.per_month": "CONTACT_UNLOCK",
};

export const SETTING_KEYS = {
  TIMEZONE: "billing.timezone",
  QUOTA_JOB_CRON: "billing.quota_job_cron",
  VIEW_WINDOW_DAYS: "billing.resume_view_window_days",
  REPUBLISH_WINDOW_DAYS: "billing.job_republish_window_days",
} as const;
