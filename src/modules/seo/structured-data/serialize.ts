import type { JsonLdObject } from "@/modules/seo/structured-data/types";

/** Serialize a JSON-LD graph for `<script type="application/ld+json">`. */
export function serializeJsonLd(graph: JsonLdObject): string {
  return JSON.stringify(graph);
}
