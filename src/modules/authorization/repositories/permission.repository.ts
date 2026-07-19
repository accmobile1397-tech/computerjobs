import { prisma } from "@/modules/shared/prisma/client";

export async function findPermissionsByUserId(
  userId: string,
): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId, deletedAt: null, role: { deletedAt: null } },
    include: {
      role: {
        include: {
          rolePermissions: {
            where: { deletedAt: null },
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const slugs = new Set<string>();
  for (const ur of userRoles) {
    for (const rp of ur.role.rolePermissions) {
      if (rp.permission.deletedAt === null) {
        slugs.add(rp.permission.slug);
      }
    }
  }
  return [...slugs];
}

export async function findRolesByUserId(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId, deletedAt: null, role: { deletedAt: null } },
    include: { role: true },
  });
  return userRoles.map((ur) => ur.role.slug);
}

export async function userHasPermission(
  userId: string,
  permissionSlug: string,
): Promise<boolean> {
  const permissions = await findPermissionsByUserId(userId);
  return permissions.includes(permissionSlug);
}

export async function findPermissionBySlug(slug: string) {
  return prisma.permission.findFirst({
    where: { slug, deletedAt: null },
  });
}

export async function findRoleBySlug(slug: string) {
  return prisma.role.findFirst({
    where: { slug, deletedAt: null },
  });
}
