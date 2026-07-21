import { getAdminAccessToken } from "@/modules/admin/ui/token";
import type { DashboardSummaryDto } from "@/modules/admin/ui/dashboard";
import type {
  AuditListFilters,
  AuditListResultDto,
} from "@/modules/admin/ui/audit";
import { buildAuditQueryString } from "@/modules/admin/ui/audit";
import type {
  SettingsListDto,
  SystemSettingItemDto,
} from "@/modules/admin/ui/settings";
import type { MonitoringSummaryDto } from "@/modules/admin/ui/monitoring";

export type AdminApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  requestId?: string;
};

/**
 * HTTP client for Admin UI — Admin APIs (+ /users/me for auth gate only).
 * Never imports Prisma (C-005-1).
 */
export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<AdminApiEnvelope<T>> {
  const token = getAdminAccessToken();
  if (!token) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "توکن دسترسی موجود نیست" },
    };
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, { ...init, headers });
  const json = (await response.json()) as AdminApiEnvelope<T>;
  return json;
}

export type MeBootstrap = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export async function fetchAdminBootstrap(): Promise<AdminApiEnvelope<MeBootstrap>> {
  return adminFetch<MeBootstrap>("/api/v1/users/me");
}

export async function fetchDashboardSummary(): Promise<
  AdminApiEnvelope<DashboardSummaryDto>
> {
  return adminFetch<DashboardSummaryDto>("/api/v1/admin/dashboard/summary");
}

export async function fetchAuditLogs(
  filters: AuditListFilters,
): Promise<AdminApiEnvelope<AuditListResultDto>> {
  const qs = buildAuditQueryString(filters);
  return adminFetch<AuditListResultDto>(`/api/v1/admin/audit?${qs}`);
}

export async function fetchAdminSettings(): Promise<
  AdminApiEnvelope<SettingsListDto>
> {
  return adminFetch<SettingsListDto>("/api/v1/admin/settings");
}

export async function putAdminSetting(input: {
  key: string;
  value: unknown;
}): Promise<AdminApiEnvelope<SystemSettingItemDto>> {
  return adminFetch<SystemSettingItemDto>("/api/v1/admin/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function fetchMonitoringSummary(): Promise<
  AdminApiEnvelope<MonitoringSummaryDto>
> {
  return adminFetch<MonitoringSummaryDto>(
    "/api/v1/admin/monitoring/summary",
  );
}
