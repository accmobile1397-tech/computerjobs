import { describe, expect, it, vi } from "vitest";
import { AuditAction, type PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { listAuditLogs } from "@/modules/admin/services/audit-viewer.service";
import { listAuditQuerySchema } from "@/modules/admin/validators/audit-api.schema";

describe("listAuditQuerySchema (P10-005)", () => {
  it("defaults page and pageSize (pagination always on)", () => {
    const parsed = listAuditQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });

  it("rejects pageSize above 100", () => {
    expect(() => listAuditQuerySchema.parse({ pageSize: "101" })).toThrow();
  });
});

describe("listAuditLogs (P10-005)", () => {
  it("lists with skip/take and filters", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "a1",
        userId: "u1",
        action: AuditAction.LOGIN_SUCCESS,
        ipAddress: null,
        userAgent: null,
        metadata: null,
        createdAt: new Date("2026-07-21T10:00:00.000Z"),
      },
    ]);
    const count = vi.fn().mockResolvedValue(1);
    const db = {
      auditLog: { findMany, count },
    } as unknown as PrismaClient;

    const from = new Date("2026-07-01T00:00:00.000Z");
    const result = await listAuditLogs(
      {
        page: 2,
        pageSize: 10,
        action: AuditAction.LOGIN_SUCCESS,
        userId: "550e8400-e29b-41d4-a716-446655440000",
        from,
      },
      db,
    );

    expect(result).toEqual({
      items: expect.any(Array),
      total: 1,
      page: 2,
      pageSize: 10,
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { createdAt: "desc" },
        where: expect.objectContaining({
          action: AuditAction.LOGIN_SUCCESS,
          userId: "550e8400-e29b-41d4-a716-446655440000",
          createdAt: expect.objectContaining({ gte: from }),
        }),
      }),
    );
    expect(count).toHaveBeenCalledOnce();
  });
});

describe("audit route (P10-005)", () => {
  it("is thin: no Prisma, uses requireAdminPermission + listAuditLogs", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/app/api/v1/admin/audit/route.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
    expect(source).not.toMatch(/from ["']@prisma\/client["']/);
    expect(source).toContain("requireAdminPermission");
    expect(source).toContain("ADMIN_PERMISSIONS.AUDIT_READ");
    expect(source).toContain("listAuditLogs");
  });
});
