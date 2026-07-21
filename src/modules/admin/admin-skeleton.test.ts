import { describe, expect, it } from "vitest";

import type { AdminListQuery, AdminServiceName } from "./types";
import * as admin from "./index";

describe("admin module skeleton (P10-001)", () => {
  it("exports shared types from the module root", () => {
    const query: AdminListQuery = { page: 1, pageSize: 20 };
    const names: AdminServiceName[] = [
      "dashboard",
      "audit-viewer",
      "event-viewer",
      "settings",
      "monitoring",
      "billing-admin",
    ];

    expect(query.page).toBe(1);
    expect(names).toHaveLength(6);
    expect(admin).toBeDefined();
  });
});
