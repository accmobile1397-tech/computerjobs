import { z } from "zod";
import {
  EmploymentType,
  LanguageProficiency,
  ResumeStatus,
  ResumeVisibility,
  SkillProficiency,
} from "@prisma/client";

const dateField = z.coerce.date();

export const updateResumeSchema = z.object({
  title: z.string().max(160).optional().nullable(),
  summary: z.string().max(2000).optional().nullable(),
  visibility: z.nativeEnum(ResumeVisibility).optional(),
  status: z.nativeEnum(ResumeStatus).optional(),
});

export const educationSchema = z
  .object({
    institution: z.string().min(1).max(200),
    degree: z.string().max(120).optional().nullable(),
    fieldOfStudy: z.string().max(120).optional().nullable(),
    startDate: dateField,
    endDate: dateField.optional().nullable(),
    isCurrent: z.boolean().optional(),
    description: z.string().max(2000).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (d) => d.isCurrent || d.endDate == null || d.startDate <= d.endDate,
    { message: "INVALID_DATE_RANGE" },
  );

export const experienceSchema = z
  .object({
    companyName: z.string().min(1).max(200),
    title: z.string().min(1).max(160),
    employmentType: z.nativeEnum(EmploymentType).optional().nullable(),
    cityId: z.string().uuid().optional().nullable(),
    startDate: dateField,
    endDate: dateField.optional().nullable(),
    isCurrent: z.boolean().optional(),
    description: z.string().max(5000).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (d) => d.isCurrent || d.endDate == null || d.startDate <= d.endDate,
    { message: "INVALID_DATE_RANGE" },
  );

export const replaceSkillsSchema = z.object({
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid(),
        proficiency: z.nativeEnum(SkillProficiency).optional().nullable(),
        sortOrder: z.number().int().min(0).optional(),
      }),
    )
    .max(30)
    .refine(
      (items) => new Set(items.map((i) => i.skillId)).size === items.length,
      { message: "DUPLICATE_SKILL" },
    ),
});

export const replaceTechnologiesSchema = z.object({
  technologies: z
    .array(
      z.object({
        technologyId: z.string().uuid(),
        proficiency: z.nativeEnum(SkillProficiency).optional().nullable(),
        sortOrder: z.number().int().min(0).optional(),
      }),
    )
    .max(30)
    .refine(
      (items) => new Set(items.map((i) => i.technologyId)).size === items.length,
      { message: "DUPLICATE_TECHNOLOGY" },
    ),
});

export const languageSchema = z.object({
  languageCode: z.string().min(2).max(10),
  languageName: z.string().min(1).max(80),
  proficiency: z.nativeEnum(LanguageProficiency),
  sortOrder: z.number().int().min(0).optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).optional().nullable(),
  issueDate: dateField.optional().nullable(),
  expiryDate: dateField.optional().nullable(),
  credentialId: z.string().max(120).optional().nullable(),
  credentialUrl: z.string().url().max(512).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  url: z.string().url().max(512).optional().nullable(),
  startDate: dateField.optional().nullable(),
  endDate: dateField.optional().nullable(),
  technologyIds: z
    .array(z.string().uuid())
    .max(10)
    .optional()
    .refine(
      (ids) => !ids || new Set(ids).size === ids.length,
      { message: "DUPLICATE_TECHNOLOGY" },
    ),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
