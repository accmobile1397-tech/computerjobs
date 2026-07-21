import { z } from "zod";
import { AuditAction } from "@prisma/client";

/** Paginated audit list — page/pageSize always applied (never unbounded). */
export const listAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.nativeEnum(AuditAction).optional(),
  userId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListAuditQuery = z.infer<typeof listAuditQuerySchema>;
