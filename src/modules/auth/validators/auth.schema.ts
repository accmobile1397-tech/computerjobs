import { z } from "zod";

export const registerJobSeekerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "حداقل یک حرف بزرگ")
    .regex(/[a-z]/, "حداقل یک حرف کوچک")
    .regex(/[0-9]/, "حداقل یک عدد"),
  displayName: z.string().max(120).optional(),
});

export const registerEmployerSchema = registerJobSeekerSchema.extend({
  companyName: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: registerJobSeekerSchema.shape.password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: registerJobSeekerSchema.shape.password,
});
