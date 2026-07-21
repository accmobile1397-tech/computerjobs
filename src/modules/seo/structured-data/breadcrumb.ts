import { buildCanonicalUrl } from "@/modules/seo/canonical";
import type {
  BreadcrumbJsonLdInput,
  JsonLdObject,
} from "@/modules/seo/structured-data/types";

/**
 * BreadcrumbList JSON-LD. Returns `null` if no valid items.
 */
export function buildBreadcrumbJsonLd(
  input: BreadcrumbJsonLdInput,
): JsonLdObject | null {
  const items = input.items
    .map((item) => ({
      name: item.name.trim(),
      path: item.path,
    }))
    .filter((item) => item.name.length > 0);

  if (items.length === 0) return null;

  const listItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: buildCanonicalUrl({ path: item.path, baseUrl: input.baseUrl }),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}
