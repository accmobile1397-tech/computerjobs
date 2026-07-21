/**
 * P12-003 — public `/jobs` list guards.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPageMetadata } from "@/modules/seo/metadata";
import { jobsListSeoInput } from "@/app/(public)/jobs/jobs-list-seo";
import { parsePublicJobsQuery } from "@/app/(public)/jobs/parse-public-jobs-query";

const ROOT = process.cwd();
const PAGE = path.join(ROOT, "src/app/(public)/jobs/page.tsx");

describe("P12-003 public jobs list", () => {
  it("page exists under (public)/jobs", () => {
    expect(fs.existsSync(PAGE)).toBe(true);
  });

  it("uses generateMetadata + buildPageMetadata + listPublicJobs", () => {
    const source = fs.readFileSync(PAGE, "utf8");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("buildPageMetadata");
    expect(source).toContain("listPublicJobs");
    expect(source).not.toMatch(/@prisma/);
    expect(source).not.toContain("prisma.");
    expect(source).not.toContain("SearchAction");
    expect(source).not.toContain("JobPosting");
    expect(source).not.toContain("buildJobPosting");
  });

  it("list UI has no Client Components and no Prisma", () => {
    const list = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/jobs/_components/public-jobs-list.tsx"),
      "utf8",
    );
    expect(list).not.toContain("use client");
    expect(list).not.toMatch(/@prisma/);
    expect(list).not.toContain("prisma.");
  });

  it("metadata includes title, description, canonical without page", () => {
    const meta = buildPageMetadata({
      ...jobsListSeoInput(),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.title).toBe("فرصت‌های شغلی");
    expect(meta.description).toBeTruthy();
    expect(meta.alternates?.canonical).toBe("https://computerjobs.ir/jobs");
  });

  it("keeps page on canonical (C-011-6 self-canonical)", () => {
    const meta = buildPageMetadata({
      ...jobsListSeoInput({ page: "2", utm_source: "x" }),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/jobs?page=2",
    );
  });

  it("parsePublicJobsQuery reads page and falls back on invalid", () => {
    expect(parsePublicJobsQuery({ page: "3" }).page).toBe(3);
    expect(parsePublicJobsQuery({ page: "0" }).page).toBeUndefined();
    expect(parsePublicJobsQuery({ page: "abc" }).page).toBeUndefined();
  });
});
