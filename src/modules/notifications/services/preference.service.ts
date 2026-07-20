import {
  NotificationOwnerType,
  type NotificationChannel,
  type NotificationPreferenceCategory,
  type PrismaClient,
} from "@prisma/client";
import type { UpdatePreferencesInput } from "@/modules/notifications/validators/user-api.schema";
import { prisma as defaultPrisma } from "@/modules/shared/prisma/client";

export class NotificationPreferenceError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "NotificationPreferenceError";
  }
}

function userOwner(userId: string) {
  return {
    ownerType: NotificationOwnerType.USER,
    ownerId: userId,
  } as const;
}

/** User preference API — sole write path for own NotificationPreference rows. */
export async function listPreferences(
  userId: string,
  db: PrismaClient = defaultPrisma
) {
  const rows = await db.notificationPreference.findMany({
    where: {
      ...userOwner(userId),
      deletedAt: null,
    },
    orderBy: [{ category: "asc" }, { channel: "asc" }],
    select: {
      id: true,
      channel: true,
      category: true,
      enabled: true,
      updatedAt: true,
    },
  });

  return { preferences: rows };
}

export async function upsertPreferences(
  userId: string,
  input: UpdatePreferencesInput,
  db: PrismaClient = defaultPrisma
) {
  const owner = userOwner(userId);
  const results = [];

  for (const item of input.preferences) {
    const row = await db.notificationPreference.upsert({
      where: {
        ownerType_ownerId_channel_category: {
          ...owner,
          channel: item.channel,
          category: item.category,
        },
      },
      create: {
        ...owner,
        channel: item.channel,
        category: item.category,
        enabled: item.enabled,
      },
      update: {
        enabled: item.enabled,
        deletedAt: null,
      },
      select: {
        id: true,
        channel: true,
        category: true,
        enabled: true,
        updatedAt: true,
      },
    });
    results.push(row);
  }

  return { preferences: results };
}

export type PreferenceKey = {
  channel: NotificationChannel;
  category: NotificationPreferenceCategory;
};
