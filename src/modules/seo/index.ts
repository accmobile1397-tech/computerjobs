/**
 * SEO module public barrel.
 * P11-002: URL normalize + canonical (C-011-6).
 * P11-003: metadata builders.
 * P11-004: JSON-LD structured-data builders (separate from metadata).
 * P11-005: sitemap sources + thin App Router adapter.
 */
export {
  SeoUrlError,
  normalizePublicPath,
  isTrackingQueryParam,
  stripTrackingQueryParams,
} from "@/modules/seo/urls";
export {
  buildCanonicalQuery,
  buildCanonicalUrl,
  resolveAppBaseUrl,
  type CanonicalSearchInput,
} from "@/modules/seo/canonical";
export {
  buildPageMetadata,
  SeoMetadataError,
  type SeoPageInput,
} from "@/modules/seo/metadata";
export {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildJobPostingJsonLd,
  buildBreadcrumbJsonLd,
  serializeJsonLd,
  type JsonLdObject,
  type OrganizationJsonLdInput,
  type WebSiteJsonLdInput,
  type JobPostingJsonLdInput,
  type BreadcrumbJsonLdInput,
  type BreadcrumbJsonLdItem,
} from "@/modules/seo/structured-data";
export {
  buildPhase11Sitemap,
  collectSitemapEntries,
  getPhase11SitemapSources,
  staticCoreSitemapSource,
  type SitemapEntry,
  type SitemapSource,
} from "@/modules/seo/sitemap";
