import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { NOTIFICATION_PERMISSIONS } from "@/modules/notifications/permissions";

describe("notification IAM permissions (P9-014)", () => {
  it("exposes the three Phase 9 notification permission slugs", () => {
    expect(NOTIFICATION_PERMISSIONS.READ_OWN).toBe("notifications:read:own");
    expect(NOTIFICATION_PERMISSIONS.PREFERENCES_OWN).toBe(
      "notifications:preferences:own"
    );
    expect(NOTIFICATION_PERMISSIONS.ADMIN).toBe("notifications:admin");
  });
});

describe("notification permission seed (C-P9-1)", () => {
  const seedSource = fs.readFileSync(
    path.join(process.cwd(), "prisma/seed.ts"),
    "utf8"
  );

  it("declares all three slugs in PERMISSIONS array", () => {
    for (const slug of Object.values(NOTIFICATION_PERMISSIONS)) {
      expect(seedSource, slug).toContain(`slug: "${slug}"`);
    }
  });

  it("maps read:own and preferences:own to job_seeker and employer", () => {
    for (const role of ["job_seeker", "employer"] as const) {
      expect(seedSource).toMatch(
        new RegExp(`slug: "${role}"[\\s\\S]*?notifications:read:own`)
      );
      expect(seedSource).toMatch(
        new RegExp(`slug: "${role}"[\\s\\S]*?notifications:preferences:own`)
      );
    }
  });

  it("maps notifications:admin to admin role", () => {
    expect(seedSource).toMatch(
      /slug: "admin"[\s\S]*?notifications:admin/
    );
  });

  it("uses idempotent upsert for permissions and role mappings", () => {
    expect(seedSource).toContain("prisma.permission.upsert");
    expect(seedSource).toContain("prisma.rolePermission.upsert");
  });
});
