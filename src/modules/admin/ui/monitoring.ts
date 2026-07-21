/**
 * Monitoring UI DTOs — mirrors GET /api/v1/admin/monitoring/summary.
 * Free of Prisma / infra clients (C-005-1). Read-only viewer only.
 */

export type MonitoringCheckStatus = "ok" | "error";
export type MonitoringOverallStatus = "ok" | "degraded";

export type MonitoringSummaryDto = {
  status: MonitoringOverallStatus;
  checks: {
    database: MonitoringCheckStatus;
    redis: MonitoringCheckStatus;
  };
  counters: {
    domainEventsLast24h: number;
    paymentsStuck: number;
  };
};

export type MonitoringCheckRow = {
  id: "database" | "redis";
  label: string;
  status: MonitoringCheckStatus;
};

export type MonitoringCounterRow = {
  id: string;
  label: string;
  value: number;
  hint?: string;
};

/** Persian label for overall platform status. */
export function formatMonitoringStatus(
  status: MonitoringOverallStatus,
): string {
  return status === "ok" ? "سالم" : "اختلال";
}

/** Persian label for a single health check. */
export function formatCheckStatus(status: MonitoringCheckStatus): string {
  return status === "ok" ? "سالم" : "خطا";
}

/** Presentation-only mapping — no business rules or infra calls. */
export function monitoringChecksToRows(
  summary: MonitoringSummaryDto,
): MonitoringCheckRow[] {
  return [
    {
      id: "database",
      label: "پایگاه‌داده",
      status: summary.checks.database,
    },
    {
      id: "redis",
      label: "Redis",
      status: summary.checks.redis,
    },
  ];
}

/** Presentation-only mapping for counters provided by the Admin API. */
export function monitoringCountersToRows(
  summary: MonitoringSummaryDto,
): MonitoringCounterRow[] {
  return [
    {
      id: "domain-events-24h",
      label: "رویدادهای دامنه (۲۴ ساعت)",
      value: summary.counters.domainEventsLast24h,
    },
    {
      id: "payments-stuck",
      label: "پرداخت‌های معلق",
      value: summary.counters.paymentsStuck,
      hint: "وضعیت PENDING / PROCESSING",
    },
  ];
}
