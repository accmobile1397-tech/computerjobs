/**
 * SEO module public barrel.
 * P11-002: URL normalize + canonical (C-011-6).
 * P11-003: metadata builders.
 * P11-004: JSON-LD structured-data builders (separate from metadata).
 * P11-005: sitemap sources + thin App Router adapter.
 * P11-006: robots SoT (C-011-5).
 * P11-007: home (`/`) metadata + JSON-LD wiring.
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
export {
  ROBOTS_DISALLOW_PATHS,
  buildRobotsConfig,
  type RobotsConfig,
} from "@/modules/seo/robots";
export {
  buildHomeJsonLdGraphs,
  buildHomeJsonLdScriptContents,
  buildHomeMetadata,
} from "@/modules/seo/pages";
