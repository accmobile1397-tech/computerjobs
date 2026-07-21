/**
 * P12-002 — static public pages guards.
 */
import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { buildPageMetadata } from "@/modules/seo/metadata";
import {
  STATIC_PAGES,
  staticPageSeoInput,
  type StaticPageId,
} from "@/app/(public)/_content/static-pages";

const ROOT = process.cwd();
const IDS: StaticPageId[] = ["about", "contact", "privacy", "terms"];

describe("P12-002 static pages", () => {
  it.each(IDS)("%s page exists under (public)", (id) => {
    expect(
      fs.existsSync(path.join(ROOT, `src/app/(public)/${id}/page.tsx`)),
    ).toBe(true);
  });

  it.each(IDS)("%s uses generateMetadata + buildPageMetadata", (id) => {
    const source = fs.readFileSync(
      path.join(ROOT, `src/app/(public)/${id}/page.tsx`),
      "utf8",
    );
    expect(source).toContain("generateMetadata");
    expect(source).toContain("buildPageMetadata");
    expect(source).not.toMatch(/@prisma/);
    expect(source).not.toContain("SearchAction");
  });

  it.each(IDS)("%s metadata has title, description, canonical", (id) => {
    const def = STATIC_PAGES[id];
    const meta = buildPageMetadata({
      ...staticPageSeoInput(id),
      baseUrl: "https://computerjobs.ir",
    });
    expect(meta.title).toBe(def.title);
    expect(meta.description).toBe(def.description);
    expect(meta.alternates?.canonical).toBe(
      `https://computerjobs.ir${def.path}`,
    );
    expect(meta.robots).toEqual({ index: true, follow: true });
  });
});
