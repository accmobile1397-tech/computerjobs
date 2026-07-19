import { PrismaClient, UserPrimaryType, UserStatus } from "@prisma/client";
import { hashPassword } from "@/modules/auth/utils/password.util";
import { seedLocation } from "@/modules/location/seed";
import { seedTaxonomy } from "@/modules/taxonomy/seed";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { slug: "users:read:self", nameFa: "خواندن پروفایل خود" },
  { slug: "users:update:self", nameFa: "ویرایش پروفایل خود" },
  { slug: "profile:read:own", nameFa: "خواندن پروفایل تفصیلی خود" },
  { slug: "profile:update:own", nameFa: "ویرایش پروفایل تفصیلی خود" },
  { slug: "profile:read:any", nameFa: "خواندن پروفایل (ادمین)" },
  { slug: "company:read:own", nameFa: "خواندن شرکت خود" },
  { slug: "company:update:own", nameFa: "ویرایش شرکت" },
  { slug: "company:members:manage", nameFa: "مدیریت اعضای شرکت" },
  { slug: "company:invite", nameFa: "دعوت عضو به شرکت" },
  { slug: "company:verify", nameFa: "تأیید شرکت (ادمین)" },
  { slug: "company:suspend", nameFa: "تعلیق شرکت (ادمین)" },
  { slug: "location:read", nameFa: "خواندن Location" },
  { slug: "location:write", nameFa: "مدیریت Location (ادمین)" },
  { slug: "taxonomy:read", nameFa: "خواندن Taxonomy" },
  { slug: "taxonomy:write", nameFa: "مدیریت Taxonomy" },
  { slug: "taxonomy:approve", nameFa: "تأیید پیشنهاد Taxonomy" },
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
  {
    slug: "job_seeker",
    nameFa: "کارجو",
    permissions: [
      "users:read:self",
      "users:update:self",
      "profile:read:own",
      "profile:update:own",
      "resumes:create",
      "resumes:read:own",
    ],
  },
  {
    slug: "employer",
    nameFa: "کارفرما",
    permissions: [
      "users:read:self",
      "users:update:self",
      "profile:read:own",
      "profile:update:own",
      "company:read:own",
      "company:update:own",
      "company:members:manage",
      "company:invite",
      "jobs:create",
      "jobs:read",
      "jobs:update:own",
    ],
  },
  {
    slug: "admin",
    nameFa: "مدیر",
    permissions: [
      "admin:users:read",
      "admin:users:suspend",
      "profile:read:any",
      "company:verify",
      "company:suspend",
      "location:read",
      "location:write",
      "taxonomy:read",
      "taxonomy:write",
      "taxonomy:approve",
    ],
  },
  {
    slug: "super_admin",
    nameFa: "مدیر ارشد",
    permissions: PERMISSIONS.map((p) => p.slug),
  },
];

async function main() {
  console.log("Seeding IAM + Phase 2/3 permissions...");

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

  await seedLocation(prisma);
  await seedTaxonomy(prisma);

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
