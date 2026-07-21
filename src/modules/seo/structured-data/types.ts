/** Minimal JSON-LD object graph (schema.org). */
export type JsonLdObject = {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
};

export type OrganizationJsonLdInput = {
  name: string;
  url?: string;
  logoUrl?: string;
  sameAs?: string[];
  baseUrl?: string;
};

export type WebSiteJsonLdInput = {
  name: string;
  url?: string;
  description?: string;
  /** BCP 47 — default `fa-IR`. */
  inLanguage?: string;
  baseUrl?: string;
};

/**
 * Public job fields only (RFC-001 — no contact unlock data).
 * Missing required fields → builder returns `null`.
 */
export type JobPostingJsonLdInput = {
  title: string;
  description: string;
  datePosted: string;
  hiringOrganizationName: string;
  /** Absolute public job URL. */
  url: string;
  jobLocationName?: string;
  employmentType?: string;
  validThrough?: string;
};

export type BreadcrumbJsonLdItem = {
  name: string;
  /** Public path (normalized via canonical helpers). */
  path: string;
};

export type BreadcrumbJsonLdInput = {
  items: BreadcrumbJsonLdItem[];
  baseUrl?: string;
};
