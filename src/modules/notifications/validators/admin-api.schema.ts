import { z } from "zod";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from "@prisma/client";

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const upsertTemplateSchema = z.object({
  templateKey: z.string().min(1).max(120),
  version: z.number().int().min(1).default(1),
  channel: z.nativeEnum(NotificationChannel),
  locale: z.string().min(2).max(16).default("fa-IR"),
  subject: z.string().max(500).nullable().optional(),
  body: z.string().min(1),
  variablesSchema: z.unknown().optional(),
  isActive: z.boolean().default(true),
});

export const patchTemplateSchema = z.object({
  subject: z.string().max(500).nullable().optional(),
  body: z.string().min(1).optional(),
  variablesSchema: z.unknown().optional(),
  isActive: z.boolean().optional(),
  locale: z.string().min(2).max(16).optional(),
});

export const upsertMappingSchema = z.object({
  configVersion: z.number().int().min(1).default(1),
  eventName: z.string().min(1).max(120),
  templateKey: z.string().min(1).max(120),
  channel: z.nativeEnum(NotificationChannel),
  recipientRule: z.string().min(1).max(120),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const patchMappingSchema = z.object({
  recipientRule: z.string().min(1).max(120).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const listDeliveriesQuerySchema = adminListQuerySchema.extend({
  eventId: z.string().optional(),
  eventName: z.string().optional(),
  templateKey: z.string().optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  status: z.nativeEnum(NotificationDeliveryStatus).optional(),
  correlationId: z.string().optional(),
});

export const listInboxAdminQuerySchema = adminListQuerySchema.extend({
  ownerId: z.string().optional(),
  correlationId: z.string().optional(),
  eventId: z.string().optional(),
});
