import { resolveAppBaseUrl } from "@/modules/seo/canonical";
import type {
  JsonLdObject,
  OrganizationJsonLdInput,
} from "@/modules/seo/structured-data/types";

/**
 * Organization JSON-LD. Returns `null` if `name` is missing.
 */
export function buildOrganizationJsonLd(
  input: OrganizationJsonLdInput,
): JsonLdObject | null {
  const name = input.name.trim();
  if (!name) return null;

  const url = (input.url?.trim() || resolveAppBaseUrl(input.baseUrl)).replace(
    /\/+$/,
    "",
  );
  const logoUrl = input.logoUrl?.trim();
  const sameAs = input.sameAs?.map((s) => s.trim()).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
  };
}
