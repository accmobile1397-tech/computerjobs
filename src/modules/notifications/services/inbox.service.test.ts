import { describe, expect, it, vi } from "vitest";
import {
  NotificationOwnerType,
  type PrismaClient,
} from "@prisma/client";
import {
  getUnreadCount,
  listInbox,
  markNotificationRead,
  NotificationInboxError,
} from "@/modules/notifications/services/inbox.service";
import {
  listPreferences,
  upsertPreferences,
} from "@/modules/notifications/services/preference.service";

describe("inbox.service", () => {
  it("lists only non-deleted notifications for the user owner", async () => {
    const findMany = vi.fn(async () => [
      {
        id: "n1",
        templateKey: "contact.unlocked.confirmation",
        templateVersion: 1,
        title: null,
        content: "hi",
        eventId: "e1",
        correlationId: "c1",
        status: "SENT",
        readAt: null,
        createdAt: new Date(),
      },
    ]);
    const count = vi.fn(async () => 1);
    const db = {
      notification: { findMany, count },
    } as unknown as PrismaClient;

    const result = await listInbox("user-1", { page: 1, limit: 20, unreadOnly: false }, db);

    expect(result.total).toBe(1);
    expect(result.items[0]?.unread).toBe(true);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerType: NotificationOwnerType.USER,
          ownerId: "user-1",
          deletedAt: null,
        }),
      })
    );
  });

  it("marks as read only for owning user", async () => {
    const findFirst = vi.fn(async () => ({
      id: "n1",
      readAt: null,
      ownerId: "user-1",
    }));
    const update = vi.fn(async () => ({
      id: "n1",
      readAt: new Date("2026-07-20T12:00:00.000Z"),
    }));
    const db = {
      notification: { findFirst, update },
    } as unknown as PrismaClient;

    const result = await markNotificationRead("user-1", "n1", db);
    expect(result.unread).toBe(false);
    expect(update).toHaveBeenCalled();
  });

  it("throws NOT_FOUND for another owner", async () => {
    const db = {
      notification: {
        findFirst: vi.fn(async () => null),
      },
    } as unknown as PrismaClient;

    await expect(markNotificationRead("user-2", "n1", db)).rejects.toBeInstanceOf(
      NotificationInboxError
    );
  });

  it("returns unread count from notifications table", async () => {
    const count = vi.fn(async () => 3);
    const db = { notification: { count } } as unknown as PrismaClient;
    const result = await getUnreadCount("user-1", db);
    expect(result.unreadCount).toBe(3);
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          readAt: null,
          ownerId: "user-1",
        }),
      })
    );
  });
});

describe("preference.service", () => {
  it("upserts preferences for the authenticated user only", async () => {
    const upsert = vi.fn(async ({ create }: { create: Record<string, unknown> }) => ({
      id: "p1",
      channel: create.channel,
      category: create.category,
      enabled: create.enabled,
      updatedAt: new Date(),
    }));
    const db = {
      notificationPreference: { upsert },
    } as unknown as PrismaClient;

    const result = await upsertPreferences(
      "user-1",
      {
        preferences: [
          { channel: "EMAIL", category: "MARKETING", enabled: false },
        ],
      },
      db
    );

    expect(result.preferences).toHaveLength(1);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerType_ownerId_channel_category: {
            ownerType: NotificationOwnerType.USER,
            ownerId: "user-1",
            channel: "EMAIL",
            category: "MARKETING",
          },
        },
      })
    );
  });

  it("lists non-deleted preferences", async () => {
    const findMany = vi.fn(async () => []);
    const db = {
      notificationPreference: { findMany },
    } as unknown as PrismaClient;

    await listPreferences("user-1", db);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null, ownerId: "user-1" }),
      })
    );
  });
});
