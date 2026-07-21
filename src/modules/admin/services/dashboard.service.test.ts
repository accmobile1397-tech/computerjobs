import { describe, expect, it, vi } from "vitest";
import {
  JobStatus,
  NotificationDeliveryStatus,
  PaymentStatus,
  type PrismaClient,
} from "@prisma/client";
import { getDashboardSummary } from "@/modules/admin/services/dashboard.service";
import * as fs from "fs";
import * as path from "path";

describe("getDashboardSummary (P10-004)", () => {
  it("aggregates read-only counts across domains", async () => {
    const user = { count: vi.fn().mockResolvedValue(10) };
    const employerProfile = { count: vi.fn().mockResolvedValue(4) };
    const job = {
      count: vi
        .fn()
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(3),
    };
    const jobApplication = { count: vi.fn().mockResolvedValue(50) };
    const payment = {
      count: vi
        .fn()
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2),
    };
    const notificationDelivery = { count: vi.fn().mockResolvedValue(1) };

    const db = {
      user,
      employerProfile,
      job,
      jobApplication,
      payment,
      notificationDelivery,
    } as unknown as PrismaClient;

    const summary = await getDashboardSummary(db);

    expect(summary).toEqual({
      users: { total: 10 },
      employers: { total: 4 },
      jobs: { total: 20, pendingReview: 3 },
      applications: { total: 50 },
      payments: { total: 8, stuck: 2 },
      notifications: { failedDeliveries: 1 },
    });

    expect(job.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: JobStatus.PENDING_REVIEW }),
      }),
    );
    expect(payment.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
        },
      }),
    );
    expect(notificationDelivery.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: NotificationDeliveryStatus.FAILED },
      }),
    );
  });
});

describe("dashboard summary route (P10-004)", () => {
  it("is a thin route: no Prisma import, uses requireAdminPermission + service", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/app/api/v1/admin/dashboard/summary/route.ts",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
    expect(source).not.toMatch(/from ["']@prisma\/client["']/);
    expect(source).toContain("requireAdminPermission");
    expect(source).toContain("ADMIN_PERMISSIONS.DASHBOARD_READ");
    expect(source).toContain("getDashboardSummary");
  });
});
