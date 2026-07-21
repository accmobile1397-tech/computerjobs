/**
 * RFC-005 admin permission slugs (+ Phase 10 taxonomy/location).
 * Seed wiring is P10-014 — this file is the code SoT for slug strings.
 */
export const ADMIN_PERMISSIONS = {
  DASHBOARD_READ: "admin:dashboard:read",

  USERS_READ: "admin:users:read",
  USERS_WRITE: "admin:users:write",

  COMPANIES_READ: "admin:companies:read",
  COMPANIES_WRITE: "admin:companies:write",

  JOBS_READ: "admin:jobs:read",
  JOBS_WRITE: "admin:jobs:write",

  RESUMES_READ: "admin:resumes:read",
  RESUMES_WRITE: "admin:resumes:write",

  BILLING_READ: "admin:billing:read",
  BILLING_WRITE: "admin:billing:write",

  PAYMENTS_READ: "admin:payments:read",
  PAYMENTS_WRITE: "admin:payments:write",

  AI_READ: "admin:ai:read",
  AI_WRITE: "admin:ai:write",

  NOTIFICATIONS_READ: "admin:notifications:read",
  NOTIFICATIONS_WRITE: "admin:notifications:write",

  SETTINGS_READ: "admin:settings:read",
  SETTINGS_WRITE: "admin:settings:write",

  AUDIT_READ: "admin:audit:read",
  EVENTS_READ: "admin:events:read",
  MONITORING_READ: "admin:monitoring:read",

  /** Phase 10 extension (TECHNICAL_SPEC §5.2) — not in RFC-005 table */
  TAXONOMY_READ: "admin:taxonomy:read",
  TAXONOMY_WRITE: "admin:taxonomy:write",
  LOCATION_WRITE: "admin:location:write",
} as const;

export type AdminPermissionSlug =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

export const ADMIN_PERMISSION_SLUGS: readonly AdminPermissionSlug[] =
  Object.values(ADMIN_PERMISSIONS);
