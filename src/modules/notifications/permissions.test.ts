import { describe, expect, it } from "vitest";
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
