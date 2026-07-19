import { PrismaClient, UserPrimaryType, UserStatus } from "@prisma/client";
import { hashPassword } from "@/modules/auth/utils/password.util";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { slug: "users:read:self", nameFa: "خواندن پروفایل خود" },
  { slug: "users:update:self", nameFa: "ویرایش پروفایل خود" },
  { slug: "resumes:create", nameFa: "ایجاد رزومه" },
  { slug: "resumes:read:own", nameFa: "خواندن رزومه خود" },
  { slug: "jobs:create", nameFa: "ایجاد آگهی" },
  { slug: "jobs:read", nameFa: "خواندن آگهی‌ها" },
  { slug: "jobs:update:own", nameFa: "ویرایش آگهی خود" },
  { slug: "admin:users:read", nameFa: "مشاهده کاربران" },
  { slug: "admin:users:suspend", nameFa: "تعلیق کاربر" },
  { slug: "admin:roles:manage", nameFa: "مدیریت نقش‌ها" },
];

const ROLES = [
  { slug: "job_seeker", nameFa: "کارجو", permissions: ["users:read:self", "users:update:self", "resumes:create", "resumes:read:own"] },
  { slug: "employer", nameFa: "کارفرما", permissions: ["users:read:self", "users:update:self", "jobs:create", "jobs:read", "jobs:update:own"] },
  { slug: "admin", nameFa: "مدیر", permissions: ["admin:users:read", "admin:users:suspend"] },
  { slug: "super_admin", nameFa: "مدیر ارشد", permissions: PERMISSIONS.map((p) => p.slug) },
];

async function main() {
  console.log("Seeding IAM data...");

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      create: perm,
      update: { nameFa: perm.nameFa, deletedAt: null },
    });
  }

  for (const role of ROLES) {
    const dbRole = await prisma.role.upsert({
      where: { slug: role.slug },
      create: { slug: role.slug, nameFa: role.nameFa, isSystem: true },
      update: { nameFa: role.nameFa, deletedAt: null },
    });

    for (const permSlug of role.permissions) {
      const perm = await prisma.permission.findFirst({ where: { slug: permSlug } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: dbRole.id, permissionId: perm.id },
        },
        create: { roleId: dbRole.id, permissionId: perm.id },
        update: { deletedAt: null },
      });
    }
  }

  const superEmail = process.env.SEED_SUPERADMIN_EMAIL ?? "admin@computerjobs.ir";
  const superPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? "ChangeMe123!";

  const existing = await prisma.user.findFirst({ where: { email: superEmail } });
  if (!existing) {
    const passwordHash = await hashPassword(superPassword);
    const user = await prisma.user.create({
      data: {
        email: superEmail,
        passwordHash,
        primaryType: UserPrimaryType.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const superRole = await prisma.role.findFirst({ where: { slug: "super_admin" } });
    if (superRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: superRole.id },
      });
    }
    console.log(`SuperAdmin seeded: ${superEmail}`);
  }

  console.log("IAM seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
