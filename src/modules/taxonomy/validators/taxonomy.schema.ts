import { z } from "zod";
import {
  TaxonomyEntityType,
  TaxonomySuggestionSource,
  TaxonomySuggestionStatus,
} from "@prisma/client";

const slugSchema = z
  .string()
  .min(2)
  .max(220)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createSuggestionSchema = z.object({
  entityType: z.nativeEnum(TaxonomyEntityType),
  proposedNameFa: z.string().min(1).max(200),
  proposedNameEn: z.string().max(200).optional(),
  proposedSlug: slugSchema,
  proposedAliases: z.array(z.string().max(100)).max(20).optional(),
  parentId: z.string().uuid().optional(),
  source: z.nativeEnum(TaxonomySuggestionSource).optional(),
  aiMetadata: z.record(z.string(), z.unknown()).optional(),
});

export const rejectSuggestionSchema = z.object({
  reviewNote: z.string().max(500).optional(),
});

export const mergeSuggestionSchema = z.object({
  mergedIntoId: z.string().uuid(),
  reviewNote: z.string().max(500).optional(),
});

export const createCategorySchema = z.object({
  nameFa: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  slug: slugSchema,
  description: z.string().max(5000).optional(),
  aliases: z.array(z.string().max(100)).max(20).optional(),
  isOfficial: z.boolean().optional(),
});

export const createSkillSchema = z.object({
  subCategoryId: z.string().uuid(),
  nameFa: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  slug: slugSchema,
  aliases: z.array(z.string().max(100)).max(20).optional(),
  isOfficial: z.boolean().optional(),
});

export const createTechnologySchema = z.object({
  skillId: z.string().uuid(),
  nameFa: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  slug: slugSchema,
  aliases: z.array(z.string().max(100)).max(20).optional(),
  officialUrl: z.string().url().max(512).optional(),
});

export const listSuggestionsQuerySchema = z.object({
  status: z.nativeEnum(TaxonomySuggestionStatus).optional(),
  entityType: z.nativeEnum(TaxonomyEntityType).optional(),
  source: z.nativeEnum(TaxonomySuggestionSource).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type RejectSuggestionInput = z.infer<typeof rejectSuggestionSchema>;
export type MergeSuggestionInput = z.infer<typeof mergeSuggestionSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type ListSuggestionsQuery = z.infer<typeof listSuggestionsQuerySchema>;
