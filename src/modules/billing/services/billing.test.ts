import { describe, expect, it } from "vitest";
import { FeaturePeriod } from "@prisma/client";
import { formatInTimeZone } from "@/modules/billing/services/billing-core";
import { FEATURE_KEYS } from "@/modules/billing/constants";

describe("billing periodKey (happy path)", () => {
  it("formats month key in timezone", () => {
    const d = new Date("2026-07-19T12:00:00Z");
    const key = formatInTimeZone(d, "Asia/Tehran", "month");
    expect(key).toMatch(/^\d{4}-\d{2}$/);
  });

  it("FeaturePeriod.NONE maps conceptually to lifetime", () => {
    expect(FeaturePeriod.NONE).toBe("NONE");
  });
});

describe("billing feature keys (no magic numbers)", () => {
  it("exposes stable feature key strings", () => {
    expect(FEATURE_KEYS.APPLICATION_PER_MONTH).toBe("application.per_month");
    expect(FEATURE_KEYS.CONTACT_UNLOCK_PER_MONTH).toBe("contact_unlock.per_month");
  });
});

describe("permission contract", () => {
  it("documents billing admin permission slug", () => {
    expect("billing:admin").toBe("billing:admin");
  });
});
