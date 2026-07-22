/**
 * Phase 11 hardening (P11-009) — static + behavioral guards for RFC-006 / C-011-1..6.
 * Does not change metadata, JSON-LD, sitemap, or robots implementations.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildCanonicalUrl } from "@/modules/seo/canonical";
import { buildHomeJsonLdScriptContents } from "@/modules/seo/pages/home";
import { buildRobotsConfig } from "@/modules/seo/robots";
import {
  buildPhase11Sitemap,
  getPhase11SitemapSources,
  jobsPublicSitemapSource,
  staticCoreSitemapSource,
} from "@/modules/seo/sitemap";
import { buildWebSiteJsonLd } from "@/modules/seo/structured-data";
import { normalizePublicPath, SeoUrlError } from "@/modules/seo/urls";

const ROOT = process.cwd();
const SEO_ROOT = path.join(ROOT, "src/modules/seo");

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

const BANNED_SEO_IMPORTS = [
  /from ["']@prisma\/client["']/,
  /from ["']@\/modules\/shared\/prisma/,
  /PrismaClient/,
  /\$queryRaw/,
  /\$executeRaw/,
];

const FORBIDDEN_PUBLIC_SSR_PAGES = [
  "src/app/jobs",
  "src/app/companies",
  "src/app/locations",
  "src/app/categories",
  "src/app/skills",
  "src/app/technologies",
] as const;

describe("P11-009 seo module never touches Prisma", () => {
  it("has zero Prisma / DB imports under src/modules/seo", () => {
    const files = walkTsFiles(SEO_ROOT);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of BANNED_SEO_IMPORTS) {
        expect(source, `${file} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("home page and App Router SEO adapters have no Prisma imports", () => {
    for (const rel of [
      "src/app/(public)/page.tsx",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
    ] as const) {
      const source = fs.readFileSync(path.join(ROOT, rel), "utf8");
      for (const pattern of BANNED_SEO_IMPORTS) {
        expect(source, `${rel} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("seo module has no Client Components", () => {
    const files = walkTsFiles(SEO_ROOT);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/^["']use client["']/m);
    }
  });
});

describe("P11-009 no SEO Prisma migrations", () => {
  it("prisma/migrations has no seo-named migration folders", () => {
    const migrationsDir = path.join(ROOT, "prisma/migrations");
    if (!fs.existsSync(migrationsDir)) return;
    const names = fs.readdirSync(migrationsDir);
    expect(names.some((n) => /seo/i.test(n))).toBe(false);
  });
});

describe("P11-009 C-011-1 RFC-006 frozen", () => {
  it("RFC-006 status is FROZEN / APPROVED WITH CONDITIONS", () => {
    const rfc = fs.readFileSync(
      path.join(ROOT, "docs/rfc/RFC-006-SEO-ARCHITECTURE.md"),
      "utf8",
    );
    expect(rfc).toMatch(/FROZEN/);
    expect(rfc).toMatch(/D-056/);
  });
});

describe("P11-009 C-011-2 sitemap honesty", () => {
  it("Phase 11 sitemap emits only live /", async () => {
    const rows = await buildPhase11Sitemap({
      baseUrl: "https://computerjobs.ir",
    });
    expect(rows.map((r) => r.url)).toEqual(["https://computerjobs.ir/"]);
  });

  it("domain stubs are empty and static-core is / only", async () => {
    expect(await jobsPublicSitemapSource.listEntries()).toEqual([]);
    expect((await staticCoreSitemapSource.listEntries()).map((e) => e.path)).toEqual([
      "/",
    ]);
    const ids = getPhase11SitemapSources().map((s) => s.id);
    expect(ids).toContain("static-core");
    expect(ids).toContain("jobs-public");
  });
});

describe("P11-009 C-011-3 no Phase 12 domain SSR pages", () => {
  it("forbidden public SSR page trees do not exist", () => {
    for (const rel of FORBIDDEN_PUBLIC_SSR_PAGES) {
      expect(fs.existsSync(path.join(ROOT, rel)), rel).toBe(false);
    }
  });

  it("public pages outside admin are Option 1 inventory under (public)", () => {
    const appPages: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "(admin)") continue;
          walk(full);
        } else if (entry.name === "page.tsx") {
          appPages.push(path.relative(ROOT, full).replace(/\\/g, "/"));
        }
      }
    }
    walk(path.join(ROOT, "src/app"));
    expect(appPages.sort()).toEqual(
      [
        "src/app/(public)/about/page.tsx",
        "src/app/(public)/companies/page.tsx",
        "src/app/(public)/contact/page.tsx",
        "src/app/(public)/jobs/[slug]/page.tsx",
        "src/app/(public)/jobs/page.tsx",
        "src/app/(public)/page.tsx",
        "src/app/(public)/privacy/page.tsx",
        "src/app/(public)/terms/page.tsx",
      ].sort(),
    );
  });
});

describe("P11-009 C-011-4 no SearchAction", () => {
  it("WebSite builder and home wiring omit SearchAction", () => {
    const website = buildWebSiteJsonLd({
      name: "ComputerJobs.ir",
      baseUrl: "https://computerjobs.ir",
    });
    expect(JSON.stringify(website)).not.toContain("SearchAction");
    expect(JSON.stringify(website)).not.toContain("potentialAction");

    const home = buildHomeJsonLdScriptContents({
      baseUrl: "https://computerjobs.ir",
    }).join("\n");
    expect(home).not.toContain("SearchAction");
    expect(home).not.toContain("potentialAction");
  });
});

describe("P11-009 C-011-5 single robots SoT", () => {
  it("app/robots.ts exists and public/robots.txt does not", () => {
    expect(fs.existsSync(path.join(ROOT, "src/app/robots.ts"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "public/robots.txt"))).toBe(false);
  });

  it("robots config advertises live sitemap.xml", () => {
    const config = buildRobotsConfig({ baseUrl: "https://computerjobs.ir" });
    expect(config.sitemap).toBe("https://computerjobs.ir/sitemap.xml");
    expect(config.rules.disallow).toEqual(
      expect.arrayContaining([
        "/admin/",
        "/api/",
        "/login",
        "/register",
        "/dashboard/",
      ]),
    );
  });
});

describe("P11-009 C-011-6 self-canonical pagination", () => {
  it("keeps page on canonical and does not collapse page=2 to page=1", () => {
    const base = "https://computerjobs.ir";
    const page2 = buildCanonicalUrl({
      path: "/jobs",
      search: { page: "2", utm_source: "x" },
      baseUrl: base,
    });
    const page1 = buildCanonicalUrl({
      path: "/jobs",
      search: { page: "1" },
      baseUrl: base,
    });
    expect(page2).toBe("https://computerjobs.ir/jobs?page=2");
    expect(page1).toBe("https://computerjobs.ir/jobs?page=1");
    expect(page2).not.toBe(page1);
  });
});

describe("P11-009 RFC-006 URL invariants", () => {
  it("rejects UUID path segments on public SEO helpers", () => {
    expect(() =>
      normalizePublicPath("/jobs/550e8400-e29b-41d4-a716-446655440000"),
    ).toThrow(SeoUrlError);
  });

  it("seo logic is not under src/lib/", () => {
    expect(fs.existsSync(path.join(ROOT, "src/lib/seo"))).toBe(false);
    expect(fs.existsSync(SEO_ROOT)).toBe(true);
  });
});
