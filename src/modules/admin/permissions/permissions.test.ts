import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_SLUGS,
  LEGACY_ADMIN_ALIASES,
  resolveAdminPermissionSlugs,
  requireAdminPermission,
} from "@/modules/admin/permissions";
import { AuthorizationError } from "@/modules/authorization/services/authorization.service";

vi.mock("@/modules/authorization/repositories/permission.repository", () => ({
  findPermissionsByUserId: vi.fn(),
}));

import { findPermissionsByUserId } from "@/modules/authorization/repositories/permission.repository";

const mockedFind = vi.mocked(findPermissionsByUserId);

describe("ADMIN_PERMISSIONS registry (P10-002)", () => {
  it("includes RFC-005 core admin:* slugs", () => {
    expect(ADMIN_PERMISSIONS.DASHBOARD_READ).toBe("admin:dashboard:read");
    expect(ADMIN_PERMISSIONS.BILLING_WRITE).toBe("admin:billing:write");
    expect(ADMIN_PERMISSIONS.NOTIFICATIONS_READ).toBe(
      "admin:notifications:read",
    );
    expect(ADMIN_PERMISSIONS.AUDIT_READ).toBe("admin:audit:read");
    expect(ADMIN_PERMISSIONS.EVENTS_READ).toBe("admin:events:read");
    expect(ADMIN_PERMISSIONS.MONITORING_READ).toBe("admin:monitoring:read");
  });

  it("includes Phase 10 taxonomy and location extensions", () => {
    expect(ADMIN_PERMISSIONS.TAXONOMY_READ).toBe("admin:taxonomy:read");
    expect(ADMIN_PERMISSIONS.TAXONOMY_WRITE).toBe("admin:taxonomy:write");
    expect(ADMIN_PERMISSIONS.LOCATION_WRITE).toBe("admin:location:write");
  });

  it("exposes a non-empty slug list with admin: prefix", () => {
    expect(ADMIN_PERMISSION_SLUGS.length).toBeGreaterThanOrEqual(20);
    for (const slug of ADMIN_PERMISSION_SLUGS) {
      expect(slug.startsWith("admin:")).toBe(true);
    }
  });
});

describe("legacy alias map (P10-002)", () => {
  it("maps billing:admin to billing read+write", () => {
    expect(LEGACY_ADMIN_ALIASES["billing:admin"]).toEqual([
      ADMIN_PERMISSIONS.BILLING_READ,
      ADMIN_PERMISSIONS.BILLING_WRITE,
    ]);
  });

  it("maps notifications:admin to notifications read+write", () => {
    expect(LEGACY_ADMIN_ALIASES["notifications:admin"]).toEqual([
      ADMIN_PERMISSIONS.NOTIFICATIONS_READ,
      ADMIN_PERMISSIONS.NOTIFICATIONS_WRITE,
    ]);
  });

  it("resolves admin slug to include granting legacy slugs", () => {
    const resolved = resolveAdminPermissionSlugs(
      ADMIN_PERMISSIONS.COMPANIES_WRITE,
    );
    expect(resolved).toContain(ADMIN_PERMISSIONS.COMPANIES_WRITE);
    expect(resolved).toContain("company:verify");
    expect(resolved).toContain("company:suspend");
  });

  it("resolves legacy slug to include admin aliases", () => {
    const resolved = resolveAdminPermissionSlugs("job:approve");
    expect(resolved).toContain("job:approve");
    expect(resolved).toContain(ADMIN_PERMISSIONS.JOBS_WRITE);
  });
});

describe("requireAdminPermission (P10-002)", () => {
  beforeEach(() => {
    mockedFind.mockReset();
  });

  it("allows when user holds the exact admin:* slug", async () => {
    mockedFind.mockResolvedValue([ADMIN_PERMISSIONS.DASHBOARD_READ]);
    await expect(
      requireAdminPermission("u1", ADMIN_PERMISSIONS.DASHBOARD_READ),
    ).resolves.toBeUndefined();
  });

  it("allows when user holds a legacy alias of the required admin slug", async () => {
    mockedFind.mockResolvedValue(["billing:admin"]);
    await expect(
      requireAdminPermission("u1", ADMIN_PERMISSIONS.BILLING_READ),
    ).resolves.toBeUndefined();
    await expect(
      requireAdminPermission("u1", ADMIN_PERMISSIONS.BILLING_WRITE),
    ).resolves.toBeUndefined();
  });

  it("allows when required is legacy and user holds admin:* alias", async () => {
    mockedFind.mockResolvedValue([ADMIN_PERMISSIONS.JOBS_WRITE]);
    await expect(
      requireAdminPermission("u1", "job:approve"),
    ).resolves.toBeUndefined();
  });

  it("denies when neither admin nor legacy slug is held", async () => {
    mockedFind.mockResolvedValue(["job:read:own"]);
    await expect(
      requireAdminPermission("u1", ADMIN_PERMISSIONS.AUDIT_READ),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
