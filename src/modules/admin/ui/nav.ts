import { LEGACY_ADMIN_ALIASES } from "@/modules/admin/permissions/aliases";

const LEGACY_SLUGS = new Set(Object.keys(LEGACY_ADMIN_ALIASES));

/** True if the user may enter the admin shell. */
export function canAccessAdminPanel(
  permissions: readonly string[],
  roles: readonly string[],
): boolean {
  if (roles.includes("super_admin") || roles.includes("admin")) {
    return true;
  }
  return permissions.some(
    (slug) => slug.startsWith("admin:") || LEGACY_SLUGS.has(slug),
  );
}

export type AdminNavItem = {
  href: string;
  label: string;
  /** Permission slug that reveals the item (optional — shown if any admin access). */
  permission?: string;
};

/** Shell navigation (Persian labels). Page bodies land in later tasks. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin/dashboard", label: "داشبورد", permission: "admin:dashboard:read" },
  { href: "/admin/audit", label: "حسابرسی", permission: "admin:audit:read" },
  { href: "/admin/events", label: "رویدادها", permission: "admin:events:read" },
  { href: "/admin/settings", label: "تنظیمات", permission: "admin:settings:read" },
  { href: "/admin/monitoring", label: "مانیتورینگ", permission: "admin:monitoring:read" },
  {
    href: "/admin/notifications",
    label: "اعلان‌ها",
    permission: "admin:notifications:read",
  },
  { href: "/admin/billing", label: "صورتحساب", permission: "admin:billing:read" },
] as const;

export function filterAdminNav(
  items: readonly AdminNavItem[],
  permissions: readonly string[],
  roles: readonly string[],
): AdminNavItem[] {
  if (roles.includes("super_admin")) {
    return [...items];
  }
  return items.filter((item) => {
    if (!item.permission) return true;
    if (permissions.includes(item.permission)) return true;
    // Legacy: billing:admin covers billing read, etc.
    for (const [legacy, aliases] of Object.entries(LEGACY_ADMIN_ALIASES)) {
      if (
        permissions.includes(legacy) &&
        (aliases as readonly string[]).includes(item.permission)
      ) {
        return true;
      }
    }
    if (roles.includes("admin")) return true;
    return false;
  });
}
