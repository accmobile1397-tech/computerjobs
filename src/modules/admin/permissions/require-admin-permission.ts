import { findPermissionsByUserId } from "@/modules/authorization/repositories/permission.repository";
import { AuthorizationError } from "@/modules/authorization/services/authorization.service";
import { resolveAdminPermissionSlugs } from "@/modules/admin/permissions/aliases";

/**
 * Require an admin capability, accepting legacy OR `admin:*` slugs (C-010-3).
 * Does not modify routes — callers adopt this helper in later tasks.
 */
export async function requireAdminPermission(
  userId: string,
  permissionSlug: string,
): Promise<void> {
  const acceptable = resolveAdminPermissionSlugs(permissionSlug);
  const held = await findPermissionsByUserId(userId);
  const allowed = acceptable.some((slug) => held.includes(slug));

  if (!allowed) {
    throw new AuthorizationError("PERMISSION_DENIED");
  }
}
