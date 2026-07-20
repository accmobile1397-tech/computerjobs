import { describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  type PrismaClient,
} from "@prisma/client";
import {
  listDeliveriesAdmin,
  listInboxAdminReadOnly,
  listTemplatesAdmin,
  patchTemplateAdmin,
  upsertMappingAdmin,
  upsertTemplateAdmin,
} from "@/modules/notifications/services/admin.service";

describe("admin.service", () => {
  it("lists templates excluding soft-deleted", async () => {
    const findMany = vi.fn(async () => [{ id: "t1", templateKey: "payment.succeeded.receipt" }]);
    const count = vi.fn(async () => 1);
    const db = {
      notificationTemplate: { findMany, count },
    } as unknown as PrismaClient;

    const result = await listTemplatesAdmin({ page: 1, limit: 20 }, db);
    expect(result.total).toBe(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      })
    );
  });

  it("upserts template by composite key", async () => {
    const upsert = vi.fn(async (args: { create: { templateKey: string } }) => ({
      id: "t1",
      ...args.create,
    }));
    const db = {
      notificationTemplate: { upsert },
    } as unknown as PrismaClient;

    const item = await upsertTemplateAdmin(
      {
        templateKey: "payment.succeeded.receipt",
        version: 1,
        channel: NotificationChannel.EMAIL,
        locale: "fa-IR",
        subject: "رسید",
        body: "پرداخت موفق",
        isActive: true,
      },
      db
    );

    expect(item.templateKey).toBe("payment.succeeded.receipt");
    expect(upsert).toHaveBeenCalled();
  });

  it("patches template when found", async () => {
    const findFirst = vi.fn(async () => ({ id: "t1", deletedAt: null }));
    const update = vi.fn(async () => ({ id: "t1", isActive: false }));
    const db = {
      notificationTemplate: { findFirst, update },
    } as unknown as PrismaClient;

    const item = await patchTemplateAdmin("t1", { isActive: false }, db);
    expect(item.isActive).toBe(false);
  });

  it("upserts event mapping", async () => {
    const upsert = vi.fn(async () => ({
      id: "m1",
      eventName: "payment.succeeded",
      templateKey: "payment.succeeded.receipt",
    }));
    const db = {
      notificationEventMapping: { upsert },
    } as unknown as PrismaClient;

    const item = await upsertMappingAdmin(
      {
        configVersion: 1,
        eventName: "payment.succeeded",
        templateKey: "payment.succeeded.receipt",
        channel: NotificationChannel.EMAIL,
        recipientRule: "payment.owner",
        sortOrder: 0,
        isActive: true,
      },
      db
    );
    expect(item.eventName).toBe("payment.succeeded");
  });

  it("lists deliveries with filters (no inbox mutation)", async () => {
    const findMany = vi.fn(async () => [{ id: "d1", status: "SENT" }]);
    const count = vi.fn(async () => 1);
    const db = {
      notificationDelivery: { findMany, count },
      notification: {
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as PrismaClient;

    const result = await listDeliveriesAdmin(
      {
        page: 1,
        limit: 20,
        eventName: "payment.succeeded",
        status: NotificationDeliveryStatus.SENT,
      },
      db
    );

    expect(result.total).toBe(1);
    expect(db.notification.update).not.toHaveBeenCalled();
    expect(db.notification.updateMany).not.toHaveBeenCalled();
    expect(db.notification.delete).not.toHaveBeenCalled();
  });

  it("lists inbox read-only without writes", async () => {
    const findMany = vi.fn(async () => [{ id: "n1", ownerId: "u1" }]);
    const count = vi.fn(async () => 1);
    const update = vi.fn();
    const updateMany = vi.fn();
    const db = {
      notification: { findMany, count, update, updateMany },
    } as unknown as PrismaClient;

    const result = await listInboxAdminReadOnly(
      { page: 1, limit: 20, ownerId: "u1" },
      db
    );

    expect(result.total).toBe(1);
    expect(update).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          ownerId: "u1",
        }),
      })
    );
  });
});
