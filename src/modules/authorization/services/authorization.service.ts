import {
  findPermissionsByUserId,
  findRolesByUserId,
  userHasPermission,
} from "@/modules/authorization/repositories/permission.repository";

export async function loadAuthorizationContext(userId: string) {
  const [roles, permissions] = await Promise.all([
    findRolesByUserId(userId),
    findPermissionsByUserId(userId),
  ]);
  return { roles, permissions };
}

export async function requirePermission(
  userId: string,
  permissionSlug: string,
): Promise<void> {
  const allowed = await userHasPermission(userId, permissionSlug);
  if (!allowed) {
    throw new AuthorizationError("PERMISSION_DENIED");
  }
}

export class AuthorizationError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "AuthorizationError";
  }
}
