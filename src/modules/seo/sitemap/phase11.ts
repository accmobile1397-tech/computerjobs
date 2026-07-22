import { companiesPublicSitemapSource } from "@/modules/seo/sitemap/companies-public";
import { phase12DeferredSitemapStubs } from "@/modules/seo/sitemap/domain-stubs";
import { jobsPublicSitemapSource } from "@/modules/seo/sitemap/jobs-public";
import { staticCoreSitemapSource } from "@/modules/seo/sitemap/static-core";
import type { SitemapSource } from "@/modules/seo/sitemap/types";
import {
  collectSitemapEntries,
  toNextSitemapEntries,
} from "@/modules/seo/sitemap/collect";

/**
 * Public sitemap sources (Phase 11 mechanism · Phase 12 Option 1 inventory).
 * Taxonomy / locations / AI landings remain empty stubs.
 */
export function getPhase11SitemapSources(): SitemapSource[] {
  return [
    staticCoreSitemapSource,
    jobsPublicSitemapSource,
    companiesPublicSitemapSource,
    ...phase12DeferredSitemapStubs,
  ];
}

/**
 * Build absolute sitemap rows for App Router `sitemap.ts`.
 */
export async function buildPhase11Sitemap(options?: {
  baseUrl?: string;
}): Promise<
  Array<{
    url: string;
    lastModified?: Date;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
  }>
> {
  const entries = await collectSitemapEntries(getPhase11SitemapSources());
  return toNextSitemapEntries(entries, options);
}
