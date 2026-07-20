import { describe, expect, it } from "vitest";
import { EVENTS, eventConstantKey } from "@/modules/events/catalog/events";
import { EVENT_CATALOG_V1 } from "@/modules/events/catalog/v1";

describe("EVENTS constants", () => {
  it("derives every catalog name exactly once", () => {
    expect(Object.keys(EVENTS)).toHaveLength(EVENT_CATALOG_V1.length);
    for (const entry of EVENT_CATALOG_V1) {
      expect(Object.values(EVENTS)).toContain(entry.name);
    }
  });

  it("exposes PAYMENT_SUCCEEDED from catalog", () => {
    expect(EVENTS.PAYMENT_SUCCEEDED).toBe("payment.succeeded");
    expect(eventConstantKey(EVENTS.PAYMENT_SUCCEEDED)).toBe("PAYMENT_SUCCEEDED");
  });
});
