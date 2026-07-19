import { z } from "zod";
import {
  ApplicationStatus,
  EmploymentType,
  ExperienceLevel,
  SalaryType,
} from "@prisma/client";

const salaryRefine = (data: { salaryMin?: number; salaryMax?: number }) => {
  if (data.salaryMin != null && data.salaryMax != null) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
};

export const createJobSchema = z
  .object({
    companyId: z.string().uuid(),
    title: z.string().min(2).max(200),
    description: z.string().min(10).max(10000),
    cityId: z.string().uuid(),
    categoryId: z.string().uuid(),
    subCategoryId: z.string().uuid().optional(),
    employmentType: z.nativeEnum(EmploymentType),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().length(3).optional(),
    salaryType: z.nativeEnum(SalaryType).optional(),
    showSalary: z.boolean().optional(),
    skillIds: z.array(z.string().uuid()).max(10).optional(),
  })
  .refine(salaryRefine, { message: "salaryMin must be <= salaryMax" });

export const updateJobSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().min(10).max(10000).optional(),
    cityId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    subCategoryId: z.string().uuid().optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().length(3).optional(),
    salaryType: z.nativeEnum(SalaryType).optional(),
    showSalary: z.boolean().optional(),
    skillIds: z.array(z.string().uuid()).max(10).optional(),
  })
  .refine(salaryRefine, { message: "salaryMin must be <= salaryMax" });

export const publishJobSchema = z.object({
  expiresAt: z.coerce.date().optional(),
});

export const listJobsQuerySchema = z.object({
  provinceSlug: z.string().min(1).max(120).optional(),
  citySlug: z.string().min(1).max(120).optional(),
  categorySlug: z.string().min(1).max(120).optional(),
  subCategorySlug: z.string().min(1).max(120).optional(),
  companySlug: z.string().min(1).max(220).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const submitApplicationSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
  resumeId: z.string().uuid().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    ApplicationStatus.VIEWED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.HIRED,
  ]),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type PublishJobInput = z.infer<typeof publishJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
