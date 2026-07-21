export { ADMIN_PERMISSIONS, ADMIN_PERMISSION_SLUGS } from "./registry";
export type { AdminPermissionSlug } from "./registry";

export {
  LEGACY_ADMIN_ALIASES,
  resolveAdminPermissionSlugs,
} from "./aliases";

export { requireAdminPermission } from "./require-admin-permission";

export {
  ADMIN_PERMISSION_NAME_FA,
  ADMIN_ROLE_ADMIN_NAMESPACE_GRANTS,
  getAdminPermissionSeedRows,
  mergePermissionSeedRows,
} from "./seed-catalog";
export type { PermissionSeedRow } from "./seed-catalog";
