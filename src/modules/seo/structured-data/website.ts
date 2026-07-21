import { resolveAppBaseUrl } from "@/modules/seo/canonical";
import type {
  JsonLdObject,
  WebSiteJsonLdInput,
} from "@/modules/seo/structured-data/types";

/**
 * WebSite JSON-LD.
 *
 * **C-011-4:** Do **not** emit SearchAction / potentialAction until a public
 * search URL is live (deferred).
 */
export function buildWebSiteJsonLd(
  input: WebSiteJsonLdInput,
): JsonLdObject | null {
  const name = input.name.trim();
  if (!name) return null;

  const url = (input.url?.trim() || resolveAppBaseUrl(input.baseUrl)).replace(
    /\/+$/,
    "",
  );
  const description = input.description?.trim();
  const inLanguage = input.inLanguage?.trim() || "fa-IR";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    inLanguage,
    ...(description ? { description } : {}),
  };
}
