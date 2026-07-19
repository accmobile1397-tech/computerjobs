import type { PrismaClient } from "@prisma/client";
import provinces from "./data/provinces.json";
import cities from "./data/cities.json";

export async function seedLocation(prisma: PrismaClient) {
  console.log("Seeding location (31 provinces, cities)...");

  for (const p of provinces) {
    await prisma.province.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.slug,
        nameFa: p.nameFa,
        nameEn: p.nameEn,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
      },
      update: {
        slug: p.slug,
        nameFa: p.nameFa,
        nameEn: p.nameEn,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
      },
    });
  }

  for (const c of cities) {
    await prisma.city.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        provinceId: c.provinceId,
        slug: c.slug,
        nameFa: c.nameFa,
        nameEn: c.nameEn,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      },
      update: {
        provinceId: c.provinceId,
        slug: c.slug,
        nameFa: c.nameFa,
        nameEn: c.nameEn,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      },
    });
  }

  console.log(`Location seed: ${provinces.length} provinces, ${cities.length} cities`);
}
