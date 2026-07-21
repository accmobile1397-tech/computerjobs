import type { SitemapSource } from "@/modules/seo/sitemap/types";

/**
 * Domain sources reserved for Phase 12+.
 * Always empty until real public SSR pages exist (C-011-2 · C-011-3).
 */
function emptySource(id: string): SitemapSource {
  return {
    id,
    async listEntries() {
      return [];
    },
  };
}

export const jobsPublicSitemapSource = emptySource("jobs-public");
export const companiesPublicSitemapSource = emptySource("companies-public");
export const taxonomySitemapSource = emptySource("taxonomy");
export const locationsSitemapSource = emptySource("locations");
export const aiLandingsSitemapSource = emptySource("ai-landings");

export const phase11DomainSitemapStubs: SitemapSource[] = [
  jobsPublicSitemapSource,
  companiesPublicSitemapSource,
  taxonomySitemapSource,
  locationsSitemapSource,
  aiLandingsSitemapSource,
];
