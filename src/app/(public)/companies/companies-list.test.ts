/**
 * P12-005 — public `/companies` list guards.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPageMetadata } from "@/modules/seo/metadata";
import { companiesListSeoInput } from "@/app/(public)/companies/companies-list-seo";
import { parsePublicCompaniesQuery } from "@/app/(public)/companies/parse-public-companies-query";

const ROOT = process.cwd();
const PAGE = path.join(ROOT, "src/app/(public)/companies/page.tsx");

describe("P12-005 public companies list", () => {
  it("page exists under (public)/companies", () => {
    expect(fs.existsSync(PAGE)).toBe(true);
  });

  it("uses generateMetadata + buildPageMetadata + listPublicCompanies", () => {
    const source = fs.readFileSync(PAGE, "utf8");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("buildPageMetadata");
    expect(source).toContain("listPublicCompanies");
    expect(source).not.toMatch(/@prisma/);
    expect(source).not.toContain("prisma.");
    expect(source).not.toContain("SearchAction");
    expect(source).not.toContain("buildBreadcrumbJsonLd");
  });

  it("list UI has no Client Components, Prisma, or slug detail links", () => {
    const list = fs.readFileSync(
      path.join(
        ROOT,
        "src/app/(public)/companies/_components/public-companies-list.tsx",
      ),
      "utf8",
    );
    expect(list).not.toContain("use client");
    expect(list).not.toMatch(/@prisma/);
    expect(list).not.toContain("prisma.");
    expect(list).not.toMatch(/href=\{`\/companies\/\$\{/);
    expect(list).not.toMatch(/href=["']\/companies\//);
  });

  it("does not add company detail tree yet", () => {
    expect(
      fs.existsSync(path.join(ROOT, "src/app/(public)/companies/[slug]")),
    ).toBe(false);
  });

  it("metadata includes title, description, canonical without page", () => {
    const meta = buildPageMetadata({
      ...companiesListSeoInput(),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.title).toBe("شرکت‌ها");
    expect(meta.description).toBeTruthy();
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/companies",
    );
  });

  it("keeps page on canonical (C-011-6 self-canonical)", () => {
    const meta = buildPageMetadata({
      ...companiesListSeoInput({ page: "2", utm_source: "x" }),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/companies?page=2",
    );
  });

  it("parsePublicCompaniesQuery reads page and falls back on invalid", () => {
    expect(parsePublicCompaniesQuery({ page: "3" }).page).toBe(3);
    expect(parsePublicCompaniesQuery({ page: "0" }).page).toBeUndefined();
    expect(parsePublicCompaniesQuery({ page: "abc" }).page).toBeUndefined();
  });
});
