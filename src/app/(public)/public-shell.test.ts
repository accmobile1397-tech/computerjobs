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

  it("layout has no Prisma or premature company links", () => {
    const header = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/_components/public-site-header.tsx"),
      "utf8",
    );
    const layout = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/layout.tsx"),
      "utf8",
    );
    for (const source of [header, layout]) {
      expect(source).not.toMatch(/@prisma/);
      expect(source).not.toMatch(/href=["']\/companies/);
      expect(source).not.toMatch(/href=["']\/admin/);
      expect(source).not.toMatch(/href=["']\/dashboard/);
    }
  });

  it("does not add company trees yet", () => {
    expect(
      fs.existsSync(path.join(ROOT, "src/app/(public)/companies")),
    ).toBe(false);
  });
});
