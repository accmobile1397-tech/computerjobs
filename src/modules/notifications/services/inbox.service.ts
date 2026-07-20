import {
  NotificationOwnerType,
  type PrismaClient,
} from "@prisma/client";
import type { ListInboxQuery } from "@/modules/notifications/validators/user-api.schema";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export class NotificationInboxError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "NotificationInboxError";
  }
}

function userOwner(userId: string) {
  return {
    ownerType: NotificationOwnerType.USER,
    ownerId: userId,
  } as const;
}

/** Inbox SoT = `notifications` table only — never `notification_deliveries`. */
export async function listInbox(
  userId: string,
  query: ListInboxQuery,
  db: PrismaClient = defaultPrisma
) {
  const where = {
    ...userOwner(userId),
    deletedAt: null,
    ...(query.unreadOnly ? { readAt: null } : {}),
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
        templateKey: true,
        templateVersion: true,
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

  return {
    items: items.map((item) => ({
      ...item,
      unread: item.readAt == null,
    })),
    page: query.page,
    limit: query.limit,
    total,
  };
}

export async function getUnreadCount(
  userId: string,
  db: PrismaClient = defaultPrisma
) {
  const count = await db.notification.count({
    where: {
      ...userOwner(userId),
      deletedAt: null,
      readAt: null,
    },
  });
  return { unreadCount: count };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
  db: PrismaClient = defaultPrisma
) {
  const existing = await db.notification.findFirst({
    where: {
      id: notificationId,
      ...userOwner(userId),
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new NotificationInboxError("NOT_FOUND");
  }

  if (existing.readAt) {
    return {
      id: existing.id,
      readAt: existing.readAt,
      unread: false,
    };
  }

  const updated = await db.notification.update({
    where: { id: existing.id },
    data: { readAt: new Date() },
    select: { id: true, readAt: true },
  });

  return {
    id: updated.id,
    readAt: updated.readAt,
    unread: false,
  };
}
