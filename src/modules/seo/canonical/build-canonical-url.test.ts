import { describe, expect, it } from "vitest";
import {
  buildCanonicalQuery,
  buildCanonicalUrl,
} from "@/modules/seo/canonical/build-canonical-url";

describe("buildCanonicalUrl", () => {
  const base = "https://computerjobs.ir";

  it("builds absolute URL from normalized path", () => {
    expect(buildCanonicalUrl({ path: "/Jobs/", baseUrl: base })).toBe(
      "https://computerjobs.ir/jobs",
    );
  });

  it("strips tracking params from canonical", () => {
    expect(
      buildCanonicalUrl({
        path: "/jobs",
        search: "utm_source=twitter&fbclid=abc&city=tehran",
        baseUrl: base,
      }),
    ).toBe("https://computerjobs.ir/jobs?city=tehran");
  });

  it("keeps page query for self-canonical pagination (C-011-6)", () => {
    expect(
      buildCanonicalUrl({
        path: "/jobs",
        search: { page: "2", utm_campaign: "spring" },
        baseUrl: base,
      }),
    ).toBe("https://computerjobs.ir/jobs?page=2");
  });

  it("does not collapse page=2 to page=1", () => {
    const page2 = buildCanonicalUrl({
      path: "/jobs",
      search: "page=2",
      baseUrl: base,
    });
    const page1 = buildCanonicalUrl({
      path: "/jobs",
      search: "page=1",
      baseUrl: base,
    });
    expect(page2).toBe("https://computerjobs.ir/jobs?page=2");
    expect(page1).toBe("https://computerjobs.ir/jobs?page=1");
    expect(page2).not.toBe(page1);
  });

  it("sorts remaining query keys alphabetically", () => {
    expect(buildCanonicalQuery("z=1&a=2&page=3")).toBe("a=2&page=3&z=1");
  });

  it("returns path-only when no kept query remains", () => {
    expect(
      buildCanonicalUrl({
        path: "/",
        search: "utm_medium=cpc",
        baseUrl: base,
      }),
    ).toBe("https://computerjobs.ir/");
  });
});
