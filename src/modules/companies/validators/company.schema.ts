import { z } from "zod";
import {
  CompanyMemberRole,
  CompanyStatus,
  CompanyVerificationStatus,
  EmployeeCountRange,
} from "@prisma/client";

export const createCompanySchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(5000).optional(),
  logoUrl: z.string().url().max(512).optional(),
  websiteUrl: z.string().url().max(512).optional(),
  employeeCountRange: z.nativeEnum(EmployeeCountRange).optional(),
  industryLabel: z.string().max(200).optional(),
  categoryId: z.string().uuid().optional(),
});

export const updateCompanySchema = createCompanySchema.partial().omit({ name: true }).extend({
  name: z.string().min(2).max(200).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email().max(255),
  role: z.nativeEnum(CompanyMemberRole).default(CompanyMemberRole.MEMBER),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(16).max(128),
});

export const transferOwnershipSchema = z.object({
  newOwnerUserId: z.string().uuid(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([CompanyMemberRole.ADMIN, CompanyMemberRole.MEMBER]),
});

export const adminCompanyVerificationSchema = z.object({
  status: z.nativeEnum(CompanyVerificationStatus),
  reason: z.string().max(500).optional(),
});

export const adminCompanyStatusSchema = z.object({
  status: z.nativeEnum(CompanyStatus),
  reason: z.string().max(500).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
