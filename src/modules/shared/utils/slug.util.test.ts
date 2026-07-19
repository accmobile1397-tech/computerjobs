import { describe, expect, it } from "vitest";
import {
  isReservedSlug,
  normalizeSlugInput,
  slugFromName,
  validateSlugFormat,
  validateWebsiteUrl,
} from "@/modules/shared/utils/slug.util";

describe("slug.util", () => {
  it("normalizes persian-ish input to url slug", () => {
    expect(normalizeSlugInput("  Ali Rezaei  ")).toBe("ali-rezaei");
  });

  it("rejects reserved slugs", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(validateSlugFormat("admin")).toBe(false);
  });

  it("generates slug from name with suffix", () => {
    expect(slugFromName("Arya Tech", "abc123")).toMatch(/^arya-tech-abc123$/);
  });

  it("validates https website urls", () => {
    expect(validateWebsiteUrl("https://example.com")).toBe(true);
    expect(validateWebsiteUrl("javascript:alert(1)")).toBe(false);
  });
});
