export type {
  BreadcrumbJsonLdInput,
  BreadcrumbJsonLdItem,
  JobPostingJsonLdInput,
  JsonLdObject,
  OrganizationJsonLdInput,
  WebSiteJsonLdInput,
} from "@/modules/seo/structured-data/types";
export { buildOrganizationJsonLd } from "@/modules/seo/structured-data/organization";
export { buildWebSiteJsonLd } from "@/modules/seo/structured-data/website";
export { buildJobPostingJsonLd } from "@/modules/seo/structured-data/job-posting";
export { buildBreadcrumbJsonLd } from "@/modules/seo/structured-data/breadcrumb";
export { serializeJsonLd } from "@/modules/seo/structured-data/serialize";
