import { describe, expect, it, vi } from "vitest";
import pino from "pino";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRecipientType,
  type PrismaClient,
} from "@prisma/client";
import { InMemoryEventBus } from "@/modules/events/bus";
import type { DomainEvent } from "@/modules/events/bus/types";
import { EVENTS } from "@/modules/events/catalog";
import { EVENT_MAPPING_V1 } from "@/modules/notifications/handlers/mapping.v1";
import { handleDomainEvent } from "@/modules/notifications/handlers/handle-domain-event";
import {
  NOTIFICATION_HANDLER_EVENTS,
  registerNotificationHandlers,
} from "@/modules/notifications/handlers/register";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";
import * as fs from "fs";
import * as path from "path";

const silentLogger = pino({ level: "silent" });

function paymentEvent(overrides: Partial<DomainEvent> = {}): DomainEvent {
  return {
    eventId: "550e8400-e29b-41d4-a716-446655440001",
    name: EVENTS.PAYMENT_SUCCEEDED,
    version: 1,
    occurredAt: "2026-07-20T10:00:00.000Z",
    aggregateType: "Payment",
    aggregateId: "pay-1",
    correlationId: "corr-pay-1",
    payload: {
      paymentId: "pay-1",
      ownerType: "USER",
      ownerId: "user-1",
      sku: "plan-pro",
    },
    ...overrides,
  };
}

function createGatewayMockPrisma() {
  const deliveries = new Map<string, Record<string, unknown>>();
  let deliveryCounter = 0;

  const templates = new Map([
    [
      `${NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT}:EMAIL`,
      {
        id: "tpl-pay",
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        version: 1,
        channel: NotificationChannel.EMAIL,
        locale: "fa-IR",
        subject: "رسید {{paymentId}}",
        body: "پرداخت {{paymentId}}",
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
      },
    ],
    [
      `${NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION}:IN_APP`,
      {
        id: "tpl-contact",
        templateKey: NOTIFICATION_TEMPLATE_KEYS.CONTACT_UNLOCKED_CONFIRMATION,
        version: 1,
        channel: NotificationChannel.IN_APP,
        locale: "fa-IR",
        subject: null,
        body: "unlock {{unlockId}}",
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
      },
    ],
  ]);

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
      findFirst: vi.fn(
        async ({ where }: { where: { templateKey: string; channel: string } }) => {
          return templates.get(`${where.templateKey}:${where.channel}`) ?? null;
        }
      ),
    },
    notification: {
      findUnique: vi.fn(async () => null),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        id: "notif-1",
        providerMessageId: "inapp_test",
        correlationId: data.correlationId,
        ...data,
      })),
    },
    job: {
      findFirst: vi.fn(async () => null),
    },
    companyMember: {
      findMany: vi.fn(async () => []),
    },
  } as unknown as PrismaClient;
}

describe("EVENT_MAPPING_V1", () => {
  it("covers exactly six Phase 9 MVP events", () => {
    expect(Object.keys(EVENT_MAPPING_V1.mappings)).toHaveLength(6);
    expect(EVENT_MAPPING_V1.version).toBe(1);
    expect(NOTIFICATION_HANDLER_EVENTS).toHaveLength(6);
  });
});

describe("handleDomainEvent (C-009-5)", () => {
  it("dispatches payment.succeeded via gateway only (EMAIL)", async () => {
    const prisma = createGatewayMockPrisma();
    const providerPort = {
      name: "test-email",
      send: vi.fn(async (rendered) => ({
        ok: true,
        correlationId: rendered.correlationId,
        providerMessageId: "msg-1",
      })),
    };

    const results = await handleDomainEvent(paymentEvent(), {
      prisma,
      providerPort,
      providersByChannel: {},
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe(NotificationDeliveryStatus.SENT);
    expect(results[0]?.correlationId).toBe("corr-pay-1");
    expect(providerPort.send).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: NotificationChannel.EMAIL,
        recipientId: "user-1",
      })
    );
  });

  it("dispatches contact.unlocked to target user IN_APP", async () => {
    const prisma = createGatewayMockPrisma();
    const providerPort = {
      name: "test-inapp",
      send: vi.fn(async (rendered) => ({
        ok: true,
        correlationId: rendered.correlationId,
        providerMessageId: "inapp-1",
      })),
    };

    const event: DomainEvent = {
      eventId: "evt-contact-1",
      name: EVENTS.CONTACT_UNLOCKED,
      version: 1,
      occurredAt: "2026-07-20T10:00:00.000Z",
      aggregateType: "ContactUnlock",
      aggregateId: "unlock-1",
      correlationId: "corr-contact-1",
      payload: {
        companyId: "co-1",
        targetUserId: "user-target",
        unlockId: "unlock-1",
      },
    };

    const results = await handleDomainEvent(event, {
      prisma,
      providerPort,
      providersByChannel: {},
    });

    expect(results).toHaveLength(1);
    expect(providerPort.send).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: NotificationChannel.IN_APP,
        recipientType: NotificationRecipientType.USER,
        recipientId: "user-target",
      })
    );
  });

  it("handler source files never import providers (C-009-5)", () => {
    const handlersDir = path.join(
      process.cwd(),
      "src/modules/notifications/handlers"
    );
    const files = fs
      .readdirSync(handlersDir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    for (const file of files) {
      const source = fs.readFileSync(path.join(handlersDir, file), "utf8");
      expect(source).not.toMatch(/providers\/(email|sms|inapp)/);
      expect(source).not.toMatch(/StubEmailProvider|StubSmsProvider|InAppProvider/);
    }
  });
});

describe("registerNotificationHandlers", () => {
  it("wires MVP events on the bus", async () => {
    const prisma = createGatewayMockPrisma();
    const bus = new InMemoryEventBus({ logger: silentLogger });
    const providerPort = {
      name: "test",
      send: vi.fn(async (rendered) => ({
        ok: true,
        correlationId: rendered.correlationId,
        providerMessageId: "x",
      })),
    };

    registerNotificationHandlers(bus, {
      prisma,
      providerPort,
      providersByChannel: {},
    });

    await bus.publish(paymentEvent());
    expect(providerPort.send).toHaveBeenCalled();
  });
});
