/**
 * P12-006 — public `/companies/[slug]` guards + SEO mapping.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPageMetadata } from "@/modules/seo/metadata";
import {
  buildPublicCompanyBreadcrumbScript,
  buildPublicCompanyPageInput,
} from "@/modules/companies/ui/public-company-seo";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

const ROOT = process.cwd();
const PAGE = path.join(ROOT, "src/app/(public)/companies/[slug]/page.tsx");

function sampleCompany(
  overrides: Partial<PublicCompany> = {},
): PublicCompany {
  return {
    name: "اکمی",
    slug: "acme",
    description: "شرکت فناوری فعال در حوزه نرم‌افزار.",
    logoUrl: null,
    websiteUrl: "https://example.com",
    employeeCountRange: "51_200",
    industryLabel: "نرم‌افزار",
    ...overrides,
  };
}

describe("P12-006 public company detail", () => {
  it("page exists under (public)/companies/[slug]", () => {
    expect(fs.existsSync(PAGE)).toBe(true);
  });

  it("uses generateMetadata, notFound, Breadcrumb wiring, no Prisma / SearchAction", () => {
    const source = fs.readFileSync(PAGE, "utf8");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("buildPageMetadata");
    expect(source).toContain("notFound");
    expect(source).toContain("loadPublicCompanyBySlug");
    expect(source).toContain("buildPublicCompanyBreadcrumbScript");
    expect(source).not.toMatch(/@prisma/);
    expect(source).not.toContain("prisma.");
    expect(source).not.toContain("SearchAction");
  });

  it("detail UI is a Server Component without Prisma", () => {
    const ui = fs.readFileSync(
      path.join(
        ROOT,
        "src/app/(public)/companies/[slug]/_components/public-company-detail.tsx",
      ),
      "utf8",
    );
    expect(ui).not.toContain("use client");
    expect(ui).not.toMatch(/@prisma/);
  });

  it("metadata has title, description, canonical from public company", () => {
    const company = sampleCompany();
    const meta = buildPageMetadata({
      ...buildPublicCompanyPageInput(company),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.title).toBe("اکمی");
    expect(meta.description).toContain("فناوری");
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/companies/acme",
    );
  });

  it("falls back to name-based description when empty", () => {
    const meta = buildPageMetadata({
      ...buildPublicCompanyPageInput(sampleCompany({ description: null })),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.description).toContain("اکمی");
  });

  it("emits BreadcrumbList JSON-LD for company detail (P12-007)", () => {
    const script = buildPublicCompanyBreadcrumbScript(sampleCompany(), {
      baseUrl: "https://computerjobs.ir",
    });
    expect(script).toBeTruthy();
    expect(JSON.parse(script!)["@type"]).toBe("BreadcrumbList");
  });
});
