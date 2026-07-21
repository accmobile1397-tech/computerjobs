import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { listDomainEvents } from "@/modules/admin/services/event-viewer.service";
import {
  isSensitiveSettingKey,
  listSystemSettings,
  upsertSystemSetting,
} from "@/modules/admin/services/settings.service";
import { getMonitoringSummary } from "@/modules/admin/services/monitoring.service";
import { listEventsQuerySchema } from "@/modules/admin/validators/platform-api.schema";

vi.mock("@/modules/auth/services/audit.service", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { writeAuditLog } from "@/modules/auth/services/audit.service";

describe("listEventsQuerySchema (P10-006)", () => {
  it("defaults pagination", () => {
    const parsed = listEventsQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });
});

describe("listDomainEvents (P10-006)", () => {
  it("filters by eventType and date range with pagination", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const db = {
      domainEventLog: { findMany, count },
    } as unknown as PrismaClient;

    const from = new Date("2026-07-01T00:00:00.000Z");
    await listDomainEvents(
      { page: 1, pageSize: 20, eventType: "payment.succeeded", from },
      db,
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 0,
        where: expect.objectContaining({
          name: "payment.succeeded",
          occurredAt: expect.objectContaining({ gte: from }),
        }),
      }),
    );
  });
});

describe("settings masking (P10-006)", () => {
  it("detects sensitive keys", () => {
    expect(isSensitiveSettingKey("psp.webhook_secret")).toBe(true);
    expect(isSensitiveSettingKey("api_token")).toBe(true);
    expect(isSensitiveSettingKey("provider_api_key")).toBe(true);
    expect(isSensitiveSettingKey("billing.timezone")).toBe(false);
  });

  it("masks sensitive values on list", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        key: "billing.timezone",
        valueJson: "Asia/Tehran",
        updatedAt: new Date(),
        updatedById: null,
      },
      {
        key: "gateway.api_key",
        valueJson: "super-secret",
        updatedAt: new Date(),
        updatedById: "u1",
      },
    ]);
    const db = { systemSetting: { findMany } } as unknown as PrismaClient;

    const items = await listSystemSettings(db);
    expect(items[0]).toMatchObject({
      key: "billing.timezone",
      value: "Asia/Tehran",
      masked: false,
    });
    expect(items[1]).toMatchObject({
      key: "gateway.api_key",
      value: "***",
      masked: true,
    });
  });

  it("upserts and audits without leaking value in audit metadata", async () => {
    const upsert = vi.fn().mockResolvedValue({
      key: "feature.demo",
      valueJson: true,
      updatedAt: new Date(),
      updatedById: "admin-1",
    });
    const db = { systemSetting: { upsert } } as unknown as PrismaClient;

    await upsertSystemSetting(
      {
        key: "feature.demo",
        value: true,
        actorUserId: "admin-1",
        ipAddress: "127.0.0.1",
      },
      db,
    );

    expect(upsert).toHaveBeenCalledOnce();
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        action: "SYSTEM_SETTING_UPDATED",
        metadata: { key: "feature.demo" },
      }),
    );
  });
});

describe("getMonitoringSummary (P10-006)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns degraded when redis is down", async () => {
    const db = {
      domainEventLog: { count: vi.fn().mockResolvedValue(5) },
      payment: { count: vi.fn().mockResolvedValue(2) },
    } as unknown as PrismaClient;

    const summary = await getMonitoringSummary({
      db,
      checkDatabase: async () => true,
      checkRedis: async () => false,
    });

    expect(summary.status).toBe("degraded");
    expect(summary.checks.redis).toBe("error");
    expect(summary.counters.domainEventsLast24h).toBe(5);
    expect(summary.counters.paymentsStuck).toBe(2);
  });
});

describe("P10-006 routes are thin", () => {
  const files = [
    "src/app/api/v1/admin/events/route.ts",
    "src/app/api/v1/admin/settings/route.ts",
    "src/app/api/v1/admin/monitoring/summary/route.ts",
  ];

  it.each(files)("%s has no Prisma import", (rel) => {
    const source = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
    expect(source).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
    expect(source).not.toMatch(/from ["']@prisma\/client["']/);
    expect(source).toContain("requireAdminPermission");
  });
});
