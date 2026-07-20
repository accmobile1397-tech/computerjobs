import { z } from "zod";
import {
  NotificationChannel,
  NotificationPreferenceCategory,
} from "@prisma/client";

export const listInboxQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const updatePreferencesSchema = z.object({
  preferences: z
    .array(
      z.object({
        channel: z.nativeEnum(NotificationChannel),
        category: z.nativeEnum(NotificationPreferenceCategory),
        enabled: z.boolean(),
      })
    )
    .min(1)
    .max(40),
});

export type ListInboxQuery = {
  page: number;
  limit: number;
  unreadOnly?: boolean;
};

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
