import type { SitemapSource } from "@/modules/seo/sitemap/types";

/**
 * Domain sources still outside Option 1 — always empty (C-012-2 · C-012-4).
 * jobs-public / companies-public live in dedicated modules (P12-008).
 */
function emptySource(id: string): SitemapSource {
  return {
    id,
    async listEntries() {
      return [];
    },
  };
}

export const taxonomySitemapSource = emptySource("taxonomy");
export const locationsSitemapSource = emptySource("locations");
export const aiLandingsSitemapSource = emptySource("ai-landings");

export const phase12DeferredSitemapStubs: SitemapSource[] = [
  taxonomySitemapSource,
  locationsSitemapSource,
  aiLandingsSitemapSource,
];

/** @deprecated alias — deferred stubs only (jobs/companies moved out). */
export const phase11DomainSitemapStubs = phase12DeferredSitemapStubs;
