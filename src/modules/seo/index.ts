/**
 * SEO module public barrel.
 * P11-002: URL normalize + canonical (C-011-6).
 * P11-003: metadata builders.
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
