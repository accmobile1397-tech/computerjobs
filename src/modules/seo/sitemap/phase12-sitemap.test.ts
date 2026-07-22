/**
 * P12-008 — sitemap expansion guards (C-012-2 · RFC-006).
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();

describe("P12-008 sitemap expansion", () => {
  it("uses SitemapSource collectors — no SearchAction / AI landings sources live", () => {
    const phase11 = fs.readFileSync(
      path.join(ROOT, "src/modules/seo/sitemap/phase11.ts"),
      "utf8",
    );
    expect(phase11).toContain("staticCoreSitemapSource");
    expect(phase11).toContain("jobsPublicSitemapSource");
    expect(phase11).toContain("companiesPublicSitemapSource");
    expect(phase11).toContain("collectSitemapEntries");
    expect(phase11).not.toContain("SearchAction");
  });

  it("jobs/companies sources call domain sitemap helpers (same public gates)", () => {
    const jobs = fs.readFileSync(
      path.join(ROOT, "src/modules/seo/sitemap/jobs-public.ts"),
      "utf8",
    );
    const companies = fs.readFileSync(
      path.join(ROOT, "src/modules/seo/sitemap/companies-public.ts"),
      "utf8",
    );
    expect(jobs).toContain("listPublicJobSlugsForSitemap");
    expect(companies).toContain("listPublicCompanySlugsForSitemap");
    expect(jobs).not.toMatch(/@prisma/);
    expect(companies).not.toMatch(/@prisma/);
  });

  it("deferred hubs remain empty stubs", () => {
    const stubs = fs.readFileSync(
      path.join(ROOT, "src/modules/seo/sitemap/domain-stubs.ts"),
      "utf8",
    );
    expect(stubs).toContain('emptySource("taxonomy")');
    expect(stubs).toContain('emptySource("locations")');
    expect(stubs).toContain('emptySource("ai-landings")');
  });
});
