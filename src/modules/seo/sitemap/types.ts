export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/** Internal sitemap entry — path only; absolute URL built at map time. */
export type SitemapEntry = {
  path: string;
  lastModified?: Date;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
};

/**
 * Source of live, indexable public URLs (RFC-006 §6 · C-011-2).
 * Must not emit soft-404 / unpublished / admin / api / auth paths.
 */
export interface SitemapSource {
  id: string;
  listEntries(): Promise<SitemapEntry[]>;
}
