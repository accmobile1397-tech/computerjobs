import { normalizePublicPath } from "@/modules/seo/urls";
import type { SitemapEntry, SitemapSource } from "@/modules/seo/sitemap/types";

/**
 * Already-rendered public static routes only.
 * Phase 11 live inventory: `/` (`src/app/page.tsx`).
 */
const LIVE_STATIC_PATHS = ["/"] as const;

export const staticCoreSitemapSource: SitemapSource = {
  id: "static-core",
  async listEntries(): Promise<SitemapEntry[]> {
    return LIVE_STATIC_PATHS.map((path) => ({
      path: normalizePublicPath(path),
      changeFrequency: "weekly" as const,
      priority: 1,
    }));
  },
};
