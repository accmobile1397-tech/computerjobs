import type { CanonicalSearchInput } from "@/modules/seo/canonical";

/**
 * Generic SEO page input (RFC-006 §4.1).
 * Domain-specific fields belong in later phases — not here.
 */
export type SeoPageInput = {
  /** fa-IR title without site suffix (root layout template applies). */
  title: string;
  /** fa-IR description; required non-empty when robots is index (default). */
  description: string;
  /** Public path (normalized via canonical helpers). */
  path: string;
  /** Optional query for self-canonical pagination (C-011-6). */
  search?: CanonicalSearchInput;
  robots?: "index" | "noindex";
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    images?: string[];
  };
  /** Override APP_URL (tests / explicit host). */
  baseUrl?: string;
};
