/**
 * Phase 10 IAM seed catalog (P10-014).
 * SoT for admin:* slug strings remains registry.ts; this file adds seed metadata + role grants.
 */
import {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_SLUGS,
  type AdminPermissionSlug,
} from "@/modules/admin/permissions/registry";

/** Persian display names for admin:* permission rows. */
export const ADMIN_PERMISSION_NAME_FA: Record<AdminPermissionSlug, string> = {
  [ADMIN_PERMISSIONS.DASHBOARD_READ]: "مشاهده داشبورد ادمین",
  [ADMIN_PERMISSIONS.USERS_READ]: "مشاهده کاربران",
  [ADMIN_PERMISSIONS.USERS_WRITE]: "ویرایش کاربران (تعلیق/نقش)",
  [ADMIN_PERMISSIONS.COMPANIES_READ]: "مشاهده شرکت‌ها",
  [ADMIN_PERMISSIONS.COMPANIES_WRITE]: "ویرایش شرکت‌ها (تأیید/تعلیق)",
  [ADMIN_PERMISSIONS.JOBS_READ]: "مشاهده آگهی‌ها (ادمین)",
  [ADMIN_PERMISSIONS.JOBS_WRITE]: "مدیریت آگهی‌ها (تأیید/رد)",
  [ADMIN_PERMISSIONS.RESUMES_READ]: "مشاهده رزومه‌ها (ادمین)",
  [ADMIN_PERMISSIONS.RESUMES_WRITE]: "ویرایش وضعیت رزومه (ادمین)",
  [ADMIN_PERMISSIONS.BILLING_READ]: "مشاهده صورتحساب (ادمین)",
  [ADMIN_PERMISSIONS.BILLING_WRITE]: "مدیریت صورتحساب (ادمین)",
  [ADMIN_PERMISSIONS.PAYMENTS_READ]: "مشاهده پرداخت‌ها",
  [ADMIN_PERMISSIONS.PAYMENTS_WRITE]: "عملیات پرداخت (ادمین)",
  [ADMIN_PERMISSIONS.AI_READ]: "مشاهده تنظیمات AI",
  [ADMIN_PERMISSIONS.AI_WRITE]: "مدیریت AI (ادمین)",
  [ADMIN_PERMISSIONS.NOTIFICATIONS_READ]: "مشاهده اعلان‌ها (ادمین)",
  [ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE]: "مدیریت اعلان‌ها (ادمین)",
  [ADMIN_PERMISSIONS.SETTINGS_READ]: "مشاهده تنظیمات سیستم",
  [ADMIN_PERMISSIONS.SETTINGS_WRITE]: "ویرایش تنظیمات سیستم",
  [ADMIN_PERMISSIONS.AUDIT_READ]: "مشاهده حسابرسی",
  [ADMIN_PERMISSIONS.EVENTS_READ]: "مشاهده رویدادهای دامنه",
  [ADMIN_PERMISSIONS.MONITORING_READ]: "مشاهده مانیتورینگ",
  [ADMIN_PERMISSIONS.TAXONOMY_READ]: "مشاهده Taxonomy (ادمین)",
  [ADMIN_PERMISSIONS.TAXONOMY_WRITE]: "مدیریت Taxonomy (ادمین)",
  [ADMIN_PERMISSIONS.LOCATION_WRITE]: "مدیریت Location (ادمین)",
};

export type PermissionSeedRow = { slug: string; nameFa: string };

/** All RFC-005 / Phase 10 admin:* rows for upsert into Permission. */
export function getAdminPermissionSeedRows(): PermissionSeedRow[] {
  return ADMIN_PERMISSION_SLUGS.map((slug) => ({
    slug,
    nameFa: ADMIN_PERMISSION_NAME_FA[slug],
  }));
}

/**
 * admin role grants for the admin:* namespace (TECHNICAL_SPEC §5.1).
 * Legacy slugs (billing:admin, notifications:admin, …) remain in prisma/seed.ts — C-010-3.
 * Includes write where the role already held equivalent legacy admin power.
 */
export const ADMIN_ROLE_ADMIN_NAMESPACE_GRANTS: readonly AdminPermissionSlug[] = [
  ADMIN_PERMISSIONS.DASHBOARD_READ,
  ADMIN_PERMISSIONS.AUDIT_READ,
  ADMIN_PERMISSIONS.USERS_READ,
  ADMIN_PERMISSIONS.COMPANIES_READ,
  ADMIN_PERMISSIONS.COMPANIES_WRITE,
  ADMIN_PERMISSIONS.JOBS_READ,
  ADMIN_PERMISSIONS.JOBS_WRITE,
  ADMIN_PERMISSIONS.TAXONOMY_READ,
  ADMIN_PERMISSIONS.TAXONOMY_WRITE,
  ADMIN_PERMISSIONS.LOCATION_WRITE,
  ADMIN_PERMISSIONS.NOTIFICATIONS_READ,
  ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE,
  ADMIN_PERMISSIONS.SETTINGS_READ,
  ADMIN_PERMISSIONS.BILLING_READ,
  ADMIN_PERMISSIONS.BILLING_WRITE,
  ADMIN_PERMISSIONS.AI_READ,
  ADMIN_PERMISSIONS.AI_WRITE,
] as const;

/** Merge base + admin:* rows; admin:* nameFa wins on slug collision (e.g. admin:users:read). */
export function mergePermissionSeedRows(
  base: readonly PermissionSeedRow[],
  adminStar: readonly PermissionSeedRow[] = getAdminPermissionSeedRows(),
): PermissionSeedRow[] {
  const bySlug = new Map<string, PermissionSeedRow>();
  for (const row of base) bySlug.set(row.slug, row);
  for (const row of adminStar) bySlug.set(row.slug, row);
  return [...bySlug.values()];
}
