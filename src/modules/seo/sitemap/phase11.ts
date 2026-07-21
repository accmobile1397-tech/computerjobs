import { phase11DomainSitemapStubs } from "@/modules/seo/sitemap/domain-stubs";
import { staticCoreSitemapSource } from "@/modules/seo/sitemap/static-core";
import type { SitemapSource } from "@/modules/seo/sitemap/types";
import {
  collectSitemapEntries,
  toNextSitemapEntries,
} from "@/modules/seo/sitemap/collect";

/** Default Phase 11 sources — live static-core + empty domain stubs. */
export function getPhase11SitemapSources(): SitemapSource[] {
  return [staticCoreSitemapSource, ...phase11DomainSitemapStubs];
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
