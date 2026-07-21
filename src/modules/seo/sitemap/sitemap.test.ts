import { describe, expect, it } from "vitest";
import {
  buildPhase11Sitemap,
  collectSitemapEntries,
  isBlockedSitemapPath,
  jobsPublicSitemapSource,
  staticCoreSitemapSource,
  type SitemapSource,
} from "@/modules/seo/sitemap";

const base = "https://computerjobs.ir";

describe("staticCoreSitemapSource", () => {
  it("lists only the live home path", async () => {
    const entries = await staticCoreSitemapSource.listEntries();
    expect(entries.map((e) => e.path)).toEqual(["/"]);
  });
});

describe("domain stubs", () => {
  it("return empty lists until Phase 12 pages exist (C-011-2)", async () => {
    expect(await jobsPublicSitemapSource.listEntries()).toEqual([]);
  });
});

describe("collectSitemapEntries", () => {
  it("dedupes by path and skips blocked prefixes", async () => {
    const rogue: SitemapSource = {
      id: "rogue",
      async listEntries() {
        return [
          { path: "/" },
          { path: "/admin/dashboard" },
          { path: "/api/v1/jobs" },
          { path: "/login" },
        ];
      },
    };

    const entries = await collectSitemapEntries([
      staticCoreSitemapSource,
      rogue,
    ]);
    expect(entries.map((e) => e.path)).toEqual(["/"]);
  });
});

describe("isBlockedSitemapPath", () => {
  it("blocks admin api auth dashboard", () => {
    expect(isBlockedSitemapPath("/admin")).toBe(true);
    expect(isBlockedSitemapPath("/admin/settings")).toBe(true);
    expect(isBlockedSitemapPath("/api/v1/x")).toBe(true);
    expect(isBlockedSitemapPath("/dashboard")).toBe(true);
    expect(isBlockedSitemapPath("/")).toBe(false);
  });
});

describe("buildPhase11Sitemap", () => {
  it("emits absolute URL for live home only — no soft-404 domain URLs", async () => {
    const rows = await buildPhase11Sitemap({ baseUrl: base });
    expect(rows).toEqual([
      {
        url: "https://computerjobs.ir/",
        changeFrequency: "weekly",
        priority: 1,
      },
    ]);
    expect(rows.some((r) => r.url.includes("/jobs"))).toBe(false);
    expect(rows.some((r) => r.url.includes("/admin"))).toBe(false);
  });
});
