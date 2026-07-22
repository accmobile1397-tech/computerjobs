import { normalizePublicPath } from "@/modules/seo/urls";
import type { SitemapEntry, SitemapSource } from "@/modules/seo/sitemap/types";

/**
 * Live static public routes (P12-008 · C-012-2).
 * Only paths with real App Router pages under `(public)`.
 */
const LIVE_STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export const staticCoreSitemapSource: SitemapSource = {
  id: "static-core",
  async listEntries(): Promise<SitemapEntry[]> {
    return LIVE_STATIC_PATHS.map((path) => ({
      path: normalizePublicPath(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    }));
  },
};
