import { beforeEach, describe, expect, it, vi } from "vitest";
import { BillingOwnerType, ConsumableType, type PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import {
  getBillingAdminOverview,
  grantBillingAdmin,
  upsertBillingAdminSetting,
  versionPlanFeatureAdmin,
} from "@/modules/admin/services/billing-admin.service";

vi.mock("@/modules/auth/services/audit.service", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/billing/services/wallet.service", () => ({
  creditWallet: vi.fn().mockResolvedValue({ balance: 10 }),
}));

import { writeAuditLog } from "@/modules/auth/services/audit.service";
import { creditWallet } from "@/modules/billing/services/wallet.service";

describe("billing-admin.service (P10-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads plans and settings for overview", async () => {
    const planDefinition = {
      findMany: vi.fn().mockResolvedValue([{ id: "plan-1" }]),
    };
    const systemSetting = {
      findMany: vi.fn().mockResolvedValue([{ key: "billing.timezone" }]),
    };
    const db = { planDefinition, systemSetting } as unknown as PrismaClient;

    const result = await getBillingAdminOverview(db);
    expect(result.plans).toHaveLength(1);
    expect(result.settings).toHaveLength(1);
    expect(planDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { features: true, prices: true },
      }),
    );
  });

  it("grants via creditWallet with adminGrant", async () => {
    await grantBillingAdmin({
      ownerType: BillingOwnerType.USER,
      ownerId: "u1",
      consumableType: ConsumableType.AI_CREDIT,
      amount: 5,
      actorUserId: "admin-1",
    });

    expect(creditWallet).toHaveBeenCalledWith(
      expect.objectContaining({
        adminGrant: true,
        actorUserId: "admin-1",
        amount: 5,
      }),
    );
  });

  it("upserts setting and writes audit", async () => {
    const upsert = vi.fn().mockResolvedValue({
      key: "billing.timezone",
      valueJson: "Asia/Tehran",
    });
    const db = { systemSetting: { upsert } } as unknown as PrismaClient;

    await upsertBillingAdminSetting(
      {
        key: "billing.timezone",
        value: "Asia/Tehran",
        actorUserId: "admin-1",
      },
      db,
    );

    expect(upsert).toHaveBeenCalledOnce();
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SYSTEM_SETTING_UPDATED",
        metadata: { key: "billing.timezone" },
      }),
    );
  });

  it("versions plan feature and audits", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "pf-1",
      version: 2,
    });
    const update = vi.fn().mockResolvedValue({});
    const create = vi.fn().mockResolvedValue({
      id: "pf-2",
      featureKey: "job_post",
      version: 3,
    });
    const db = {
      planFeature: { findFirst, update, create },
    } as unknown as PrismaClient;

    const created = await versionPlanFeatureAdmin(
      {
        planId: "550e8400-e29b-41d4-a716-446655440000",
        featureKey: "job_post",
        limitValue: 10,
        period: "MONTH",
        actorUserId: "admin-1",
      },
      db,
    );

    expect(update).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 3 }),
      }),
    );
    expect(created.id).toBe("pf-2");
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "PLAN_FEATURE_VERSIONED" }),
    );
  });
});

describe("admin billing route (P10-007)", () => {
  it("is thin: no Prisma import, uses billing-admin service", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/app/api/v1/admin/billing/route.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
    expect(source).not.toMatch(/from ["']@prisma\/client["']/);
    expect(source).toContain("requireAdminPermission");
    expect(source).toContain("getBillingAdminOverview");
    expect(source).toContain("grantBillingAdmin");
    expect(source).toContain("upsertBillingAdminSetting");
    expect(source).toContain("versionPlanFeatureAdmin");
  });
});
