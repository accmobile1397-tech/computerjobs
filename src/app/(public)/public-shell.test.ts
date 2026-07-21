/**
 * P12-001 — public route shell guards (CTO note).
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();

describe("P12-001 public route shell", () => {
  it("provides (public) layout with header and footer", () => {
    expect(
      fs.existsSync(path.join(ROOT, "src/app/(public)/layout.tsx")),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(ROOT, "src/app/(public)/_components/public-site-header.tsx"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(ROOT, "src/app/(public)/_components/public-site-footer.tsx"),
      ),
    ).toBe(true);
  });

  it("home lives under (public) with Phase 11 metadata builders (C-012-7)", () => {
    const home = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/page.tsx"),
      "utf8",
    );
    expect(home).toContain("generateMetadata");
    expect(home).toContain("buildHomeMetadata");
    expect(fs.existsSync(path.join(ROOT, "src/app/page.tsx"))).toBe(false);
  });

  it("layout has no Prisma or business/domain page routes yet", () => {
    const header = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/_components/public-site-header.tsx"),
      "utf8",
    );
    const footer = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/_components/public-site-footer.tsx"),
      "utf8",
    );
    const layout = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/layout.tsx"),
      "utf8",
    );
    for (const source of [header, footer, layout]) {
      expect(source).not.toMatch(/@prisma/);
      expect(source).not.toMatch(/href=["']\/jobs/);
      expect(source).not.toMatch(/href=["']\/companies/);
      expect(source).not.toMatch(/href=["']\/about/);
      expect(source).not.toMatch(/href=["']\/admin/);
      expect(source).not.toMatch(/href=["']\/dashboard/);
    }
  });

  it("does not add job/company/static page files yet", () => {
    for (const rel of [
      "src/app/(public)/jobs",
      "src/app/(public)/companies",
      "src/app/(public)/about",
      "src/app/(public)/contact",
      "src/app/(public)/terms",
      "src/app/(public)/privacy",
    ] as const) {
      expect(fs.existsSync(path.join(ROOT, rel)), rel).toBe(false);
    }
  });
});
