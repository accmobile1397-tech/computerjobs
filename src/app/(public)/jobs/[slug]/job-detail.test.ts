/**
 * P12-004 — public `/jobs/[slug]` guards + SEO mapping.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPageMetadata } from "@/modules/seo/metadata";
import {
  buildPublicJobPageInput,
  buildPublicJobPostingScript,
} from "@/modules/jobs/ui/public-job-seo";
import type { PublicJob } from "@/modules/jobs/ui/load-public-job";

const ROOT = process.cwd();
const PAGE = path.join(ROOT, "src/app/(public)/jobs/[slug]/page.tsx");

function sampleJob(overrides: Partial<PublicJob> = {}): PublicJob {
  return {
    slug: "senior-react",
    title: "توسعه‌دهنده Senior React",
    description: "توضیح عمومی آگهی برای متخصصان فرانت‌اند.",
    company: { slug: "acme", name: "اکمی" },
    city: { slug: "tehran", nameFa: "تهران", provinceSlug: "tehran" },
    category: { slug: "software", nameFa: "نرم‌افزار" },
    subCategory: null,
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    skills: [{ slug: "react", nameFa: "ری‌اکت" }],
    salary: undefined,
    publishedAt: new Date("2026-07-01T10:00:00.000Z"),
    expiresAt: new Date("2026-08-01T10:00:00.000Z"),
    ...overrides,
  } as PublicJob;
}

describe("P12-004 public job detail", () => {
  it("page exists under (public)/jobs/[slug]", () => {
    expect(fs.existsSync(PAGE)).toBe(true);
  });

  it("uses generateMetadata, notFound, JobPosting builder, no Prisma", () => {
    const source = fs.readFileSync(PAGE, "utf8");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("buildPageMetadata");
    expect(source).toContain("notFound");
    expect(source).toContain("loadPublicJobBySlug");
    expect(source).toContain("buildPublicJobPostingScript");
    expect(source).not.toMatch(/@prisma/);
    expect(source).not.toContain("prisma.");
    expect(source).not.toContain("SearchAction");
    expect(source).not.toContain("buildBreadcrumbJsonLd");
  });

  it("detail UI is a Server Component without Prisma", () => {
    const ui = fs.readFileSync(
      path.join(
        ROOT,
        "src/app/(public)/jobs/[slug]/_components/public-job-detail.tsx",
      ),
      "utf8",
    );
    expect(ui).not.toContain("use client");
    expect(ui).not.toMatch(/@prisma/);
  });

  it("metadata has title, description, canonical from public job", () => {
    const job = sampleJob();
    const meta = buildPageMetadata({
      ...buildPublicJobPageInput(job),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.title).toBe(job.title);
    expect(meta.description).toContain("توضیح عمومی");
    expect(meta.alternates?.canonical).toBe(
      "https://computerjobs.ir/jobs/senior-react",
    );
  });

  it("emits JobPosting JSON-LD for published public job (C-012-9)", () => {
    const script = buildPublicJobPostingScript(sampleJob(), {
      baseUrl: "https://computerjobs.ir",
    });
    expect(script).toBeTruthy();
    const graph = JSON.parse(script!);
    expect(graph["@type"]).toBe("JobPosting");
    expect(graph.url).toBe("https://computerjobs.ir/jobs/senior-react");
    expect(graph.hiringOrganization).toMatchObject({
      "@type": "Organization",
      name: "اکمی",
    });
  });

  it("omits JobPosting JSON-LD when required fields missing", () => {
    const script = buildPublicJobPostingScript(
      sampleJob({ description: "   ", publishedAt: null }),
      { baseUrl: "https://computerjobs.ir" },
    );
    expect(script).toBeNull();
  });
});
