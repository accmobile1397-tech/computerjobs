import type { PrismaClient } from "@prisma/client";
import categories from "./data/categories.json";
import subcategories from "./data/subcategories.json";
import skills from "./data/skills.json";
import technologies from "./data/technologies.json";

export async function seedTaxonomy(prisma: PrismaClient) {
  console.log("Seeding taxonomy...");

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        slug: c.slug,
        nameFa: c.nameFa,
        nameEn: c.nameEn,
        isOfficial: c.isOfficial,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
        aliases: c.aliases,
        popularityScore: c.popularityScore,
      },
      update: {
        slug: c.slug,
        nameFa: c.nameFa,
        nameEn: c.nameEn,
        isOfficial: c.isOfficial,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
        aliases: c.aliases,
        popularityScore: c.popularityScore,
      },
    });
  }

  for (const s of subcategories) {
    await prisma.subCategory.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        categoryId: s.categoryId,
        slug: s.slug,
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
        popularityScore: s.popularityScore,
      },
      update: {
        categoryId: s.categoryId,
        slug: s.slug,
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
        popularityScore: s.popularityScore,
      },
    });
  }

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        subCategoryId: s.subCategoryId,
        slug: s.slug,
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        isOfficial: s.isOfficial,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
        popularityScore: s.popularityScore,
      },
      update: {
        subCategoryId: s.subCategoryId,
        slug: s.slug,
        nameFa: s.nameFa,
        nameEn: s.nameEn,
        isOfficial: s.isOfficial,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
        aliases: s.aliases,
        popularityScore: s.popularityScore,
      },
    });
  }

  for (const t of technologies) {
    await prisma.technology.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        skillId: t.skillId,
        slug: t.slug,
        nameFa: t.nameFa,
        nameEn: t.nameEn,
        isActive: t.isActive,
        sortOrder: t.sortOrder,
        aliases: t.aliases,
        popularityScore: t.popularityScore,
        officialUrl: t.officialUrl,
      },
      update: {
        skillId: t.skillId,
        slug: t.slug,
        nameFa: t.nameFa,
        nameEn: t.nameEn,
        isActive: t.isActive,
        sortOrder: t.sortOrder,
        aliases: t.aliases,
        popularityScore: t.popularityScore,
        officialUrl: t.officialUrl,
      },
    });
  }

  console.log(
    `Taxonomy seed: ${categories.length} categories, ${subcategories.length} subcategories, ${skills.length} skills, ${technologies.length} technologies`,
  );
}
