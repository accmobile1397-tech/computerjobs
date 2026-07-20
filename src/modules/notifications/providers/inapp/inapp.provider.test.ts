import { describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationOwnerType,
  NotificationRecipientType,
  type PrismaClient,
} from "@prisma/client";
import { dispatchNotification } from "@/modules/notifications/gateway/dispatch";
import type { DispatchRequest } from "@/modules/notifications/gateway/types";
import { InAppProvider } from "@/modules/notifications/providers/inapp/inapp.provider";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";

const inAppTemplateRow = {
  id: "tpl-inapp-1",
  templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
  version: 1,
  channel: NotificationChannel.IN_APP,
  locale: "fa-IR",
  subject: null,
  body: "اطلاعات تماس باز شد ({{unlockId}}).",
  variablesSchema: {
    type: "object",
    required: ["companyId", "targetUserId", "unlockId"],
    properties: {
      companyId: { type: "string" },
      targetUserId: { type: "string" },
      unlockId: { type: "string" },
    },
    additionalProperties: false,
  },
  isActive: true,
  deletedAt: null,
};

function createInboxStore() {
  const rows = new Map<string, Record<string, unknown>>();
  let counter = 0;

  function keyOf(data: {
    eventId: string;
    ownerType: string;
    ownerId: string;
    templateKey: string;
    templateVersion: number;
  }) {
    return `${data.eventId}:${data.ownerType}:${data.ownerId}:${data.templateKey}:${data.templateVersion}`;
  }

  return {
    findUnique: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const compound = where.eventId_ownerType_ownerId_templateKey_templateVersion as {
        eventId: string;
        ownerType: string;
        ownerId: string;
        templateKey: string;
        templateVersion: number;
      };
      return rows.get(keyOf(compound)) ?? null;
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      counter += 1;
      const row = {
        id: `notif-${counter}`,
        ...data,
      };
      rows.set(
        keyOf({
          eventId: data.eventId as string,
          ownerType: data.ownerType as string,
          ownerId: data.ownerId as string,
          templateKey: data.templateKey as string,
          templateVersion: data.templateVersion as number,
        }),
        row
      );
      return row;
    }),
    _rows: rows,
  };
}

describe("InAppProvider", () => {
  it("persists inbox row with correlationId and providerMessageId", async () => {
    const inbox = createInboxStore();
    const prisma = { notification: inbox } as unknown as PrismaClient;
    const provider = new InAppProvider(prisma);

    const result = await provider.send({
      channel: NotificationChannel.IN_APP,
      body: "hello inbox",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      correlationId: "corr-1",
      eventId: "evt-1",
      templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
      templateVersion: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.correlationId).toBe("corr-1");
    expect(result.providerMessageId).toMatch(/^inapp_/);
    expect(inbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerType: NotificationOwnerType.USER,
          ownerId: "user-1",
          content: "hello inbox",
          correlationId: "corr-1",
          status: NotificationDeliveryStatus.SENT,
        }),
      })
    );
  });

  it("is idempotent for same eventId/owner/template", async () => {
    const inbox = createInboxStore();
    const prisma = { notification: inbox } as unknown as PrismaClient;
    const provider = new InAppProvider(prisma);
    const payload = {
      channel: NotificationChannel.IN_APP,
      body: "hello",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      correlationId: "corr-1",
      eventId: "evt-dup",
      templateKey: NOTIFICATION_TEMPLATE_KEYS.AI_REQUEST_COMPLETED,
      templateVersion: 1,
    };

    await provider.send(payload);
    await provider.send(payload);

    expect(inbox.create).toHaveBeenCalledTimes(1);
  });

  it("rejects non-IN_APP channels", async () => {
    const provider = new InAppProvider({} as PrismaClient);
    const result = await provider.send({
      channel: NotificationChannel.EMAIL,
      body: "x",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      correlationId: "corr-2",
      eventId: "evt-2",
      templateKey: "x",
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("CHANNEL_MISMATCH");
  });

  it("rejects EMAIL/PHONE recipients for inbox", async () => {
    const provider = new InAppProvider({} as PrismaClient);
    const result = await provider.send({
      channel: NotificationChannel.IN_APP,
      body: "x",
      recipientType: NotificationRecipientType.EMAIL,
      recipientId: "a@b.c",
      correlationId: "corr-3",
      eventId: "evt-3",
      templateKey: "x",
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INVALID_RECIPIENT");
  });
});

describe("gateway + InAppProvider", () => {
  it("dispatches IN_APP and persists delivery + inbox", async () => {
    const inbox = createInboxStore();
    const deliveries = new Map<string, Record<string, unknown>>();
    let deliveryCounter = 0;

    const prisma = {
      notification: inbox,
      notificationDelivery: {
        findUnique: vi.fn(async () => null),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          deliveryCounter += 1;
          const row = { id: `delivery-${deliveryCounter}`, ...data };
          deliveries.set(String(deliveryCounter), row);
          return row;
        }),
      },
      notificationPreference: {
        findFirst: vi.fn(async () => null),
      },
      notificationTemplate: {
        findFirst: vi.fn(async () => inAppTemplateRow),
      },
    } as unknown as PrismaClient;

    const provider = new InAppProvider(prisma);
    const request: DispatchRequest = {
      templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
      channel: NotificationChannel.IN_APP,
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      variables: {
        companyId: "co-1",
        targetUserId: "user-1",
        unlockId: "unlock-1",
      },
      eventId: "evt-inapp-1",
      correlationId: "corr-inapp-1",
    };

    const result = await dispatchNotification(request, {
      prisma,
      providerPort: provider,
    });

    expect(result.status).toBe(NotificationDeliveryStatus.SENT);
    expect(result.provider).toBe("inapp");
    expect(result.correlationId).toBe("corr-inapp-1");
    expect(result.providerMessageId).toMatch(/^inapp_/);
    expect(inbox.create).toHaveBeenCalledOnce();
  });
});
