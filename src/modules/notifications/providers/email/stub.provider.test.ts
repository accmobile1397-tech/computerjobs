import { describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRecipientType,
  type PrismaClient,
} from "@prisma/client";
import { dispatchNotification } from "@/modules/notifications/gateway/dispatch";
import type { DispatchRequest } from "@/modules/notifications/gateway/types";
import { StubEmailProvider } from "@/modules/notifications/providers/email/stub.provider";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";

const templateRow = {
  id: "tpl-email-1",
  templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
  version: 1,
  channel: NotificationChannel.EMAIL,
  locale: "fa-IR",
  subject: "رسید {{paymentId}}",
  body: "پرداخت {{paymentId}} انجام شد.",
  variablesSchema: {
    type: "object",
    required: ["paymentId", "ownerType", "ownerId", "sku"],
    properties: {
      paymentId: { type: "string" },
      ownerType: { type: "string" },
      ownerId: { type: "string" },
      sku: { type: "string" },
    },
    additionalProperties: false,
  },
  isActive: true,
  deletedAt: null,
};

function baseRequest(overrides: Partial<DispatchRequest> = {}): DispatchRequest {
  return {
    templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
    channel: NotificationChannel.EMAIL,
    recipientType: NotificationRecipientType.USER,
    recipientId: "user-1",
    variables: {
      paymentId: "pay-1",
      ownerType: "USER",
      ownerId: "user-1",
      sku: "plan-pro",
    },
    eventId: "evt-email-1",
    eventName: "payment.succeeded",
    correlationId: "corr-email-1",
    ...overrides,
  };
}

function createMockPrisma() {
  const deliveries = new Map<string, Record<string, unknown>>();
  let deliveryCounter = 0;

  return {
    notificationDelivery: {
      findUnique: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const key = where.eventId_channel_recipientId_templateKey_templateVersion as Record<
          string,
          string | number
        >;
        const idempotency = `${key.eventId}:${key.channel}:${key.recipientId}:${key.templateKey}:${key.templateVersion}`;
        return deliveries.get(idempotency) ?? null;
      }),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        deliveryCounter += 1;
        const idempotency = `${data.eventId}:${data.channel}:${data.recipientId}:${data.templateKey}:${data.templateVersion}`;
        const row = {
          id: `delivery-${deliveryCounter}`,
          ...data,
        };
        deliveries.set(idempotency, row);
        return row;
      }),
    },
    notificationPreference: {
      findFirst: vi.fn(async () => null),
    },
    notificationTemplate: {
      findFirst: vi.fn(async () => templateRow),
    },
  } as unknown as PrismaClient;
}

describe("StubEmailProvider", () => {
  it("simulates send and returns DeliveryResult with correlationId + providerMessageId", async () => {
    const provider = new StubEmailProvider();
    const result = await provider.send({
      channel: NotificationChannel.EMAIL,
      subject: "Test",
      body: "Hello",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      correlationId: "corr-1",
    });

    expect(result.ok).toBe(true);
    expect(result.correlationId).toBe("corr-1");
    expect(result.providerMessageId).toMatch(/^email-stub_/);
  });

  it("rejects non-EMAIL channels", async () => {
    const provider = new StubEmailProvider();
    const result = await provider.send({
      channel: NotificationChannel.SMS,
      body: "x",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      correlationId: "corr-2",
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("CHANNEL_MISMATCH");
    expect(result.correlationId).toBe("corr-2");
  });
});

describe("gateway + StubEmailProvider", () => {
  it("dispatches EMAIL via stub provider port", async () => {
    const prisma = createMockPrisma();
    const provider = new StubEmailProvider();

    const result = await dispatchNotification(baseRequest(), {
      prisma,
      providerPort: provider,
    });

    expect(result.status).toBe(NotificationDeliveryStatus.SENT);
    expect(result.provider).toBe("email-stub");
    expect(result.correlationId).toBe("corr-email-1");
    expect(result.providerMessageId).toMatch(/^email-stub_/);
  });
});
