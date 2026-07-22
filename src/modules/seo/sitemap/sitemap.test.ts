import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/jobs/services/job.service", () => ({
  listPublicJobSlugsForSitemap: vi.fn(),
}));

vi.mock("@/modules/companies/services/company.service", () => ({
  listPublicCompanySlugsForSitemap: vi.fn(),
}));

import { listPublicJobSlugsForSitemap } from "@/modules/jobs/services/job.service";
import { listPublicCompanySlugsForSitemap } from "@/modules/companies/services/company.service";
import {
  buildPhase11Sitemap,
  collectSitemapEntries,
  companiesPublicSitemapSource,
  isBlockedSitemapPath,
  jobsPublicSitemapSource,
  staticCoreSitemapSource,
  taxonomySitemapSource,
  type SitemapSource,
} from "@/modules/seo/sitemap";

const base = "https://computerjobs.ir";

beforeEach(() => {
  vi.mocked(listPublicJobSlugsForSitemap).mockResolvedValue([]);
  vi.mocked(listPublicCompanySlugsForSitemap).mockResolvedValue([]);
});

describe("staticCoreSitemapSource", () => {
  it("lists live static paths only (P12-008)", async () => {
    const entries = await staticCoreSitemapSource.listEntries();
    expect(entries.map((e) => e.path)).toEqual([
      "/",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
    ]);
  });
});

describe("jobsPublicSitemapSource", () => {
  it("always includes /jobs and public job slugs only", async () => {
    vi.mocked(listPublicJobSlugsForSitemap).mockResolvedValue([
      { slug: "senior-react", lastModified: new Date("2026-07-01T00:00:00.000Z") },
    ]);
    const entries = await jobsPublicSitemapSource.listEntries();
    expect(entries.map((e) => e.path)).toEqual([
      "/jobs",
      "/jobs/senior-react",
    ]);
  });
});

describe("companiesPublicSitemapSource", () => {
  it("always includes /companies and public company slugs only", async () => {
    vi.mocked(listPublicCompanySlugsForSitemap).mockResolvedValue([
      { slug: "acme", lastModified: new Date("2026-07-01T00:00:00.000Z") },
    ]);
    const entries = await companiesPublicSitemapSource.listEntries();
    expect(entries.map((e) => e.path)).toEqual([
      "/companies",
      "/companies/acme",
    ]);
  });
});

describe("deferred domain stubs", () => {
  it("taxonomy/locations/ai remain empty (out of Option 1)", async () => {
    expect(await taxonomySitemapSource.listEntries()).toEqual([]);
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
          { path: "/categories/x" },
          { path: "/locations/tehran" },
        ];
      },
    };

    const entries = await collectSitemapEntries([
      staticCoreSitemapSource,
      rogue,
    ]);
    expect(entries.map((e) => e.path)).toEqual([
      "/",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
    ]);
  });
});

describe("isBlockedSitemapPath", () => {
  it("blocks admin api auth dashboard and deferred hubs", () => {
    expect(isBlockedSitemapPath("/admin")).toBe(true);
    expect(isBlockedSitemapPath("/admin/settings")).toBe(true);
    expect(isBlockedSitemapPath("/api/v1/x")).toBe(true);
    expect(isBlockedSitemapPath("/dashboard")).toBe(true);
    expect(isBlockedSitemapPath("/profile")).toBe(true);
    expect(isBlockedSitemapPath("/profile/me")).toBe(true);
    expect(isBlockedSitemapPath("/categories")).toBe(true);
    expect(isBlockedSitemapPath("/locations/x")).toBe(true);
    expect(isBlockedSitemapPath("/skills")).toBe(true);
    expect(isBlockedSitemapPath("/technologies")).toBe(true);
    expect(isBlockedSitemapPath("/")).toBe(false);
    expect(isBlockedSitemapPath("/jobs")).toBe(false);
  });
});

describe("buildPhase11Sitemap", () => {
  it("emits Option 1 live URLs only — no soft-404 hubs (C-012-2)", async () => {
    vi.mocked(listPublicJobSlugsForSitemap).mockResolvedValue([
      { slug: "senior-react", lastModified: new Date("2026-07-01T00:00:00.000Z") },
    ]);
    vi.mocked(listPublicCompanySlugsForSitemap).mockResolvedValue([
      { slug: "acme", lastModified: new Date("2026-07-01T00:00:00.000Z") },
    ]);

    const rows = await buildPhase11Sitemap({ baseUrl: base });
    const urls = rows.map((r) => r.url);

    expect(urls).toEqual([
      "https://computerjobs.ir/",
      "https://computerjobs.ir/about",
      "https://computerjobs.ir/companies",
      "https://computerjobs.ir/companies/acme",
      "https://computerjobs.ir/contact",
      "https://computerjobs.ir/jobs",
      "https://computerjobs.ir/jobs/senior-react",
      "https://computerjobs.ir/privacy",
      "https://computerjobs.ir/terms",
    ]);

    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/categories"))).toBe(false);
    expect(urls.some((u) => u.includes("/locations"))).toBe(false);
    expect(urls.some((u) => u.includes("/skills"))).toBe(false);
    expect(urls.some((u) => u.includes("/SearchAction"))).toBe(false);
  });
});
