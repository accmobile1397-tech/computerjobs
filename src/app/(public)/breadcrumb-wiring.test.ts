/**
 * P12-007 — Breadcrumb JSON-LD wiring (Phase 11 builder only · C-012-5).
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPublicJobBreadcrumbScript } from "@/modules/jobs/ui/public-job-seo";
import { buildPublicCompanyBreadcrumbScript } from "@/modules/companies/ui/public-company-seo";
import { staticPageBreadcrumbScript } from "@/app/(public)/_content/static-pages";
import type { PublicJob } from "@/modules/jobs/ui/load-public-job";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

const ROOT = process.cwd();
const base = "https://computerjobs.ir";

describe("P12-007 breadcrumb wiring", () => {
  it("detail pages wire Breadcrumb scripts without new SEO builders", () => {
    for (const rel of [
      "src/app/(public)/jobs/[slug]/page.tsx",
      "src/app/(public)/companies/[slug]/page.tsx",
    ] as const) {
      const source = fs.readFileSync(path.join(ROOT, rel), "utf8");
      expect(source).toContain("BreadcrumbScript");
      expect(source).toContain("JsonLdScripts");
      expect(source).not.toContain("SearchAction");
      expect(source).not.toMatch(/function buildBreadcrumb/);
    }
  });

  it("job detail BreadcrumbList is valid Schema.org", () => {
    const job = {
      slug: "senior-react",
      title: "توسعه‌دهنده Senior React",
      description: "x",
      company: { slug: "acme", name: "اکمی" },
      city: { slug: "tehran", nameFa: "تهران", provinceSlug: "tehran" },
      category: { slug: "software", nameFa: "نرم‌افزار" },
      subCategory: null,
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      skills: [],
      salary: undefined,
      publishedAt: new Date("2026-07-01T10:00:00.000Z"),
      expiresAt: new Date("2026-08-01T10:00:00.000Z"),
    } as PublicJob;

    const script = buildPublicJobBreadcrumbScript(job, { baseUrl: base });
    expect(script).toBeTruthy();
    const graph = JSON.parse(script!);
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@type"]).toBe("BreadcrumbList");
    expect(graph.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: "https://computerjobs.ir/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "فرصت‌های شغلی",
        item: "https://computerjobs.ir/jobs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "توسعه‌دهنده Senior React",
        item: "https://computerjobs.ir/jobs/senior-react",
      },
    ]);
  });

  it("company detail BreadcrumbList is valid Schema.org", () => {
    const company: PublicCompany = {
      name: "اکمی",
      slug: "acme",
      description: "desc",
      logoUrl: null,
      websiteUrl: null,
      employeeCountRange: null,
      industryLabel: null,
    };

    const script = buildPublicCompanyBreadcrumbScript(company, {
      baseUrl: base,
    });
    expect(script).toBeTruthy();
    const graph = JSON.parse(script!);
    expect(graph["@type"]).toBe("BreadcrumbList");
    expect(graph.itemListElement).toHaveLength(3);
    expect(graph.itemListElement[2]).toMatchObject({
      position: 3,
      name: "اکمی",
      item: "https://computerjobs.ir/companies/acme",
    });
  });

  it("static pages emit Home → page Breadcrumb", () => {
    const script = staticPageBreadcrumbScript("about", { baseUrl: base });
    expect(script).toBeTruthy();
    const graph = JSON.parse(script!);
    expect(graph["@type"]).toBe("BreadcrumbList");
    expect(graph.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: "https://computerjobs.ir/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "درباره ما",
        item: "https://computerjobs.ir/about",
      },
    ]);
  });
});
