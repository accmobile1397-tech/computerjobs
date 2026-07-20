import { describe, expect, it } from "vitest";
import { EventBusError } from "@/modules/events/bus/errors";
import {
  getCatalogEntry,
  isKnownEventName,
  validateCatalogPayload,
} from "@/modules/events/catalog/lookup";
import {
  EVENT_CATALOG_V1,
  PHASE9_MVP_EVENT_NAMES,
} from "@/modules/events/catalog/v1";

describe("EVENT_CATALOG_V1", () => {
  it("has unique (name, version) pairs", () => {
    const keys = EVENT_CATALOG_V1.map((entry) => `${entry.name}@${entry.version}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("lists exactly six Phase 9 MVP notification events", () => {
    expect(PHASE9_MVP_EVENT_NAMES).toHaveLength(6);
    expect(PHASE9_MVP_EVENT_NAMES).toEqual([
      "job.application.submitted",
      "contact.unlocked",
      "payment.succeeded",
      "subscription.activated",
      "ai.request.completed",
      "ai.request.failed",
    ]);
  });

  it("resolves job.application.submitted metadata", () => {
    const entry = getCatalogEntry("job.application.submitted");
    expect(entry?.publisherModule).toBe("jobs");
    expect(entry?.payloadFields).toEqual(["jobId", "applicationId", "userId"]);
    expect(isPhase9MvpEntry(entry!)).toBe(true);
  });
});

function isPhase9MvpEntry(
  entry: (typeof EVENT_CATALOG_V1)[number]
): entry is (typeof EVENT_CATALOG_V1)[number] & { phase9NotificationMvp: true } {
  return "phase9NotificationMvp" in entry && entry.phase9NotificationMvp === true;
}

describe("catalog lookup", () => {
  it("recognizes known event names", () => {
    expect(isKnownEventName("payment.succeeded")).toBe(true);
    expect(isKnownEventName("not.real.event")).toBe(false);
  });

  it("rejects unknown catalog entries at payload validation", () => {
    expect(() => validateCatalogPayload("unknown.event", 1, {})).toThrow(EventBusError);
  });

  it("requires declared payload fields", () => {
    expect(() =>
      validateCatalogPayload("payment.succeeded", 1, {
        paymentId: "p1",
        ownerType: "USER",
        ownerId: "u1",
      })
    ).toThrow(/payload missing required field "sku"/);
  });

  it("accepts complete payment.succeeded payload", () => {
    expect(() =>
      validateCatalogPayload("payment.succeeded", 1, {
        paymentId: "p1",
        ownerType: "USER",
        ownerId: "u1",
        sku: "plan-pro",
      })
    ).not.toThrow();
  });
});
