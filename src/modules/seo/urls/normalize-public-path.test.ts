import { describe, expect, it } from "vitest";
import {
  SeoUrlError,
  normalizePublicPath,
} from "@/modules/seo/urls/normalize-public-path";
import {
  isTrackingQueryParam,
  stripTrackingQueryParams,
} from "@/modules/seo/urls/tracking-params";

describe("normalizePublicPath", () => {
  it("ensures leading slash", () => {
    expect(normalizePublicPath("jobs")).toBe("/jobs");
  });

  it("lowercases path segments", () => {
    expect(normalizePublicPath("/Jobs/Senior-React")).toBe("/jobs/senior-react");
  });

  it("collapses duplicate slashes", () => {
    expect(normalizePublicPath("//jobs///list")).toBe("/jobs/list");
  });

  it("strips trailing slash except root", () => {
    expect(normalizePublicPath("/jobs/")).toBe("/jobs");
    expect(normalizePublicPath("/")).toBe("/");
  });

  it("discards query and hash", () => {
    expect(normalizePublicPath("/jobs?page=2#x")).toBe("/jobs");
  });

  it("accepts absolute URLs and uses pathname", () => {
    expect(normalizePublicPath("https://computerjobs.ir/Jobs/")).toBe("/jobs");
  });

  it("rejects UUID-shaped segments", () => {
    expect(() =>
      normalizePublicPath("/jobs/550e8400-e29b-41d4-a716-446655440000"),
    ).toThrow(SeoUrlError);
  });

  it("rejects empty input", () => {
    expect(() => normalizePublicPath("  ")).toThrow(SeoUrlError);
  });
});

describe("tracking query params", () => {
  it("detects utm_* and known click ids", () => {
    expect(isTrackingQueryParam("utm_source")).toBe(true);
    expect(isTrackingQueryParam("fbclid")).toBe(true);
    expect(isTrackingQueryParam("page")).toBe(false);
  });

  it("strips tracking keys in place", () => {
    const params = new URLSearchParams(
      "page=2&utm_source=x&fbclid=y&city=tehran",
    );
    stripTrackingQueryParams(params);
    expect(params.toString()).toBe("page=2&city=tehran");
  });
});
