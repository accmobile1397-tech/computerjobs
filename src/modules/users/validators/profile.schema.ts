import { z } from "zod";
import { ProfileVisibility } from "@prisma/client";

const urlOptional = z
  .string()
  .url()
  .max(512)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const updateUserSlugSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug format invalid"),
});

export const updateJobSeekerProfileSchema = z.object({
  displayName: z.string().max(120).optional(),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: urlOptional,
  cityLabel: z.string().max(120).optional(),
  profileVisibility: z.nativeEnum(ProfileVisibility).optional(),
});

export const updateEmployerProfileSchema = z.object({
  displayName: z.string().max(120).optional(),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  jobTitle: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
});

export type UpdateJobSeekerProfileInput = z.infer<typeof updateJobSeekerProfileSchema>;
export type UpdateEmployerProfileInput = z.infer<typeof updateEmployerProfileSchema>;
