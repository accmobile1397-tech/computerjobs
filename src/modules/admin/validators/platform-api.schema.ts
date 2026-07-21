import { z } from "zod";

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  /** Maps to DomainEventLog.name (dot.case event type). */
  eventType: z.string().min(1).max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export const upsertSettingSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
});

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
