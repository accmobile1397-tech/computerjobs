/**
 * Admin dashboard DTO — mirrors API response from GET /admin/dashboard/summary.
 * Kept free of Prisma so Admin UI can import safely (C-005-1).
 */
export type DashboardSummaryDto = {
  users: { total: number };
  employers: { total: number };
  jobs: { total: number; pendingReview: number };
  applications: { total: number };
  payments: { total: number; stuck: number };
  notifications: { failedDeliveries: number };
};

export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  hint?: string;
};

/** Pure presentation mapping — no business rules. */
export function dashboardSummaryToKpis(
  summary: DashboardSummaryDto,
): DashboardKpi[] {
  return [
    {
      id: "users",
      label: "کاربران",
      value: summary.users.total,
    },
    {
      id: "employers",
      label: "کارفرمایان",
      value: summary.employers.total,
    },
    {
      id: "jobs",
      label: "آگهی‌ها",
      value: summary.jobs.total,
      hint: `${summary.jobs.pendingReview} در انتظار بررسی`,
    },
    {
      id: "applications",
      label: "درخواست‌ها",
      value: summary.applications.total,
    },
    {
      id: "payments",
      label: "پرداخت‌ها",
      value: summary.payments.total,
      hint: `${summary.payments.stuck} معلق`,
    },
    {
      id: "notif-failures",
      label: "خطای اعلان",
      value: summary.notifications.failedDeliveries,
    },
  ];
}
