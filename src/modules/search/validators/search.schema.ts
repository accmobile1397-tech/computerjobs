import { z } from "zod";
import {
  EmploymentType,
  ExperienceLevel,
  SalaryType,
} from "@prisma/client";

const uuidCsv = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v?.trim()) return undefined;
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    const parsed: string[] = [];
    for (const p of parts) {
      const r = z.string().uuid().safeParse(p);
      if (!r.success) {
        ctx.addIssue({ code: "custom", message: "INVALID_UUID" });
        return z.NEVER;
      }
      parsed.push(r.data);
    }
    if (parsed.length > 20) {
      ctx.addIssue({ code: "custom", message: "TOO_MANY_IDS" });
      return z.NEVER;
    }
    return parsed;
  });

export const searchJobsQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  provinceSlug: z.string().min(1).max(120).optional(),
  citySlug: z.string().min(1).max(120).optional(),
  categorySlug: z.string().min(1).max(120).optional(),
  subCategorySlug: z.string().min(1).max(120).optional(),
  companySlug: z.string().min(1).max(220).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryType: z.nativeEnum(SalaryType).optional(),
  isRemote: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  skillIds: uuidCsv,
  technologyIds: uuidCsv,
  sort: z.enum(["publishedAt", "expiresAt", "relevance"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const searchResumesQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  cityId: z.string().uuid().optional(),
  provinceSlug: z.string().min(1).max(120).optional(),
  languageCode: z.string().min(2).max(10).optional(),
  skillIds: uuidCsv,
  technologyIds: uuidCsv,
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type SearchJobsQuery = z.infer<typeof searchJobsQuerySchema>;
export type SearchResumesQuery = z.infer<typeof searchResumesQuerySchema>;
