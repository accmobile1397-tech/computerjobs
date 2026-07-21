export { ADMIN_PERMISSIONS, ADMIN_PERMISSION_SLUGS } from "./registry";
export type { AdminPermissionSlug } from "./registry";

export {
  LEGACY_ADMIN_ALIASES,
  resolveAdminPermissionSlugs,
} from "./aliases";

export { requireAdminPermission } from "./require-admin-permission";
