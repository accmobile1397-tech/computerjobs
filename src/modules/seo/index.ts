/**
 * SEO module public barrel.
 * P11-002: URL normalize + canonical (C-011-6).
 * Later tasks add metadata · structured-data · sitemap · robots.
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
