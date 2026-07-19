import {
  TaxonomyEntityType,
  TaxonomySuggestionSource,
  TaxonomySuggestionStatus,
} from "@prisma/client";
import { prisma } from "@/modules/shared/prisma/client";
import {
  isReservedSlug,
  validateSlugFormat,
} from "@/modules/shared/utils/slug.util";
import { writeAuditLog } from "@/modules/auth/services/audit.service";
import {
  TaxonomyError,
  createCategory,
  createSkill,
  createSubCategory,
  createTechnology,
} from "@/modules/taxonomy/services/taxonomy.service";

export class SuggestionError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function mapSourceForUser(primaryType: string): TaxonomySuggestionSource {
  if (primaryType === "EMPLOYER") return TaxonomySuggestionSource.EMPLOYER;
  if (primaryType === "ADMIN" || primaryType === "SUPER_ADMIN") {
    return TaxonomySuggestionSource.ADMIN;
  }
  return TaxonomySuggestionSource.USER;
}

async function assertPending(id: string) {
  const row = await prisma.taxonomySuggestion.findUnique({ where: { id } });
  if (!row) throw new SuggestionError("NOT_FOUND");
  if (row.status !== TaxonomySuggestionStatus.PENDING) {
    throw new SuggestionError("SUGGESTION_NOT_PENDING");
  }
  return row;
}

export async function createSuggestion(params: {
  entityType: TaxonomyEntityType;
  proposedNameFa: string;
  proposedNameEn?: string;
  proposedSlug: string;
  proposedAliases?: string[];
  parentId?: string;
  source?: TaxonomySuggestionSource;
  aiMetadata?: Record<string, unknown>;
  createdById: string;
  creatorPrimaryType: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (!validateSlugFormat(params.proposedSlug) || isReservedSlug(params.proposedSlug)) {
    throw new SuggestionError("SLUG_RESERVED");
  }

  const source =
    params.source ??
    (params.aiMetadata ? TaxonomySuggestionSource.AI : mapSourceForUser(params.creatorPrimaryType));

  const row = await prisma.taxonomySuggestion.create({
    data: {
      entityType: params.entityType,
      proposedNameFa: params.proposedNameFa,
      proposedNameEn: params.proposedNameEn,
      proposedSlug: params.proposedSlug,
      proposedAliases: params.proposedAliases ?? [],
      parentId: params.parentId,
      source,
      aiMetadata: params.aiMetadata as object | undefined,
      createdById: params.createdById,
      status: TaxonomySuggestionStatus.PENDING,
    },
  });

  await writeAuditLog({
    userId: params.createdById,
    action: "TAXONOMY_SUGGESTION_CREATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { suggestionId: row.id, source, entityType: params.entityType },
  });

  return row;
}

export async function listSuggestions(params: {
  status?: TaxonomySuggestionStatus;
  entityType?: TaxonomyEntityType;
  source?: TaxonomySuggestionSource;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 20, 100);
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.source ? { source: params.source } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.taxonomySuggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.taxonomySuggestion.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function approveSuggestion(params: {
  suggestionId: string;
  reviewedById: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const suggestion = await assertPending(params.suggestionId);

  let mergedIntoId: string | undefined;

  switch (suggestion.entityType) {
    case TaxonomyEntityType.CATEGORY: {
      const created = await createCategory({
        nameFa: suggestion.proposedNameFa,
        nameEn: suggestion.proposedNameEn ?? undefined,
        slug: suggestion.proposedSlug,
        aliases: (suggestion.proposedAliases as string[]) ?? [],
        isOfficial: false,
        adminUserId: params.reviewedById,
      });
      mergedIntoId = (await prisma.category.findFirst({ where: { slug: created.slug } }))?.id;
      break;
    }
    case TaxonomyEntityType.SUBCATEGORY: {
      if (!suggestion.parentId) throw new SuggestionError("PARENT_NOT_FOUND");
      const created = await createSubCategory({
        categoryId: suggestion.parentId,
        nameFa: suggestion.proposedNameFa,
        nameEn: suggestion.proposedNameEn ?? undefined,
        slug: suggestion.proposedSlug,
        aliases: (suggestion.proposedAliases as string[]) ?? [],
        adminUserId: params.reviewedById,
      });
      mergedIntoId = created.id;
      break;
    }
    case TaxonomyEntityType.SKILL: {
      if (!suggestion.parentId) throw new SuggestionError("PARENT_NOT_FOUND");
      const created = await createSkill({
        subCategoryId: suggestion.parentId,
        nameFa: suggestion.proposedNameFa,
        nameEn: suggestion.proposedNameEn ?? undefined,
        slug: suggestion.proposedSlug,
        aliases: (suggestion.proposedAliases as string[]) ?? [],
        isOfficial: false,
        adminUserId: params.reviewedById,
      });
      mergedIntoId = created.id;
      break;
    }
    case TaxonomyEntityType.TECHNOLOGY: {
      if (!suggestion.parentId) throw new SuggestionError("PARENT_NOT_FOUND");
      const created = await createTechnology({
        skillId: suggestion.parentId,
        nameFa: suggestion.proposedNameFa,
        nameEn: suggestion.proposedNameEn ?? undefined,
        slug: suggestion.proposedSlug,
        aliases: (suggestion.proposedAliases as string[]) ?? [],
        adminUserId: params.reviewedById,
      });
      mergedIntoId = created.id;
      break;
    }
    default:
      throw new SuggestionError("VALIDATION_ERROR");
  }

  const updated = await prisma.taxonomySuggestion.update({
    where: { id: params.suggestionId },
    data: {
      status: TaxonomySuggestionStatus.APPROVED,
      reviewedById: params.reviewedById,
      reviewedAt: new Date(),
      mergedIntoId,
    },
  });

  await writeAuditLog({
    userId: params.reviewedById,
    action: "TAXONOMY_SUGGESTION_APPROVED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { suggestionId: params.suggestionId, mergedIntoId },
  });

  return updated;
}

export async function rejectSuggestion(params: {
  suggestionId: string;
  reviewedById: string;
  reviewNote?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await assertPending(params.suggestionId);

  const updated = await prisma.taxonomySuggestion.update({
    where: { id: params.suggestionId },
    data: {
      status: TaxonomySuggestionStatus.REJECTED,
      reviewedById: params.reviewedById,
      reviewedAt: new Date(),
      reviewNote: params.reviewNote,
    },
  });

  await writeAuditLog({
    userId: params.reviewedById,
    action: "TAXONOMY_SUGGESTION_REJECTED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { suggestionId: params.suggestionId },
  });

  return updated;
}

export async function mergeSuggestion(params: {
  suggestionId: string;
  mergedIntoId: string;
  reviewedById: string;
  reviewNote?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const suggestion = await assertPending(params.suggestionId);

  const targetExists = await (async () => {
    switch (suggestion.entityType) {
      case TaxonomyEntityType.CATEGORY:
        return prisma.category.findFirst({ where: { id: params.mergedIntoId, deletedAt: null } });
      case TaxonomyEntityType.SUBCATEGORY:
        return prisma.subCategory.findFirst({ where: { id: params.mergedIntoId, deletedAt: null } });
      case TaxonomyEntityType.SKILL:
        return prisma.skill.findFirst({ where: { id: params.mergedIntoId, deletedAt: null } });
      case TaxonomyEntityType.TECHNOLOGY:
        return prisma.technology.findFirst({ where: { id: params.mergedIntoId, deletedAt: null } });
      default:
        return null;
    }
  })();

  if (!targetExists) throw new SuggestionError("MERGE_TARGET_INVALID");

  const updated = await prisma.taxonomySuggestion.update({
    where: { id: params.suggestionId },
    data: {
      status: TaxonomySuggestionStatus.MERGED,
      reviewedById: params.reviewedById,
      reviewedAt: new Date(),
      mergedIntoId: params.mergedIntoId,
      reviewNote: params.reviewNote,
    },
  });

  await writeAuditLog({
    userId: params.reviewedById,
    action: "TAXONOMY_SUGGESTION_MERGED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { suggestionId: params.suggestionId, mergedIntoId: params.mergedIntoId },
  });

  return updated;
}

export { TaxonomyError };
