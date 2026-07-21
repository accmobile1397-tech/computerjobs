import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  canAccessAdminPanel,
  filterAdminNav,
  ADMIN_NAV_ITEMS,
} from "@/modules/admin/ui/nav";
import { dashboardSummaryToKpis } from "@/modules/admin/ui/dashboard";

describe("admin UI access (P10-008)", () => {
  it("allows super_admin and admin roles", () => {
    expect(canAccessAdminPanel([], ["super_admin"])).toBe(true);
    expect(canAccessAdminPanel([], ["admin"])).toBe(true);
  });

  it("allows admin:* or legacy admin slugs", () => {
    expect(canAccessAdminPanel(["admin:dashboard:read"], [])).toBe(true);
    expect(canAccessAdminPanel(["billing:admin"], [])).toBe(true);
    expect(canAccessAdminPanel(["job:read:own"], ["job_seeker"])).toBe(false);
  });

  it("filters nav by permission for non-super users", () => {
    const items = filterAdminNav(ADMIN_NAV_ITEMS, ["admin:audit:read"], []);
    expect(items.map((i) => i.href)).toEqual(["/admin/audit"]);
  });

  it("shows all nav for super_admin", () => {
    const items = filterAdminNav(ADMIN_NAV_ITEMS, [], ["super_admin"]);
    expect(items).toHaveLength(ADMIN_NAV_ITEMS.length);
  });
});

describe("dashboard KPI mapping (P10-009)", () => {
  it("maps API summary to display KPIs without inventing values", () => {
    const kpis = dashboardSummaryToKpis({
      users: { total: 10 },
      employers: { total: 4 },
      jobs: { total: 20, pendingReview: 3 },
      applications: { total: 50 },
      payments: { total: 8, stuck: 2 },
      notifications: { failedDeliveries: 1 },
    });

    expect(kpis).toHaveLength(6);
    expect(kpis.find((k) => k.id === "jobs")).toMatchObject({
      value: 20,
      hint: "3 در انتظار بررسی",
    });
    expect(kpis.find((k) => k.id === "payments")?.value).toBe(8);
  });
});

describe("dashboard page uses Admin API only (P10-009)", () => {
  it("client fetches /api/v1/admin/dashboard/summary", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/app/(admin)/admin/dashboard/admin-dashboard-client.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("fetchDashboardSummary");
    expect(source).not.toMatch(/prisma/i);
  });

  it("fetchDashboardSummary targets the admin dashboard endpoint", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/modules/admin/ui/admin-api-client.ts"),
      "utf8",
    );
    expect(source).toContain('"/api/v1/admin/dashboard/summary"');
  });
});

describe("C-005-1 Admin UI never imports Prisma (P10-008+)", () => {
  const roots = [
    path.join(process.cwd(), "src/app/(admin)"),
    path.join(process.cwd(), "src/modules/admin/ui"),
  ];

  function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  it("has zero Prisma / DB client imports under admin UI paths", () => {
    const files = roots.flatMap(walk);
    expect(files.length).toBeGreaterThan(0);

    const banned = [
      /from ["']@prisma\/client["']/,
      /from ["']@\/modules\/shared\/prisma/,
      /from ["'][^"']*\/repositories\//,
    ];

    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of banned) {
        expect(source, file).not.toMatch(pattern);
      }
    }
  });
});
