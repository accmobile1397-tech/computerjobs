import {
  ADMIN_PERMISSIONS,
  type AdminPermissionSlug,
} from "@/modules/admin/permissions/registry";

/**
 * Legacy → admin:* aliases (C-010-3 / D-054).
 * Holding a legacy slug grants the listed admin capabilities during migration.
 * Seed of admin:* slugs is P10-014 — do not remove legacy until deprecation RFC.
 */
export const LEGACY_ADMIN_ALIASES: Readonly<
  Record<string, readonly AdminPermissionSlug[]>
> = {
  "billing:admin": [
    ADMIN_PERMISSIONS.BILLING_READ,
    ADMIN_PERMISSIONS.BILLING_WRITE,
  ],
  "notifications:admin": [
    ADMIN_PERMISSIONS.NOTIFICATIONS_READ,
    ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE,
  ],
  "company:verify": [ADMIN_PERMISSIONS.COMPANIES_WRITE],
  "company:suspend": [ADMIN_PERMISSIONS.COMPANIES_WRITE],
  "job:approve": [ADMIN_PERMISSIONS.JOBS_WRITE],
  "taxonomy:read": [ADMIN_PERMISSIONS.TAXONOMY_READ],
  "taxonomy:write": [ADMIN_PERMISSIONS.TAXONOMY_WRITE],
  "taxonomy:approve": [ADMIN_PERMISSIONS.TAXONOMY_WRITE],
  "location:write": [ADMIN_PERMISSIONS.LOCATION_WRITE],
  "ai:admin": [ADMIN_PERMISSIONS.AI_READ, ADMIN_PERMISSIONS.AI_WRITE],
  /** Pre-Phase-10 seeded slug — treats as users write during migration */
  "admin:users:suspend": [ADMIN_PERMISSIONS.USERS_WRITE],
};

/**
 * Expand a required permission into all acceptable slugs (legacy ↔ admin:*).
 * Pure — used by requireAdminPermission and unit tests.
 */
export function resolveAdminPermissionSlugs(
  requiredSlug: string,
): readonly string[] {
  const acceptable = new Set<string>([requiredSlug]);

  const forward = LEGACY_ADMIN_ALIASES[requiredSlug];
  if (forward) {
    for (const slug of forward) {
      acceptable.add(slug);
    }
  }

  for (const [legacy, adminSlugs] of Object.entries(LEGACY_ADMIN_ALIASES)) {
    if ((adminSlugs as readonly string[]).includes(requiredSlug)) {
      acceptable.add(legacy);
    }
  }

  return [...acceptable];
}
