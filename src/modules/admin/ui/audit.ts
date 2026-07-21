/** Audit viewer DTOs — free of Prisma (C-005-1). */

export type AuditLogItemDto = {
  id: string;
  userId: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
};

export type AuditListResultDto = {
  items: AuditLogItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AuditListFilters = {
  page: number;
  pageSize: number;
  action: string;
  userId: string;
  from: string;
  to: string;
};

export const DEFAULT_AUDIT_FILTERS: AuditListFilters = {
  page: 1,
  pageSize: 20,
  action: "",
  userId: "",
  from: "",
  to: "",
};

/**
 * Common AuditAction values for the filter dropdown (presentation only).
 * Server validates against the real enum.
 */
export const AUDIT_ACTION_FILTER_OPTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "REGISTER",
  "USER_SUSPENDED",
  "ROLE_CHANGED",
  "COMPANY_CREATED",
  "COMPANY_STATUS_CHANGED",
  "JOB_APPROVED",
  "JOB_PUBLISHED",
  "APPLICATION_SUBMITTED",
  "SYSTEM_SETTING_UPDATED",
  "PLAN_FEATURE_VERSIONED",
  "BILLING_ADMIN_GRANT",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "AI_REQUEST_COMPLETED",
  "AI_REQUEST_FAILED",
] as const;

/** Build query string for GET /api/v1/admin/audit — no business logic. */
export function buildAuditQueryString(filters: AuditListFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  if (filters.action.trim()) params.set("action", filters.action.trim());
  if (filters.userId.trim()) params.set("userId", filters.userId.trim());
  if (filters.from.trim()) {
    params.set("from", new Date(filters.from).toISOString());
  }
  if (filters.to.trim()) {
    params.set("to", new Date(filters.to).toISOString());
  }
  return params.toString();
}

export function formatAuditDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
