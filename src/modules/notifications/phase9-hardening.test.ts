import { describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPreferenceCategory,
  NotificationSkipReason,
  type PrismaClient,
} from "@prisma/client";
import { InMemoryEventBus } from "@/modules/events/bus";
import type { DomainEvent } from "@/modules/events/bus/types";
import { EVENTS, PHASE9_MVP_EVENT_NAMES } from "@/modules/events/catalog";
import { dispatchNotification } from "@/modules/notifications/gateway/dispatch";
import {
  EVENT_MAPPING_V1,
  getMappingEntries,
} from "@/modules/notifications/handlers/mapping.v1";
import { handleDomainEvent } from "@/modules/notifications/handlers/handle-domain-event";
import {
  NOTIFICATION_HANDLER_EVENTS,
  registerNotificationHandlers,
} from "@/modules/notifications/handlers/register";
import { NOTIFICATION_PERMISSIONS } from "@/modules/notifications/permissions";
import { NOTIFICATION_TEMPLATE_KEYS } from "@/modules/notifications/templates/keys";
import { MVP_TEMPLATES_V1 } from "@/modules/notifications/templates/mvp.v1";

const FEATURE_MODULES = [
  "jobs",
  "billing",
  "ai",
  "auth",
  "companies",
  "resumes",
  "search",
  "users",
  "payments",
] as const;

function walkTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...walkTsFiles(full));
      continue;
    }
    if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

function createDispatchPrisma(opts?: {
  preferenceEnabled?: boolean | null;
}) {
  const deliveries = new Map<string, Record<string, unknown>>();
  let deliveryCounter = 0;
  const preferenceEnabled = opts?.preferenceEnabled;

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
      findFirst: vi.fn(async () => {
        if (preferenceEnabled === null || preferenceEnabled === undefined) {
          return null;
        }
        return {
          id: "pref-1",
          ownerType: "USER",
          ownerId: "user-1",
          channel: NotificationChannel.EMAIL,
          category: NotificationPreferenceCategory.TRANSACTIONAL,
          enabled: preferenceEnabled,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
      }),
    },
    notificationTemplate: {
      findFirst: vi.fn(async () => ({
        id: "tpl-1",
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        version: 1,
        channel: NotificationChannel.EMAIL,
        locale: "fa-IR",
        subject: "رسید {{paymentId}}",
        body: "پرداخت {{paymentId}} · corr={{paymentId}}",
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
      })),
    },
  } as unknown as PrismaClient;
}

describe("P9-015 architecture hardening", () => {
  it("feature modules never import notification providers", () => {
    const providerImport =
      /@\/modules\/notifications\/providers|StubEmailProvider|StubSmsProvider|InAppProvider/;

    for (const mod of FEATURE_MODULES) {
      const root = path.join(process.cwd(), "src/modules", mod);
      for (const file of walkTsFiles(root)) {
        const source = fs.readFileSync(file, "utf8");
        expect(source, file).not.toMatch(providerImport);
      }
    }
  });

  it("handlers call gateway only (no provider imports)", () => {
    const handlersDir = path.join(
      process.cwd(),
      "src/modules/notifications/handlers"
    );
    for (const file of walkTsFiles(handlersDir)) {
      const source = fs.readFileSync(file, "utf8");
      expect(source).not.toMatch(/providers\/(email|sms|inapp)/);
      expect(source).not.toMatch(/StubEmailProvider|StubSmsProvider|InAppProvider/);
      if (path.basename(file) === "handle-domain-event.ts") {
        expect(source).toContain("dispatchNotification");
      }
    }
  });

  it("gateway resolves templates from DB registry (not inline body strings in handler mapping)", () => {
    const mappingSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/notifications/handlers/mapping.v1.ts"),
      "utf8"
    );
    expect(mappingSource).toContain("NOTIFICATION_TEMPLATE_KEYS");
    expect(mappingSource).not.toMatch(/subject:\s*["']/);
    expect(mappingSource).not.toMatch(/body:\s*["']/);

    const dispatchSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/notifications/gateway/dispatch.ts"),
      "utf8"
    );
    expect(dispatchSource).toContain("notificationTemplate.findFirst");
  });

  it("admin inbox route is GET-only and read-only", () => {
    const inboxRoute = path.join(
      process.cwd(),
      "src/app/api/v1/admin/notifications/inbox/route.ts"
    );
    const source = fs.readFileSync(inboxRoute, "utf8");
    expect(source).toContain("export async function GET");
    expect(source).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(source).toContain("listInboxAdminReadOnly");
    expect(source).toContain("NOTIFICATION_PERMISSIONS.ADMIN");
  });

  it("every notification API route enforces requirePermission", () => {
    const roots = [
      path.join(process.cwd(), "src/app/api/v1/notifications"),
      path.join(process.cwd(), "src/app/api/v1/admin/notifications"),
    ];

    const routeFiles = roots.flatMap((root) =>
      walkTsFiles(root).filter((f) => path.basename(f) === "route.ts")
    );
    expect(routeFiles.length).toBeGreaterThanOrEqual(10);

    for (const file of routeFiles) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, file).toContain("requirePermission");
      expect(source, file).toContain("NOTIFICATION_PERMISSIONS");
    }
  });

  it("permission constants match D-052 slugs", () => {
    expect(NOTIFICATION_PERMISSIONS).toEqual({
      READ_OWN: "notifications:read:own",
      PREFERENCES_OWN: "notifications:preferences:own",
      ADMIN: "notifications:admin",
    });
  });
});

describe("P9-015 event mapping resolution", () => {
  it("maps all Phase 9 MVP events with template keys from registry", () => {
    expect(EVENT_MAPPING_V1.version).toBe(1);
    expect(Object.keys(EVENT_MAPPING_V1.mappings).sort()).toEqual(
      [...PHASE9_MVP_EVENT_NAMES].sort()
    );
    expect([...NOTIFICATION_HANDLER_EVENTS].sort()).toEqual(
      [...PHASE9_MVP_EVENT_NAMES].sort()
    );

    const registryKeys = new Set<string>(Object.values(NOTIFICATION_TEMPLATE_KEYS));
    const mvpKeys = new Set<string>(MVP_TEMPLATES_V1.map((t) => t.templateKey));

    for (const eventName of PHASE9_MVP_EVENT_NAMES) {
      const entries = getMappingEntries(eventName);
      expect(entries.length, eventName).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(registryKeys.has(entry.templateKey), entry.templateKey).toBe(true);
        expect(mvpKeys.has(entry.templateKey), entry.templateKey).toBe(true);
        expect(entry.channels.length).toBeGreaterThan(0);
        expect(entry.recipients.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns empty mapping for unknown events", () => {
    expect(getMappingEntries("not.a.real.event")).toEqual([]);
  });
});

describe("P9-015 handler registration", () => {
  it("registers exactly one idempotent handler per MVP event", async () => {
    const bus = new InMemoryEventBus();
    const registered: string[] = [];
    const original = bus.registerHandler.bind(bus);

    bus.registerHandler = (eventName, handler, options) => {
      registered.push(eventName);
      expect(options?.idempotent).toBe(true);
      return original(eventName, handler, options);
    };

    registerNotificationHandlers(bus, {
      prisma: createDispatchPrisma(),
      providersByChannel: {},
    });

    expect(registered.sort()).toEqual([...PHASE9_MVP_EVENT_NAMES].sort());
  });
});

describe("P9-015 correlationId · idempotency · preferences", () => {
  it("propagates correlationId event → gateway → delivery result", async () => {
    const prisma = createDispatchPrisma();
    const send = vi.fn(async (rendered) => ({
      ok: true,
      correlationId: rendered.correlationId,
      providerMessageId: "msg-corr",
    }));

    const event: DomainEvent = {
      eventId: "550e8400-e29b-41d4-a716-446655440099",
      name: EVENTS.PAYMENT_SUCCEEDED,
      version: 1,
      occurredAt: "2026-07-21T10:00:00.000Z",
      aggregateType: "Payment",
      aggregateId: "pay-corr",
      correlationId: "corr-e2e-99",
      payload: {
        paymentId: "pay-corr",
        ownerType: "USER",
        ownerId: "user-1",
        sku: "plan-pro",
      },
    };

    const results = await handleDomainEvent(event, {
      prisma,
      providerPort: { name: "test", send },
      providersByChannel: {},
    });

    expect(results[0]?.correlationId).toBe("corr-e2e-99");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: "corr-e2e-99" })
    );
    expect(prisma.notificationDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correlationId: "corr-e2e-99" }),
      })
    );
  });

  it("idempotent on (eventId, channel, recipient, templateKey, version)", async () => {
    const prisma = createDispatchPrisma();
    const providerPort = {
      name: "test",
      send: vi.fn(async (rendered) => ({
        ok: true,
        correlationId: rendered.correlationId,
        providerMessageId: "once",
      })),
    };

    const request = {
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
      channel: NotificationChannel.EMAIL,
      recipientType: "USER" as const,
      recipientId: "user-1",
      variables: {
        paymentId: "pay-1",
        ownerType: "USER",
        ownerId: "user-1",
        sku: "plan-pro",
      },
      eventId: "evt-idem-1",
      eventName: EVENTS.PAYMENT_SUCCEEDED,
      correlationId: "corr-idem-1",
    };

    const first = await dispatchNotification(request, { prisma, providerPort });
    const second = await dispatchNotification(request, { prisma, providerPort });

    expect(first.notificationId).toBe(second.notificationId);
    expect(providerPort.send).toHaveBeenCalledTimes(1);
    expect(prisma.notificationDelivery.create).toHaveBeenCalledTimes(1);
  });

  it("skips delivery when preferences opt out", async () => {
    const prisma = createDispatchPrisma({ preferenceEnabled: false });
    const result = await dispatchNotification(
      {
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_SUCCEEDED_RECEIPT,
        channel: NotificationChannel.EMAIL,
        recipientType: "USER",
        recipientId: "user-1",
        variables: {
          paymentId: "pay-1",
          ownerType: "USER",
          ownerId: "user-1",
          sku: "plan-pro",
        },
        eventId: "evt-optout-1",
        eventName: EVENTS.PAYMENT_SUCCEEDED,
        correlationId: "corr-optout-1",
      },
      { prisma }
    );

    expect(result.status).toBe(NotificationDeliveryStatus.SKIPPED);
    expect(result.skipReason).toBe(NotificationSkipReason.OPT_OUT);
    expect(result.correlationId).toBe("corr-optout-1");
  });
});
