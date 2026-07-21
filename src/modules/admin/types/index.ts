/**
 * Shared admin DTOs (Phase 10).
 * Viewers are read-mostly; writes go through dedicated services + audit.
 */

/** Cursor-style list query for admin viewers */
export type AdminListQuery = {
  page?: number;
  pageSize?: number;
};

export type AdminListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Planned orchestration services (stubs land in later tasks) */
export type AdminServiceName =
  | "dashboard"
  | "audit-viewer"
  | "event-viewer"
  | "settings"
  | "monitoring"
  | "billing-admin";
