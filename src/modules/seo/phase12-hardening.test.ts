/**
 * P12-009 — Phase 12 hardening guards.
 * Tests only — does not change metadata, JSON-LD graphs, or live sitemap sources.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("@/modules/jobs/services/job.service", () => ({
  listPublicJobSlugsForSitemap: vi.fn(),
}));

vi.mock("@/modules/companies/services/company.service", () => ({
  listPublicCompanySlugsForSitemap: vi.fn(),
}));

import { listPublicJobSlugsForSitemap } from "@/modules/jobs/services/job.service";
import { listPublicCompanySlugsForSitemap } from "@/modules/companies/services/company.service";
import {
  buildPublicCompanyBreadcrumbScript,
} from "@/modules/companies/ui/public-company-seo";
import {
  buildPublicJobBreadcrumbScript,
  buildPublicJobPostingScript,
} from "@/modules/jobs/ui/public-job-seo";
import { buildHomeJsonLdScriptContents } from "@/modules/seo/pages/home";
import {
  buildPhase11Sitemap,
  collectSitemapEntries,
  isBlockedSitemapPath,
  type SitemapSource,
} from "@/modules/seo/sitemap";
import {
  buildBreadcrumbJsonLd,
  buildJobPostingJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/modules/seo/structured-data";
import { normalizePublicPath, SeoUrlError } from "@/modules/seo/urls";
import { staticPageBreadcrumbScript } from "@/app/(public)/_content/static-pages";
import type { PublicJob } from "@/modules/jobs/ui/load-public-job";
import type { PublicCompany } from "@/modules/companies/ui/load-public-company";

const ROOT = process.cwd();
const PUBLIC_ROOT = path.join(ROOT, "src/app/(public)");
const UUID = "550e8400-e29b-41d4-a716-446655440000";
const BASE = "https://computerjobs.ir";

beforeEach(() => {
  vi.mocked(listPublicJobSlugsForSitemap).mockResolvedValue([
    { slug: "senior-react", lastModified: new Date("2026-07-01T00:00:00.000Z") },
  ]);
  vi.mocked(listPublicCompanySlugsForSitemap).mockResolvedValue([
    { slug: "acme", lastModified: new Date("2026-07-01T00:00:00.000Z") },
  ]);
});

function walkTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

/** Map a sitemap path → whether a matching App Router page exists (C-012-2). */
function sitemapPathHasPage(sitemapPath: string): boolean {
  if (sitemapPath === "/") {
    return fs.existsSync(path.join(PUBLIC_ROOT, "page.tsx"));
  }

  const staticExact: Record<string, string> = {
    "/about": "about/page.tsx",
    "/contact": "contact/page.tsx",
    "/privacy": "privacy/page.tsx",
    "/terms": "terms/page.tsx",
    "/jobs": "jobs/page.tsx",
    "/companies": "companies/page.tsx",
  };
  if (staticExact[sitemapPath]) {
    return fs.existsSync(path.join(PUBLIC_ROOT, staticExact[sitemapPath]));
  }

  if (/^\/jobs\/[^/]+$/.test(sitemapPath)) {
    return fs.existsSync(path.join(PUBLIC_ROOT, "jobs/[slug]/page.tsx"));
  }
  if (/^\/companies\/[^/]+$/.test(sitemapPath)) {
    return fs.existsSync(path.join(PUBLIC_ROOT, "companies/[slug]/page.tsx"));
  }

  return false;
}

describe("P12-009 Public Route Guard — blocked from SEO inventory", () => {
  it.each([
    "/admin",
    "/admin/settings",
    "/dashboard",
    "/dashboard/overview",
    "/profile",
    "/profile/me",
    "/api",
    "/api/v1/jobs",
  ])("blocks %s from sitemap inventory", (p) => {
    expect(isBlockedSitemapPath(p)).toBe(true);
  });

  it("collectSitemapEntries drops non-public prefixes even if a source emits them", async () => {
    const rogue: SitemapSource = {
      id: "rogue-private",
      async listEntries() {
        return [
          { path: "/admin/users" },
          { path: "/dashboard" },
          { path: "/profile" },
          { path: "/api/v1/companies" },
          { path: "/jobs" },
        ];
      },
    };

    const entries = await collectSitemapEntries([rogue]);
    expect(entries.map((e) => e.path)).toEqual(["/jobs"]);
  });
});

describe("P12-009 UUID Guard — no public UUID SEO paths", () => {
  it("rejects /jobs/[uuid] and /companies/[uuid]", () => {
    expect(() => normalizePublicPath(`/jobs/${UUID}`)).toThrow(SeoUrlError);
    expect(() => normalizePublicPath(`/companies/${UUID}`)).toThrow(SeoUrlError);
  });

  it("skips UUID paths during sitemap collection", async () => {
    const rogue: SitemapSource = {
      id: "uuid-rogue",
      async listEntries() {
        return [
          { path: `/jobs/${UUID}` },
          { path: `/companies/${UUID}` },
          { path: "/jobs/senior-react" },
        ];
      },
    };

    const entries = await collectSitemapEntries([rogue]);
    expect(entries.map((e) => e.path)).toEqual(["/jobs/senior-react"]);
  });
});

describe("P12-009 Sitemap Honesty Guard — URL ⇒ page exists", () => {
  it("every Option 1 sitemap URL has a matching public page", async () => {
    const rows = await buildPhase11Sitemap({ baseUrl: BASE });
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      const pathname = new URL(row.url).pathname;
      expect(sitemapPathHasPage(pathname), `missing page for ${pathname}`).toBe(
        true,
      );
    }
  });

  it("does not invent soft-404 hub paths", async () => {
    const rows = await buildPhase11Sitemap({ baseUrl: BASE });
    const urls = rows.map((r) => r.url);
    for (const forbidden of [
      "/categories",
      "/locations",
      "/skills",
      "/technologies",
      "/admin",
      "/dashboard",
      "/profile",
      "/api",
    ]) {
      expect(urls.some((u) => u.includes(forbidden))).toBe(false);
    }
  });
});

describe("P12-009 SearchAction Guard", () => {
  it("Phase 11 JSON-LD builders never emit SearchAction", () => {
    const graphs = [
      buildOrganizationJsonLd({ name: "ComputerJobs.ir", baseUrl: BASE }),
      buildWebSiteJsonLd({ name: "ComputerJobs.ir", baseUrl: BASE }),
      buildBreadcrumbJsonLd({
        items: [
          { name: "خانه", path: "/" },
          { name: "شغل‌ها", path: "/jobs" },
        ],
        baseUrl: BASE,
      }),
      buildJobPostingJsonLd({
        title: "Job",
        description: "Desc",
        datePosted: "2026-07-01",
        hiringOrganizationName: "Acme",
        url: `${BASE}/jobs/x`,
      }),
    ];

    for (const graph of graphs) {
      const json = JSON.stringify(graph);
      expect(json).not.toContain("SearchAction");
      expect(json).not.toContain("potentialAction");
    }
  });

  it("public page JSON-LD wiring never emits SearchAction", () => {
    const job = {
      slug: "senior-react",
      title: "Senior React",
      description: "Public description",
      company: { slug: "acme", name: "Acme" },
      city: { slug: "tehran", nameFa: "تهران", provinceSlug: "tehran" },
      category: { slug: "software", nameFa: "نرم‌افزار" },
      subCategory: null,
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      skills: [],
      salary: undefined,
      publishedAt: new Date("2026-07-01T00:00:00.000Z"),
      expiresAt: new Date("2026-08-01T00:00:00.000Z"),
    } as PublicJob;

    const company: PublicCompany = {
      name: "Acme",
      slug: "acme",
      description: "Company",
      logoUrl: null,
      websiteUrl: null,
      employeeCountRange: null,
      industryLabel: null,
    };

    const payloads = [
      ...buildHomeJsonLdScriptContents({ baseUrl: BASE }),
      buildPublicJobPostingScript(job, { baseUrl: BASE }),
      buildPublicJobBreadcrumbScript(job, { baseUrl: BASE }),
      buildPublicCompanyBreadcrumbScript(company, { baseUrl: BASE }),
      staticPageBreadcrumbScript("about", { baseUrl: BASE }),
    ].filter(Boolean);

    for (const payload of payloads) {
      expect(payload).not.toContain("SearchAction");
      expect(payload).not.toContain("potentialAction");
    }
  });
});

describe("P12-009 Phase Boundary Guard — hubs stay out of sitemap", () => {
  it.each([
    "/categories",
    "/categories/software",
    "/locations",
    "/locations/tehran",
    "/skills",
    "/skills/react",
    "/technologies",
    "/technologies/nextjs",
  ])("blocks deferred hub path %s", (p) => {
    expect(isBlockedSitemapPath(p)).toBe(true);
  });

  it("deferred hub page trees are absent under src/app", () => {
    for (const rel of [
      "src/app/categories",
      "src/app/locations",
      "src/app/skills",
      "src/app/technologies",
      "src/app/(public)/categories",
      "src/app/(public)/locations",
      "src/app/(public)/skills",
      "src/app/(public)/technologies",
    ] as const) {
      expect(fs.existsSync(path.join(ROOT, rel)), rel).toBe(false);
    }
  });
});

describe("P12-009 no Prisma in public Client Components", () => {
  it("no (public) Client Component imports Prisma", () => {
    const files = walkTsFiles(PUBLIC_ROOT);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      if (!/^["']use client["']/m.test(source)) continue;
      expect(source, file).not.toMatch(/@prisma\/client/);
      expect(source, file).not.toMatch(/@\/modules\/shared\/prisma/);
      expect(source, file).not.toMatch(/PrismaClient/);
    }
  });
});
