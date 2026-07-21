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
import type {
  DeliveryListFilters,
  InboxListFilters,
  NotificationDeliveryListDto,
  NotificationInboxListDto,
  NotificationMappingDto,
  NotificationMappingListDto,
  NotificationTemplateDto,
  NotificationTemplateListDto,
  PatchMappingInput,
  PatchTemplateInput,
  UpsertMappingInput,
  UpsertTemplateInput,
} from "@/modules/admin/ui/notifications";
import {
  buildDeliveriesQueryString,
  buildInboxQueryString,
  buildMappingsQueryString,
  buildTemplatesQueryString,
} from "@/modules/admin/ui/notifications";

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

const NOTIF_BASE = "/api/v1/admin/notifications";

export async function fetchNotificationTemplates(input: {
  page: number;
  limit: number;
}): Promise<AdminApiEnvelope<NotificationTemplateListDto>> {
  const qs = buildTemplatesQueryString(input.page, input.limit);
  return adminFetch<NotificationTemplateListDto>(
    `${NOTIF_BASE}/templates?${qs}`,
  );
}

export async function createNotificationTemplate(
  input: UpsertTemplateInput,
): Promise<AdminApiEnvelope<{ item: NotificationTemplateDto }>> {
  return adminFetch<{ item: NotificationTemplateDto }>(
    `${NOTIF_BASE}/templates`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function patchNotificationTemplate(
  id: string,
  input: PatchTemplateInput,
): Promise<AdminApiEnvelope<{ item: NotificationTemplateDto }>> {
  return adminFetch<{ item: NotificationTemplateDto }>(
    `${NOTIF_BASE}/templates/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function softDeleteNotificationTemplate(
  id: string,
): Promise<AdminApiEnvelope<{ item: NotificationTemplateDto }>> {
  return adminFetch<{ item: NotificationTemplateDto }>(
    `${NOTIF_BASE}/templates/${id}`,
    { method: "DELETE" },
  );
}

export async function fetchNotificationMappings(input: {
  page: number;
  limit: number;
  configVersion?: string;
}): Promise<AdminApiEnvelope<NotificationMappingListDto>> {
  const qs = buildMappingsQueryString(input);
  return adminFetch<NotificationMappingListDto>(
    `${NOTIF_BASE}/mappings?${qs}`,
  );
}

export async function createNotificationMapping(
  input: UpsertMappingInput,
): Promise<AdminApiEnvelope<{ item: NotificationMappingDto }>> {
  return adminFetch<{ item: NotificationMappingDto }>(
    `${NOTIF_BASE}/mappings`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function patchNotificationMapping(
  id: string,
  input: PatchMappingInput,
): Promise<AdminApiEnvelope<{ item: NotificationMappingDto }>> {
  return adminFetch<{ item: NotificationMappingDto }>(
    `${NOTIF_BASE}/mappings/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function fetchNotificationDeliveries(
  filters: DeliveryListFilters,
): Promise<AdminApiEnvelope<NotificationDeliveryListDto>> {
  const qs = buildDeliveriesQueryString(filters);
  return adminFetch<NotificationDeliveryListDto>(
    `${NOTIF_BASE}/deliveries?${qs}`,
  );
}

/** C-009-6: GET only — no mark-read / delete client methods. */
export async function fetchNotificationInbox(
  filters: InboxListFilters,
): Promise<AdminApiEnvelope<NotificationInboxListDto>> {
  const qs = buildInboxQueryString(filters);
  return adminFetch<NotificationInboxListDto>(`${NOTIF_BASE}/inbox?${qs}`);
}
