import { describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRecipientType,
  type PrismaClient,
} from "@prisma/client";
import { dispatchNotification } from "@/modules/notifications/gateway/dispatch";
import type { DispatchRequest } from "@/modules/notifications/gateway/types";
import { StubSmsProvider } from "@/modules/notifications/providers/sms/stub.provider";

/** SMS channel has no MVP seeded template yet — gateway mock supplies one. */
const smsTemplateRow = {
  id: "tpl-sms-1",
  templateKey: "auth.otp.stub",
  version: 1,
  channel: NotificationChannel.SMS,
  locale: "fa-IR",
  subject: null,
  body: "کد تأیید: {{code}}",
  variablesSchema: {
    type: "object",
    required: ["code"],
    properties: { code: { type: "string" } },
    additionalProperties: false,
  },
  isActive: true,
  deletedAt: null,
};

function baseRequest(overrides: Partial<DispatchRequest> = {}): DispatchRequest {
  return {
    templateKey: "auth.otp.stub",
    channel: NotificationChannel.SMS,
    recipientType: NotificationRecipientType.USER,
    recipientId: "user-1",
    variables: { code: "12345" },
    eventId: "evt-sms-1",
    eventName: "user.registered",
    correlationId: "corr-sms-1",
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
        const row = { id: `delivery-${deliveryCounter}`, ...data };
        deliveries.set(idempotency, row);
        return row;
      }),
    },
    notificationPreference: {
      findFirst: vi.fn(async () => null),
    },
    notificationTemplate: {
      findFirst: vi.fn(async () => smsTemplateRow),
    },
  } as unknown as PrismaClient;
}

describe("StubSmsProvider", () => {
  it("simulates send and returns DeliveryResult with correlationId + providerMessageId", async () => {
    const provider = new StubSmsProvider();
    const result = await provider.send({
      channel: NotificationChannel.SMS,
      body: "کد: 12345",
      recipientType: NotificationRecipientType.PHONE,
      recipientId: "+989121234567",
      correlationId: "corr-1",
    });

    expect(result.ok).toBe(true);
    expect(result.correlationId).toBe("corr-1");
    expect(result.providerMessageId).toMatch(/^sms-stub_/);
  });

  it("rejects non-SMS channels", async () => {
    const provider = new StubSmsProvider();
    const result = await provider.send({
      channel: NotificationChannel.EMAIL,
      subject: "x",
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

describe("gateway + StubSmsProvider", () => {
  it("dispatches SMS via stub provider port", async () => {
    const prisma = createMockPrisma();
    const provider = new StubSmsProvider();

    const result = await dispatchNotification(baseRequest(), {
      prisma,
      providerPort: provider,
    });

    expect(result.status).toBe(NotificationDeliveryStatus.SENT);
    expect(result.provider).toBe("sms-stub");
    expect(result.correlationId).toBe("corr-sms-1");
    expect(result.providerMessageId).toMatch(/^sms-stub_/);
  });
});
