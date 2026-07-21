/**
 * Admin module public surface.
 * Permissions → P10-002 · services → P10-004..007
 */
export type * from "./types";
export {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_SLUGS,
  LEGACY_ADMIN_ALIASES,
  resolveAdminPermissionSlugs,
  requireAdminPermission,
} from "./permissions";
export type { AdminPermissionSlug } from "./permissions";
