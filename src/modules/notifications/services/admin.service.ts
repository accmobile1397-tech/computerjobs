import type { Prisma, PrismaClient } from "@prisma/client";
import type { z } from "zod";
import type {
  listDeliveriesQuerySchema,
  listInboxAdminQuerySchema,
  patchMappingSchema,
  patchTemplateSchema,
  upsertMappingSchema,
  upsertTemplateSchema,
} from "@/modules/notifications/validators/admin-api.schema";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export class NotificationAdminError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "NotificationAdminError";
  }
}

type UpsertTemplate = z.infer<typeof upsertTemplateSchema>;
type PatchTemplate = z.infer<typeof patchTemplateSchema>;
type UpsertMapping = z.infer<typeof upsertMappingSchema>;
type PatchMapping = z.infer<typeof patchMappingSchema>;
type ListDeliveries = z.infer<typeof listDeliveriesQuerySchema>;
type ListInboxAdmin = z.infer<typeof listInboxAdminQuerySchema>;

export async function listTemplatesAdmin(
  query: { page: number; limit: number },
  db: PrismaClient = defaultPrisma
) {
  const where = { deletedAt: null };
  const [total, items] = await Promise.all([
    db.notificationTemplate.count({ where }),
    db.notificationTemplate.findMany({
      where,
      orderBy: [{ templateKey: "asc" }, { version: "desc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  return { items, page: query.page, limit: query.limit, total };
}

export async function upsertTemplateAdmin(
  input: UpsertTemplate,
  db: PrismaClient = defaultPrisma
) {
  return db.notificationTemplate.upsert({
    where: {
      templateKey_version_channel_locale: {
        templateKey: input.templateKey,
        version: input.version,
        channel: input.channel,
        locale: input.locale,
      },
    },
    create: {
      templateKey: input.templateKey,
      version: input.version,
      channel: input.channel,
      locale: input.locale,
      subject: input.subject ?? null,
      body: input.body,
      variablesSchema: (input.variablesSchema ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      isActive: input.isActive,
    },
    update: {
      subject: input.subject ?? null,
      body: input.body,
      variablesSchema: (input.variablesSchema ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      isActive: input.isActive,
      deletedAt: null,
    },
  });
}

export async function patchTemplateAdmin(
  id: string,
  input: PatchTemplate,
  db: PrismaClient = defaultPrisma
) {
  const existing = await db.notificationTemplate.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new NotificationAdminError("NOT_FOUND");

  return db.notificationTemplate.update({
    where: { id },
    data: {
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.variablesSchema !== undefined
        ? {
            variablesSchema: input.variablesSchema as Prisma.InputJsonValue,
          }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
    },
  });
}

export async function softDeleteTemplateAdmin(
  id: string,
  db: PrismaClient = defaultPrisma
) {
  const existing = await db.notificationTemplate.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new NotificationAdminError("NOT_FOUND");

  return db.notificationTemplate.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function listMappingsAdmin(
  query: { page: number; limit: number; configVersion?: number },
  db: PrismaClient = defaultPrisma
) {
  const where = {
    deletedAt: null,
    ...(query.configVersion != null
      ? { configVersion: query.configVersion }
      : {}),
  };
  const [total, items] = await Promise.all([
    db.notificationEventMapping.count({ where }),
    db.notificationEventMapping.findMany({
      where,
      orderBy: [{ configVersion: "desc" }, { eventName: "asc" }, { sortOrder: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  return { items, page: query.page, limit: query.limit, total };
}

export async function upsertMappingAdmin(
  input: UpsertMapping,
  db: PrismaClient = defaultPrisma
) {
  return db.notificationEventMapping.upsert({
    where: {
      configVersion_eventName_templateKey_channel_recipientRule: {
        configVersion: input.configVersion,
        eventName: input.eventName,
        templateKey: input.templateKey,
        channel: input.channel,
        recipientRule: input.recipientRule,
      },
    },
    create: {
      configVersion: input.configVersion,
      eventName: input.eventName,
      templateKey: input.templateKey,
      channel: input.channel,
      recipientRule: input.recipientRule,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    update: {
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      deletedAt: null,
    },
  });
}

export async function patchMappingAdmin(
  id: string,
  input: PatchMapping,
  db: PrismaClient = defaultPrisma
) {
  const existing = await db.notificationEventMapping.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new NotificationAdminError("NOT_FOUND");

  return db.notificationEventMapping.update({
    where: { id },
    data: {
      ...(input.recipientRule !== undefined
        ? { recipientRule: input.recipientRule }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}

/** Delivery viewer — NotificationDelivery only (C-009-6). */
export async function listDeliveriesAdmin(
  query: ListDeliveries,
  db: PrismaClient = defaultPrisma
) {
  const where = {
    ...(query.eventId ? { eventId: query.eventId } : {}),
    ...(query.eventName ? { eventName: query.eventName } : {}),
    ...(query.templateKey ? { templateKey: query.templateKey } : {}),
    ...(query.channel ? { channel: query.channel } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.correlationId ? { correlationId: query.correlationId } : {}),
  };

  const [total, items] = await Promise.all([
    db.notificationDelivery.count({ where }),
    db.notificationDelivery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);
  return { items, page: query.page, limit: query.limit, total };
}

/**
 * Read-only inbox viewer for support.
 * C-009-6: must never mutate Notification rows.
 */
export async function listInboxAdminReadOnly(
  query: ListInboxAdmin,
  db: PrismaClient = defaultPrisma
) {
  const where = {
    deletedAt: null,
    ...(query.ownerId ? { ownerId: query.ownerId } : {}),
    ...(query.correlationId ? { correlationId: query.correlationId } : {}),
    ...(query.eventId ? { eventId: query.eventId } : {}),
  };

  const [total, items] = await Promise.all([
    db.notification.count({ where }),
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        templateKey: true,
        title: true,
        content: true,
        eventId: true,
        correlationId: true,
        status: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ]);
  return { items, page: query.page, limit: query.limit, total };
}
