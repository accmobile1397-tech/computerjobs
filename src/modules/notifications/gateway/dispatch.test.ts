import { describe, expect, it, vi } from "vitest";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPreferenceCategory,
  NotificationRecipientType,
  NotificationSkipReason,
  type PrismaClient,
} from "@prisma/client";
import { dispatchNotification } from "@/modules/notifications/gateway/dispatch";
import { NotificationGatewayError } from "@/modules/notifications/gateway/errors";
import { renderTemplate, validateTemplateVariables } from "@/modules/notifications/gateway/render";
import type {
  DispatchRequest,
  NotificationProviderPort,
} from "@/modules/notifications/gateway/types";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";

const templateRow = {
  id: "tpl-1",
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
    eventId: "evt-1",
    eventName: "payment.succeeded",
    correlationId: "corr-1",
    ...overrides,
  };
}

function createMockPrisma() {
  const deliveries = new Map<string, ReturnType<typeof deliveryRecord>>();
  let deliveryCounter = 0;

  function deliveryRecord(data: Record<string, unknown>) {
    deliveryCounter += 1;
    return {
      id: `delivery-${deliveryCounter}`,
      provider: (data.provider as string | null) ?? null,
      status: data.status as NotificationDeliveryStatus,
      skipReason: (data.skipReason as NotificationSkipReason | null) ?? null,
      correlationId: data.correlationId as string,
      channel: data.channel as NotificationChannel,
      ...data,
    };
  }

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
        const idempotency = `${data.eventId}:${data.channel}:${data.recipientId}:${data.templateKey}:${data.templateVersion}`;
        const row = deliveryRecord(data);
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

describe("renderTemplate", () => {
  it("interpolates variables into subject and body", () => {
    const rendered = renderTemplate(
      { subject: "Hi {{name}}", body: "Order {{orderId}}" },
      { name: "Ali", orderId: "42" }
    );
    expect(rendered.subject).toBe("Hi Ali");
    expect(rendered.body).toBe("Order 42");
  });
});

describe("validateTemplateVariables", () => {
  it("rejects missing required variables", () => {
    expect(() =>
      validateTemplateVariables(templateRow.variablesSchema, { paymentId: "p1" })
    ).toThrow(NotificationGatewayError);
  });
});

describe("dispatchNotification", () => {
  it("returns idempotent result for duplicate eventId/channel/recipient/templateKey", async () => {
    const prisma = createMockPrisma();
    const providerPort: NotificationProviderPort = {
      name: "test-stub",
      send: vi.fn(async () => ({ ok: true })),
    };

    const request = baseRequest();
    const first = await dispatchNotification(request, { prisma, providerPort });
    const second = await dispatchNotification(request, { prisma, providerPort });

    expect(first.notificationId).toBe(second.notificationId);
    expect(prisma.notificationDelivery.create).toHaveBeenCalledTimes(1);
    expect(providerPort.send).toHaveBeenCalledTimes(1);
  });

  it("skips delivery when preference opts out", async () => {
    const prisma = createMockPrisma();
    vi.mocked(prisma.notificationPreference.findFirst).mockResolvedValue({
      id: "pref-1",
      ownerType: "USER",
      ownerId: "user-1",
      channel: NotificationChannel.EMAIL,
      category: NotificationPreferenceCategory.TRANSACTIONAL,
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await dispatchNotification(baseRequest(), { prisma });

    expect(result.status).toBe(NotificationDeliveryStatus.SKIPPED);
    expect(result.skipReason).toBe(NotificationSkipReason.OPT_OUT);
    expect(result.correlationId).toBe("corr-1");
  });

  it("persists PENDING when no provider port is wired", async () => {
    const prisma = createMockPrisma();
    const result = await dispatchNotification(baseRequest(), { prisma });

    expect(result.status).toBe(NotificationDeliveryStatus.PENDING);
    expect(result.provider).toBe("none");
    expect(result.correlationId).toBe("corr-1");
  });

  it("uses provider port without gateway knowing channel implementation", async () => {
    const prisma = createMockPrisma();
    const send = vi.fn(async () => ({ ok: true }));
    const providerPort: NotificationProviderPort = { name: "test-stub", send };

    const result = await dispatchNotification(baseRequest(), { prisma, providerPort });

    expect(result.status).toBe(NotificationDeliveryStatus.SENT);
    expect(result.provider).toBe("test-stub");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: "corr-1",
        body: expect.stringContaining("pay-1"),
      })
    );
  });

  it("defaults correlationId to eventId", async () => {
    const prisma = createMockPrisma();
    const result = await dispatchNotification(
      baseRequest({ correlationId: undefined, eventId: "evt-only" }),
      { prisma }
    );
    expect(result.correlationId).toBe("evt-only");
  });

  it("skips marketing by default when no preference row exists", async () => {
    const prisma = createMockPrisma();
    const result = await dispatchNotification(
      baseRequest({ preferenceCategory: NotificationPreferenceCategory.MARKETING }),
      { prisma }
    );
    expect(result.status).toBe(NotificationDeliveryStatus.SKIPPED);
    expect(result.skipReason).toBe(NotificationSkipReason.OPT_OUT);
  });
});
