/**
 * P12-001 — public route shell guards.
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

  it("home lives under (public) and uses generateMetadata (C-012-7)", () => {
    const home = fs.readFileSync(
      path.join(ROOT, "src/app/(public)/page.tsx"),
      "utf8",
    );
    expect(home).toContain("generateMetadata");
    expect(home).toContain("buildHomeMetadata");
    expect(fs.existsSync(path.join(ROOT, "src/app/page.tsx"))).toBe(false);
  });

  it("public shell has no admin/dashboard/profile routes (C-012-10)", () => {
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
      expect(source).not.toMatch(/href=["']\/admin/);
      expect(source).not.toMatch(/href=["']\/dashboard/);
      expect(source).not.toMatch(/href=["']\/profile/);
      expect(source).not.toMatch(/@prisma/);
    }
  });
});
