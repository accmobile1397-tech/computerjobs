/**
 * Phase 10 final hardening (P10-015) — static architecture guards.
 * C-005-1 · C-010-5 · C-009-6 · thin Admin API routes.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ADMIN_PERMISSION_SLUGS } from "@/modules/admin/permissions";

function walkTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const ROOT = process.cwd();

const ADMIN_UI_ROOTS = [
  path.join(ROOT, "src/app/(admin)"),
  path.join(ROOT, "src/modules/admin/ui"),
];

/** Phase 10 platform Admin API routes that must stay thin (no Prisma in route). */
const THIN_PLATFORM_ROUTES = [
  "src/app/api/v1/admin/dashboard/summary/route.ts",
  "src/app/api/v1/admin/audit/route.ts",
  "src/app/api/v1/admin/events/route.ts",
  "src/app/api/v1/admin/settings/route.ts",
  "src/app/api/v1/admin/monitoring/summary/route.ts",
  "src/app/api/v1/admin/billing/route.ts",
] as const;

const BANNED_UI_IMPORTS = [
  /from ["']@prisma\/client["']/,
  /from ["']@\/modules\/shared\/prisma/,
  /from ["']@\/modules\/shared\/redis/,
  /from ["'][^"']*\/repositories\//,
  /from ["']@\/modules\/admin\/services/,
  /PrismaClient/,
  /\$queryRaw/,
  /\$executeRaw/,
];

describe("P10-015 C-005-1 Admin UI never touches persistence", () => {
  it("has zero Prisma / DB / redis / repository / admin-service imports under UI paths", () => {
    const files = ADMIN_UI_ROOTS.flatMap(walkTsFiles);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of BANNED_UI_IMPORTS) {
        expect(source, `${file} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("admin UI module clients only call Admin HTTP APIs via admin-api-client", () => {
    const clientSource = fs.readFileSync(
      path.join(ROOT, "src/modules/admin/ui/admin-api-client.ts"),
      "utf8",
    );
    expect(clientSource).toContain("adminFetch");
    expect(clientSource).toMatch(/\/api\/v1\/admin\//);
    expect(clientSource).not.toMatch(/from ["']@prisma\/client["']/);
    expect(clientSource).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
  });
});

describe("P10-015 DomainEventLog append-only (C-010-5)", () => {
  it("Prisma model has no updatedAt or deletedAt (append-only shape)", () => {
    const schema = fs.readFileSync(
      path.join(ROOT, "prisma/schema.prisma"),
      "utf8",
    );
    const match = schema.match(/model DomainEventLog \{[\s\S]*?\n\}/);
    expect(match).toBeTruthy();
    const block = match![0];
    expect(block).toContain("createdAt");
    expect(block).not.toMatch(/updatedAt/);
    expect(block).not.toMatch(/deletedAt/);
  });

  it("append helper only creates rows — never update/delete", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/modules/events/log/append-domain-event.ts"),
      "utf8",
    );
    expect(source).toContain("domainEventLog.create");
    expect(source).not.toMatch(/domainEventLog\.(update|delete|updateMany|deleteMany)/);
    expect(source).toMatch(/Append-only|append-only|C-010-5/);
  });

  it("event viewer service is read-only (findMany/count only)", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/modules/admin/services/event-viewer.service.ts"),
      "utf8",
    );
    expect(source).toContain("domainEventLog.findMany");
    expect(source).toContain("domainEventLog.count");
    expect(source).not.toMatch(
      /domainEventLog\.(create|update|delete|upsert|updateMany|deleteMany)/,
    );
  });

  it("admin events API route is GET-only", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/app/api/v1/admin/events/route.ts"),
      "utf8",
    );
    expect(source).toContain("export async function GET");
    expect(source).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(source).toContain("listDomainEvents");
    expect(source).toContain("ADMIN_PERMISSIONS.EVENTS_READ");
  });
});

describe("P10-015 admin inbox remains read-only (C-009-6 / C-010-4)", () => {
  it("admin inbox API route is GET-only", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/app/api/v1/admin/notifications/inbox/route.ts"),
      "utf8",
    );
    expect(source).toContain("export async function GET");
    expect(source).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(source).toContain("listInboxAdminReadOnly");
    expect(source).toMatch(/C-009-6|read-only|Read-only/);
  });

  it("admin inbox service never mutates Notification rows", () => {
    const source = fs.readFileSync(
      path.join(ROOT, "src/modules/notifications/services/admin.service.ts"),
      "utf8",
    );
    const fnStart = source.indexOf("export async function listInboxAdminReadOnly");
    expect(fnStart).toBeGreaterThanOrEqual(0);
    const nextExport = source.indexOf("\nexport ", fnStart + 1);
    const fnBody =
      nextExport === -1 ? source.slice(fnStart) : source.slice(fnStart, nextExport);
    expect(fnBody).toContain("notification.findMany");
    expect(fnBody).toContain("notification.count");
    expect(fnBody).not.toMatch(
      /notification\.(create|update|delete|upsert|updateMany|deleteMany)/,
    );
  });

  it("admin inbox UI client is GET-only with no mutation helpers", () => {
    const source = fs.readFileSync(
      path.join(
        ROOT,
        "src/app/(admin)/admin/notifications/inbox/admin-notification-inbox-client.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("fetchNotificationInbox");
    expect(source).toContain("C-009-6");
    expect(source).not.toMatch(/method:\s*["'](POST|PUT|PATCH|DELETE)["']/);
    expect(source).not.toMatch(/markRead|softDelete|onRetry|onResend/);
  });
});

describe("P10-015 Phase 10 platform Admin routes stay thin", () => {
  it.each(THIN_PLATFORM_ROUTES)("%s has no Prisma and uses authz + service", (rel) => {
    const source = fs.readFileSync(path.join(ROOT, rel), "utf8");
    expect(source).not.toMatch(/from ["']@prisma\/client["']/);
    expect(source).not.toMatch(/from ["']@\/modules\/shared\/prisma/);
    expect(source).toMatch(/requireAdminPermission|requirePermission/);
  });

  it("platform routes delegate to admin services (not inline DB)", () => {
    const expectations: Record<(typeof THIN_PLATFORM_ROUTES)[number], string> = {
      "src/app/api/v1/admin/dashboard/summary/route.ts": "getDashboardSummary",
      "src/app/api/v1/admin/audit/route.ts": "listAuditLogs",
      "src/app/api/v1/admin/events/route.ts": "listDomainEvents",
      "src/app/api/v1/admin/settings/route.ts": "listSystemSettings",
      "src/app/api/v1/admin/monitoring/summary/route.ts": "getMonitoringSummary",
      "src/app/api/v1/admin/billing/route.ts": "billing-admin.service",
    };

    for (const [rel, needle] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, rel), "utf8");
      expect(source, rel).toContain(needle);
    }
  });
});

describe("P10-015 IAM catalog completeness", () => {
  it("ADMIN_PERMISSION_SLUGS covers RFC-005 core namespaces", () => {
    const required = [
      "admin:dashboard:read",
      "admin:users:read",
      "admin:users:write",
      "admin:companies:read",
      "admin:jobs:read",
      "admin:billing:read",
      "admin:notifications:read",
      "admin:settings:read",
      "admin:audit:read",
      "admin:events:read",
      "admin:monitoring:read",
    ];
    for (const slug of required) {
      expect(ADMIN_PERMISSION_SLUGS, slug).toContain(slug);
    }
  });
});
