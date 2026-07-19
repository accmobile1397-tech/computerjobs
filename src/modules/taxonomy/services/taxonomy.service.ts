import {
  TaxonomyEntityType,
  TaxonomySuggestionSource,
  TaxonomySuggestionStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  isReservedSlug,
  validateSlugFormat,
  validateWebsiteUrl,
} from "@/modules/shared/utils/slug.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";

export class TaxonomyError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function parseAliases(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string").slice(0, 20);
}

function toPublicCategory(c: {
  slug: string;
  nameFa: string;
  nameEn: string | null;
  sortOrder: number;
  aliases: unknown;
  popularityScore: number;
  isOfficial: boolean;
}) {
  return {
    slug: c.slug,
    nameFa: c.nameFa,
    nameEn: c.nameEn,
    sortOrder: c.sortOrder,
    aliases: parseAliases(c.aliases),
    popularityScore: c.popularityScore,
    isOfficial: c.isOfficial,
  };
}

export async function listCategories() {
  const rows = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map(toPublicCategory);
}

export async function getCategoryBySlug(slug: string) {
  const row = await prisma.category.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: { _count: { select: { subcategories: { where: { isActive: true, deletedAt: null } } } } },
  });
  if (!row) throw new TaxonomyError("TAXONOMY_NOT_FOUND");
  return { ...toPublicCategory(row), subcategoryCount: row._count.subcategories };
}

export async function listSubcategoriesByCategorySlug(categorySlug: string) {
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug, isActive: true, deletedAt: null },
  });
  if (!category) throw new TaxonomyError("TAXONOMY_NOT_FOUND");

  const rows = await prisma.subCategory.findMany({
    where: { categoryId: category.id, isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map((s) => ({
    slug: s.slug,
    nameFa: s.nameFa,
    nameEn: s.nameEn,
    sortOrder: s.sortOrder,
    aliases: parseAliases(s.aliases),
    popularityScore: s.popularityScore,
    categorySlug: category.slug,
  }));
}

export async function listSkillsBySubcategorySlug(subcategorySlug: string) {
  const sub = await prisma.subCategory.findFirst({
    where: { slug: subcategorySlug, isActive: true, deletedAt: null },
    include: { category: { select: { slug: true } } },
  });
  if (!sub) throw new TaxonomyError("TAXONOMY_NOT_FOUND");

  const rows = await prisma.skill.findMany({
    where: { subCategoryId: sub.id, isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map((s) => ({
    slug: s.slug,
    nameFa: s.nameFa,
    nameEn: s.nameEn,
    sortOrder: s.sortOrder,
    aliases: parseAliases(s.aliases),
    popularityScore: s.popularityScore,
    isOfficial: s.isOfficial,
    subcategorySlug: sub.slug,
    categorySlug: sub.category.slug,
  }));
}

export async function getSkillBySlug(slug: string) {
  const row = await prisma.skill.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      subCategory: { include: { category: { select: { slug: true } } } },
      _count: { select: { technologies: { where: { isActive: true, deletedAt: null } } } },
    },
  });
  if (!row) throw new TaxonomyError("TAXONOMY_NOT_FOUND");
  return {
    slug: row.slug,
    nameFa: row.nameFa,
    nameEn: row.nameEn,
    aliases: parseAliases(row.aliases),
    popularityScore: row.popularityScore,
    isOfficial: row.isOfficial,
    subcategorySlug: row.subCategory.slug,
    categorySlug: row.subCategory.category.slug,
    technologyCount: row._count.technologies,
  };
}

export async function listTechnologiesBySkillSlug(skillSlug: string) {
  const skill = await prisma.skill.findFirst({
    where: { slug: skillSlug, isActive: true, deletedAt: null },
  });
  if (!skill) throw new TaxonomyError("TAXONOMY_NOT_FOUND");

  const rows = await prisma.technology.findMany({
    where: { skillId: skill.id, isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map((t) => ({
    slug: t.slug,
    nameFa: t.nameFa,
    nameEn: t.nameEn,
    aliases: parseAliases(t.aliases),
    popularityScore: t.popularityScore,
    officialUrl: t.officialUrl,
    skillSlug,
  }));
}

export async function getTechnologyBySlug(slug: string) {
  const row = await prisma.technology.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: { skill: { include: { subCategory: { include: { category: { select: { slug: true } } } } } } },
  });
  if (!row) throw new TaxonomyError("TAXONOMY_NOT_FOUND");
  return {
    slug: row.slug,
    nameFa: row.nameFa,
    nameEn: row.nameEn,
    aliases: parseAliases(row.aliases),
    popularityScore: row.popularityScore,
    officialUrl: row.officialUrl,
    skillSlug: row.skill.slug,
    subcategorySlug: row.skill.subCategory.slug,
    categorySlug: row.skill.subCategory.category.slug,
  };
}

export async function assertActiveCategory(categoryId: string) {
  const row = await prisma.category.findFirst({
    where: { id: categoryId, isActive: true, deletedAt: null },
  });
  if (!row) throw new TaxonomyError("TAXONOMY_NOT_FOUND");
  return row;
}

function assertSlug(slug: string) {
  if (!validateSlugFormat(slug) || isReservedSlug(slug)) {
    throw new TaxonomyError("SLUG_RESERVED");
  }
}

export async function createCategory(params: {
  nameFa: string;
  nameEn?: string;
  slug: string;
  description?: string;
  aliases?: string[];
  isOfficial?: boolean;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  assertSlug(params.slug);
  const taken = await prisma.category.findFirst({ where: { slug: params.slug, deletedAt: null } });
  if (taken) throw new TaxonomyError("SLUG_TAKEN");

  const row = await prisma.category.create({
    data: {
      nameFa: params.nameFa,
      nameEn: params.nameEn,
      slug: params.slug,
      description: params.description,
      aliases: params.aliases ?? [],
      isOfficial: params.isOfficial ?? false,
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "CATEGORY_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { categoryId: row.id },
  });

  return toPublicCategory(row);
}

export async function deleteCategory(params: {
  categoryId: string;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const row = await prisma.category.findFirst({ where: { id: params.categoryId, deletedAt: null } });
  if (!row) throw new TaxonomyError("TAXONOMY_NOT_FOUND");
  if (row.isOfficial) throw new TaxonomyError("CATEGORY_OFFICIAL_PROTECTED");

  await prisma.category.update({
    where: { id: params.categoryId },
    data: { deletedAt: new Date(), isActive: false },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "CATEGORY_DELETED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { categoryId: params.categoryId },
  });

  return { id: params.categoryId };
}

export async function createSubCategory(params: {
  categoryId: string;
  nameFa: string;
  nameEn?: string;
  slug: string;
  aliases?: string[];
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  assertSlug(params.slug);
  const parent = await prisma.category.findFirst({
    where: { id: params.categoryId, deletedAt: null, isActive: true },
  });
  if (!parent) throw new TaxonomyError("PARENT_NOT_FOUND");

  const taken = await prisma.subCategory.findFirst({
    where: { categoryId: params.categoryId, slug: params.slug, deletedAt: null },
  });
  if (taken) throw new TaxonomyError("SLUG_TAKEN");

  const row = await prisma.subCategory.create({
    data: {
      categoryId: params.categoryId,
      nameFa: params.nameFa,
      nameEn: params.nameEn,
      slug: params.slug,
      aliases: params.aliases ?? [],
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "SUBCATEGORY_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { subCategoryId: row.id },
  });

  return row;
}

export async function createSkill(params: {
  subCategoryId: string;
  nameFa: string;
  nameEn?: string;
  slug: string;
  aliases?: string[];
  isOfficial?: boolean;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  assertSlug(params.slug);
  const parent = await prisma.subCategory.findFirst({
    where: { id: params.subCategoryId, deletedAt: null, isActive: true },
  });
  if (!parent) throw new TaxonomyError("PARENT_NOT_FOUND");

  const taken = await prisma.skill.findFirst({ where: { slug: params.slug, deletedAt: null } });
  if (taken) throw new TaxonomyError("SLUG_TAKEN");

  const row = await prisma.skill.create({
    data: {
      subCategoryId: params.subCategoryId,
      nameFa: params.nameFa,
      nameEn: params.nameEn,
      slug: params.slug,
      aliases: params.aliases ?? [],
      isOfficial: params.isOfficial ?? false,
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "SKILL_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { skillId: row.id },
  });

  return row;
}

export async function createTechnology(params: {
  skillId: string;
  nameFa: string;
  nameEn?: string;
  slug: string;
  aliases?: string[];
  officialUrl?: string;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  assertSlug(params.slug);
  if (params.officialUrl && !validateWebsiteUrl(params.officialUrl)) {
    throw new TaxonomyError("VALIDATION_ERROR");
  }
  const parent = await prisma.skill.findFirst({
    where: { id: params.skillId, deletedAt: null, isActive: true },
  });
  if (!parent) throw new TaxonomyError("PARENT_NOT_FOUND");

  const taken = await prisma.technology.findFirst({ where: { slug: params.slug, deletedAt: null } });
  if (taken) throw new TaxonomyError("SLUG_TAKEN");

  const row = await prisma.technology.create({
    data: {
      skillId: params.skillId,
      nameFa: params.nameFa,
      nameEn: params.nameEn,
      slug: params.slug,
      aliases: params.aliases ?? [],
      officialUrl: params.officialUrl,
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "TECHNOLOGY_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { technologyId: row.id },
  });

  return row;
}

export { TaxonomyEntityType, TaxonomySuggestionSource, TaxonomySuggestionStatus };
