import {
  AuthorizationError,
  loadAuthorizationContext,
} from "@/modules/authorization/services/authorization.service";
import { userHasPermission } from "@/modules/authorization/repositories/permission.repository";

/**
 * Gate admin notification APIs until P9-014 seeds `notifications:admin`.
 * Accepts existing admin/super_admin roles OR the future permission slug.
 */
export async function requireNotificationAdmin(userId: string): Promise<void> {
  const ctx = await loadAuthorizationContext(userId);
  const isAdminRole = ctx.roles.some(
    (role) => role === "admin" || role === "super_admin"
  );
  if (isAdminRole) return;

  const allowed = await userHasPermission(userId, "notifications:admin");
  if (!allowed) {
    throw new AuthorizationError("PERMISSION_DENIED");
  }
}
